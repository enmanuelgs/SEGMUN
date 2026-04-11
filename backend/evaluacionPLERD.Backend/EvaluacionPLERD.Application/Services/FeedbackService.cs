using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class FeedbackService(
    IFeedbackRepository feedbackRepository,
    IParticipanteRepository participanteRepository) : IFeedbackService
{
    public async Task<FeedbackResponseDto?> GetByParticipanteIdAsync(int idParticipante)
    {
        var feedback = await feedbackRepository.GetByParticipanteIdAsync(idParticipante);
        return feedback is null ? null : ToDto(feedback);
    }

    public async Task<FeedbackResponseDto?> UpdateAsync(int idParticipante, EditarFeedbackDto dto)
    {
        if (!await participanteRepository.ExistsAsync(idParticipante)) return null;

        var feedback = await feedbackRepository.GetByParticipanteIdAsync(idParticipante)
            ?? new Feedback { IdParticipante = idParticipante };

        feedback.Comentario = dto.Comentario;

        var guardado = await feedbackRepository.UpsertAsync(feedback);
        return ToDto(guardado);
    }

    private static FeedbackResponseDto ToDto(Feedback f) => new()
    {
        IdParticipante = f.IdParticipante,
        Comentario = f.Comentario
    };
}
