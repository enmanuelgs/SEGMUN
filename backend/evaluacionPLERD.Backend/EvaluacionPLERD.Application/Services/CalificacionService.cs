using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class CalificacionService(
    ICalificacionRepository calificacionRepository,
    IParticipanteRepository participanteRepository) : ICalificacionService
{
    public async Task<CalificacionResponseDto?> GetByParticipanteIdAsync(int idParticipante)
    {
        var cal = await calificacionRepository.GetByParticipanteIdAsync(idParticipante);
        return cal is null ? null : ToDto(cal);
    }

    public async Task<CalificacionResponseDto?> UpdateAsync(int idParticipante, EditarCalificacionDto dto)
    {
        if (!await participanteRepository.ExistsAsync(idParticipante)) return null;

        var cal = await calificacionRepository.GetByParticipanteIdAsync(idParticipante)
            ?? new Calificacion { IdParticipante = idParticipante };

        if (dto.InvestigacionAcademica.HasValue) cal.InvestigacionAcademica = dto.InvestigacionAcademica;
        if (dto.PensamientoCritico.HasValue)    cal.PensamientoCritico    = dto.PensamientoCritico;
        if (dto.Oratoria.HasValue)              cal.Oratoria              = dto.Oratoria;
        if (dto.Argumentacion.HasValue)         cal.Argumentacion         = dto.Argumentacion;
        if (dto.Redaccion.HasValue)             cal.Redaccion             = dto.Redaccion;
        if (dto.Negociacion.HasValue)           cal.Negociacion           = dto.Negociacion;
        if (dto.ResolucionConflictos.HasValue)  cal.ResolucionConflictos  = dto.ResolucionConflictos;
        if (dto.Liderazgo.HasValue)             cal.Liderazgo             = dto.Liderazgo;
        if (dto.Colaboracion.HasValue)          cal.Colaboracion          = dto.Colaboracion;

        var guardado = await calificacionRepository.UpsertAsync(cal);
        return ToDto(guardado);
    }

    private static CalificacionResponseDto ToDto(Calificacion cal) => new()
    {
        IdParticipante       = cal.IdParticipante,
        InvestigacionAcademica = cal.InvestigacionAcademica,
        PensamientoCritico   = cal.PensamientoCritico,
        Oratoria             = cal.Oratoria,
        Argumentacion        = cal.Argumentacion,
        Redaccion            = cal.Redaccion,
        Negociacion          = cal.Negociacion,
        ResolucionConflictos = cal.ResolucionConflictos,
        Liderazgo            = cal.Liderazgo,
        Colaboracion         = cal.Colaboracion,
        Total = (cal.InvestigacionAcademica ?? 0) + (cal.PensamientoCritico ?? 0) +
                (cal.Oratoria ?? 0) + (cal.Argumentacion ?? 0) + (cal.Redaccion ?? 0) +
                (cal.Negociacion ?? 0) + (cal.ResolucionConflictos ?? 0) +
                (cal.Liderazgo ?? 0) + (cal.Colaboracion ?? 0)
    };
}
