using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IFeedbackRepository
{
    Task<Feedback?> GetByParticipanteIdAsync(int idParticipante);
    Task<Feedback> UpsertAsync(Feedback feedback);
}
