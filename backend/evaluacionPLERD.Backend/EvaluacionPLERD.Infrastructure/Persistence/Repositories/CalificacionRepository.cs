using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class CalificacionRepository(AppDbContext db) : ICalificacionRepository
{
    public async Task<Calificacion?> GetByParticipanteIdAsync(int idParticipante)
        => await db.Calificaciones.FirstOrDefaultAsync(c => c.IdParticipante == idParticipante);

    public async Task<Calificacion> UpsertAsync(Calificacion calificacion)
    {
        if (calificacion.Id == 0)
            db.Calificaciones.Add(calificacion);
        else
            db.Calificaciones.Update(calificacion);

        await db.SaveChangesAsync();
        return calificacion;
    }
}
