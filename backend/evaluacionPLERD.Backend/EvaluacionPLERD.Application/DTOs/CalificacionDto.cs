using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class EditarCalificacionDto
{
    [Range(0, 15)] public short? InvestigacionAcademica { get; set; }
    [Range(0, 15)] public short? PensamientoCritico { get; set; }
    [Range(0, 10)] public short? Oratoria { get; set; }
    [Range(0, 10)] public short? Argumentacion { get; set; }
    [Range(0, 10)] public short? Redaccion { get; set; }
    [Range(0, 10)] public short? Negociacion { get; set; }
    [Range(0, 10)] public short? ResolucionConflictos { get; set; }
    [Range(0, 10)] public short? Liderazgo { get; set; }
    [Range(0, 10)] public short? Colaboracion { get; set; }
}

public class CalificacionResponseDto
{
    public int IdParticipante { get; set; }
    public short? InvestigacionAcademica { get; set; }
    public short? PensamientoCritico { get; set; }
    public short? Oratoria { get; set; }
    public short? Argumentacion { get; set; }
    public short? Redaccion { get; set; }
    public short? Negociacion { get; set; }
    public short? ResolucionConflictos { get; set; }
    public short? Liderazgo { get; set; }
    public short? Colaboracion { get; set; }
    public int Total { get; set; }
}
