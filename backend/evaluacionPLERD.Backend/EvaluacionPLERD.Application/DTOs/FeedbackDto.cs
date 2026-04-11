using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class EditarFeedbackDto
{
    public string? Comentario { get; set; }
}

public class FeedbackResponseDto
{
    public int IdParticipante { get; set; }
    public string? Comentario { get; set; }
}
