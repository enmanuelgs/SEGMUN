namespace EvaluacionPLERD.Domain.Entities;

public class Calificacion
{
    public int Id { get; set; }
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

    public Participante Participante { get; set; } = null!;
}
