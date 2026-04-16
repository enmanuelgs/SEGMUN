using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class CalificacionEvaluadorRepository(AppDbContext db) : ICalificacionEvaluadorRepository
{
    public async Task<CalificacionEvaluador?> GetByParticipanteAndVoluntarioAsync(int idParticipante, int idVoluntario)
        => await db.CalificacionesEvaluadores
            .FirstOrDefaultAsync(c => c.IdParticipante == idParticipante && c.IdVoluntario == idVoluntario);

    public async Task<IEnumerable<CalificacionEvaluador>> GetByParticipanteAsync(int idParticipante)
        => await db.CalificacionesEvaluadores
            .Where(c => c.IdParticipante == idParticipante)
            .ToListAsync();

    public async Task<CalificacionEvaluador> UpsertAsync(CalificacionEvaluador cal)
    {
        if (cal.Id == 0)
            db.CalificacionesEvaluadores.Add(cal);
        else
            db.CalificacionesEvaluadores.Update(cal);

        await db.SaveChangesAsync();
        return cal;
    }
}
