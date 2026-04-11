namespace EvaluacionPLERD.Domain.Entities;

public class Participacion
{
    public int Id { get; set; }
    public int IdParticipante { get; set; }
    public short NumParticipaciones { get; set; }

    public Participante Participante { get; set; } = null!;
}
