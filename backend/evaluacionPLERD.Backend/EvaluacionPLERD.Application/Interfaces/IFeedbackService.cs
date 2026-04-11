using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IFeedbackService
{
    Task<FeedbackResponseDto?> GetByParticipanteIdAsync(int idParticipante);
    Task<FeedbackResponseDto?> UpdateAsync(int idParticipante, EditarFeedbackDto dto);
}
