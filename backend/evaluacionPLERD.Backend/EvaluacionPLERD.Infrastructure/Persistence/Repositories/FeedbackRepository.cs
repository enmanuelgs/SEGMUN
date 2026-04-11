using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class FeedbackRepository(AppDbContext db) : IFeedbackRepository
{
    public async Task<Feedback?> GetByParticipanteIdAsync(int idParticipante)
        => await db.Feedbacks.FirstOrDefaultAsync(f => f.IdParticipante == idParticipante);

    public async Task<Feedback> UpsertAsync(Feedback feedback)
    {
        if (feedback.Id == 0)
            db.Feedbacks.Add(feedback);
        else
            db.Feedbacks.Update(feedback);

        await db.SaveChangesAsync();
        return feedback;
    }
}
