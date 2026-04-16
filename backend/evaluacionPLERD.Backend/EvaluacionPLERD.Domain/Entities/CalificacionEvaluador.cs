namespace EvaluacionPLERD.Domain.Entities;

/// <summary>
/// Calificación individual colocada por un miembro de la mesa directiva
/// (Director, Adjunto 1 o Adjunto 2) para un participante.
/// EyC no coloca calificaciones.
/// </summary>
public class CalificacionEvaluador
{
    public int Id { get; set; }
    public int IdParticipante { get; set; }
    public int IdVoluntario   { get; set; }

    public short? InvestigacionAcademica { get; set; }
    public short? PensamientoCritico     { get; set; }
    public short? Oratoria               { get; set; }
    public short? Argumentacion          { get; set; }
    public short? Redaccion              { get; set; }
    public short? Negociacion            { get; set; }
    public short? ResolucionConflictos   { get; set; }
    public short? Liderazgo              { get; set; }
    public short? Colaboracion           { get; set; }

    public Participante Participante { get; set; } = null!;
    public Voluntario   Voluntario   { get; set; } = null!;
}
