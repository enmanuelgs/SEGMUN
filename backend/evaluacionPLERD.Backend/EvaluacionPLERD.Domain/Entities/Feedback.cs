namespace EvaluacionPLERD.Domain.Entities;

public class Feedback
{
    public int Id { get; set; }
    public int IdParticipante { get; set; }
    public string? Comentario { get; set; }

    public Participante Participante { get; set; } = null!;
}
