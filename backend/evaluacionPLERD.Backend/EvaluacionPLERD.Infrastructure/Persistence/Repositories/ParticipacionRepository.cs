using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class ParticipacionRepository(AppDbContext db) : IParticipacionRepository
{
    public async Task<Participacion?> GetByParticipanteIdAsync(int idParticipante)
        => await db.Participaciones.FirstOrDefaultAsync(p => p.IdParticipante == idParticipante);

    public async Task<Participacion> UpsertAsync(Participacion participacion)
    {
        if (participacion.Id == 0)
            db.Participaciones.Add(participacion);
        else
            db.Participaciones.Update(participacion);

        await db.SaveChangesAsync();
        return participacion;
    }
}
