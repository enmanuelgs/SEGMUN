using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class CalificacionService(
    ICalificacionRepository           calificacionRepository,
    ICalificacionEvaluadorRepository  evaluadorRepository,
    IComisionDelegadoRepository       delegadoRepository,
    IVoluntarioComisionRepository     mesaRepository,
    IParticipanteRepository           participanteRepository) : ICalificacionService
{
    // ── GET ─────────────────────────────────────────────────────────────────────
    public async Task<CalificacionResponseDto?> GetByParticipanteIdAsync(int idParticipante, int idVoluntario)
    {
        if (!await participanteRepository.ExistsAsync(idParticipante)) return null;

        // Calificaciones propias del evaluador
        var propias = await evaluadorRepository.GetByParticipanteAndVoluntarioAsync(idParticipante, idVoluntario);

        // Contexto de comisión y mesa directiva
        var (rol, mesa, evaluadores) = await ObtenerContextoAsync(idParticipante, idVoluntario);

        // Calcular ponderada
        var ponderada = CalcularPonderada(idParticipante, evaluadores, mesa);

        return BuildDto(idParticipante, propias, ponderada, rol);
    }

    // ── PUT ─────────────────────────────────────────────────────────────────────
    public async Task<CalificacionResponseDto?> UpdateAsync(int idParticipante, int idVoluntario, EditarCalificacionDto dto)
    {
        if (!await participanteRepository.ExistsAsync(idParticipante)) return null;

        var (rol, mesa, _) = await ObtenerContextoAsync(idParticipante, idVoluntario);

        // EyC no puede calificar
        if (rol == "EyC")
            throw new InvalidOperationException("El Evaluación y Control (EyC) no coloca calificaciones.");

        // Guardar calificaciones del evaluador
        var calEval = await evaluadorRepository.GetByParticipanteAndVoluntarioAsync(idParticipante, idVoluntario)
            ?? new CalificacionEvaluador { IdParticipante = idParticipante, IdVoluntario = idVoluntario };

        calEval.InvestigacionAcademica = dto.InvestigacionAcademica ?? calEval.InvestigacionAcademica;
        calEval.PensamientoCritico     = dto.PensamientoCritico     ?? calEval.PensamientoCritico;
        calEval.Oratoria               = dto.Oratoria               ?? calEval.Oratoria;
        calEval.Argumentacion          = dto.Argumentacion          ?? calEval.Argumentacion;
        calEval.Redaccion              = dto.Redaccion              ?? calEval.Redaccion;
        calEval.Negociacion            = dto.Negociacion            ?? calEval.Negociacion;
        calEval.ResolucionConflictos   = dto.ResolucionConflictos   ?? calEval.ResolucionConflictos;
        calEval.Liderazgo              = dto.Liderazgo              ?? calEval.Liderazgo;
        calEval.Colaboracion           = dto.Colaboracion           ?? calEval.Colaboracion;

        await evaluadorRepository.UpsertAsync(calEval);

        // Recalcular ponderada con todos los evaluadores actualizados
        var todosEvaluadores = await evaluadorRepository.GetByParticipanteAsync(idParticipante);
        var ponderada = CalcularPonderada(idParticipante, todosEvaluadores, mesa);

        // Persistir ponderada en la tabla calificaciones (para export/ranking)
        await GuardarPonderadaAgregadaAsync(idParticipante, ponderada);

        return BuildDto(idParticipante, calEval, ponderada, rol);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private async Task<(string? rol, VoluntarioComision? mesa, IEnumerable<CalificacionEvaluador> evaluadores)>
        ObtenerContextoAsync(int idParticipante, int idVoluntario)
    {
        // Buscar comisión del participante
        var delegado = await delegadoRepository.GetByParticipanteAsync(idParticipante);
        if (delegado is null) return (null, null, []);

        var mesa = await mesaRepository.GetByComisionAsync(delegado.IdComision);
        if (mesa is null) return (null, null, []);

        // Determinar rol del voluntario actual
        string? rol = null;
        if (mesa.IdDirector == idVoluntario) rol = "Director";
        else if (mesa.IdAdjunto1 == idVoluntario) rol = "Adjunto1";
        else if (mesa.IdAdjunto2 == idVoluntario) rol = "Adjunto2";
        else if (mesa.IdEyC == idVoluntario) rol = "EyC";

        // Obtener calificaciones de todos los evaluadores del participante
        var evaluadores = await evaluadorRepository.GetByParticipanteAsync(idParticipante);
        return (rol, mesa, evaluadores);
    }

    private static PonderadaResult CalcularPonderada(
        int idParticipante,
        IEnumerable<CalificacionEvaluador> evaluadores,
        VoluntarioComision? mesa)
    {
        // Solo cuentan Director, Adjunto1, Adjunto2 (no EyC)
        var ids = new HashSet<int>();
        if (mesa?.IdDirector != null) ids.Add(mesa.IdDirector.Value);
        if (mesa?.IdAdjunto1 != null) ids.Add(mesa.IdAdjunto1.Value);
        if (mesa?.IdAdjunto2 != null) ids.Add(mesa.IdAdjunto2.Value);

        // Filtrar solo los evaluadores con rol de mesa directiva (no EyC)
        var relevantes = evaluadores.Where(e => ids.Count == 0 || ids.Contains(e.IdVoluntario)).ToList();

        static decimal? Avg(IEnumerable<short?> values)
        {
            var v = values.Where(x => x.HasValue).Select(x => (decimal)x!.Value).ToList();
            return v.Count > 0 ? Math.Round(v.Average(), 2) : null;
        }

        var r = new PonderadaResult
        {
            InvestigacionAcademica = Avg(relevantes.Select(e => e.InvestigacionAcademica)),
            PensamientoCritico     = Avg(relevantes.Select(e => e.PensamientoCritico)),
            Oratoria               = Avg(relevantes.Select(e => e.Oratoria)),
            Argumentacion          = Avg(relevantes.Select(e => e.Argumentacion)),
            Redaccion              = Avg(relevantes.Select(e => e.Redaccion)),
            Negociacion            = Avg(relevantes.Select(e => e.Negociacion)),
            ResolucionConflictos   = Avg(relevantes.Select(e => e.ResolucionConflictos)),
            Liderazgo              = Avg(relevantes.Select(e => e.Liderazgo)),
            Colaboracion           = Avg(relevantes.Select(e => e.Colaboracion)),
        };

        r.Total = (r.InvestigacionAcademica ?? 0) + (r.PensamientoCritico ?? 0) +
                  (r.Oratoria ?? 0) + (r.Argumentacion ?? 0) + (r.Redaccion ?? 0) +
                  (r.Negociacion ?? 0) + (r.ResolucionConflictos ?? 0) +
                  (r.Liderazgo ?? 0) + (r.Colaboracion ?? 0);
        return r;
    }

    private async Task GuardarPonderadaAgregadaAsync(int idParticipante, PonderadaResult p)
    {
        var cal = await calificacionRepository.GetByParticipanteIdAsync(idParticipante)
            ?? new Calificacion { IdParticipante = idParticipante };

        // Guardar ponderada redondeada como short (para export/ranking)
        cal.InvestigacionAcademica = p.InvestigacionAcademica.HasValue ? (short)Math.Round(p.InvestigacionAcademica.Value) : null;
        cal.PensamientoCritico     = p.PensamientoCritico.HasValue     ? (short)Math.Round(p.PensamientoCritico.Value)     : null;
        cal.Oratoria               = p.Oratoria.HasValue               ? (short)Math.Round(p.Oratoria.Value)               : null;
        cal.Argumentacion          = p.Argumentacion.HasValue          ? (short)Math.Round(p.Argumentacion.Value)          : null;
        cal.Redaccion              = p.Redaccion.HasValue              ? (short)Math.Round(p.Redaccion.Value)              : null;
        cal.Negociacion            = p.Negociacion.HasValue            ? (short)Math.Round(p.Negociacion.Value)            : null;
        cal.ResolucionConflictos   = p.ResolucionConflictos.HasValue   ? (short)Math.Round(p.ResolucionConflictos.Value)   : null;
        cal.Liderazgo              = p.Liderazgo.HasValue              ? (short)Math.Round(p.Liderazgo.Value)              : null;
        cal.Colaboracion           = p.Colaboracion.HasValue           ? (short)Math.Round(p.Colaboracion.Value)           : null;

        await calificacionRepository.UpsertAsync(cal);
    }

    private static CalificacionResponseDto BuildDto(
        int idParticipante,
        CalificacionEvaluador? propias,
        PonderadaResult ponderada,
        string? rol)
    {
        return new CalificacionResponseDto
        {
            IdParticipante         = idParticipante,
            InvestigacionAcademica = propias?.InvestigacionAcademica,
            PensamientoCritico     = propias?.PensamientoCritico,
            Oratoria               = propias?.Oratoria,
            Argumentacion          = propias?.Argumentacion,
            Redaccion              = propias?.Redaccion,
            Negociacion            = propias?.Negociacion,
            ResolucionConflictos   = propias?.ResolucionConflictos,
            Liderazgo              = propias?.Liderazgo,
            Colaboracion           = propias?.Colaboracion,
            Total = (propias?.InvestigacionAcademica ?? 0) + (propias?.PensamientoCritico ?? 0) +
                    (propias?.Oratoria ?? 0) + (propias?.Argumentacion ?? 0) +
                    (propias?.Redaccion ?? 0) + (propias?.Negociacion ?? 0) +
                    (propias?.ResolucionConflictos ?? 0) + (propias?.Liderazgo ?? 0) +
                    (propias?.Colaboracion ?? 0),

            PonderadaInvestigacionAcademica = ponderada.InvestigacionAcademica,
            PonderadaPensamientoCritico     = ponderada.PensamientoCritico,
            PonderadaOratoria               = ponderada.Oratoria,
            PonderadaArgumentacion          = ponderada.Argumentacion,
            PonderadaRedaccion              = ponderada.Redaccion,
            PonderadaNegociacion            = ponderada.Negociacion,
            PonderadaResolucionConflictos   = ponderada.ResolucionConflictos,
            PonderadaLiderazgo              = ponderada.Liderazgo,
            PonderadaColaboracion           = ponderada.Colaboracion,
            PonderadaTotal                  = ponderada.Total,

            RolEnComision = rol,
            EsEvaluador   = rol is "Director" or "Adjunto1" or "Adjunto2",
        };
    }

    private record PonderadaResult
    {
        public decimal? InvestigacionAcademica { get; set; }
        public decimal? PensamientoCritico     { get; set; }
        public decimal? Oratoria               { get; set; }
        public decimal? Argumentacion          { get; set; }
        public decimal? Redaccion              { get; set; }
        public decimal? Negociacion            { get; set; }
        public decimal? ResolucionConflictos   { get; set; }
        public decimal? Liderazgo              { get; set; }
        public decimal? Colaboracion           { get; set; }
        public decimal  Total                  { get; set; }
    }
}
