using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class DelegadoCalificacionRepository(AppDbContext db) : IDelegadoCalificacionRepository
{
    public async Task<DelegadoCalificacion?> GetByParticipanteAndComisionAsync(int idParticipante, int idComision)
        => await db.DelegadosCalificaciones
            .Include(dc => dc.Participante)
            .Include(dc => dc.Comision)
            .FirstOrDefaultAsync(dc =>
                dc.IdParticipante == idParticipante &&
                dc.IdComision == idComision);

    public async Task<IEnumerable<DelegadoCalificacion>> GetByComisionAsync(int idComision)
        => await db.DelegadosCalificaciones
            .Include(dc => dc.Participante)
            .Include(dc => dc.Comision)
            .Where(dc => dc.IdComision == idComision)
            .OrderByDescending(dc => dc.CFinal)
            .ToListAsync();

    public async Task<DelegadoCalificacion> CreateAsync(DelegadoCalificacion calificacion)
    {
        db.DelegadosCalificaciones.Add(calificacion);
        await db.SaveChangesAsync();
        return calificacion;
    }

    public async Task UpdateAsync(DelegadoCalificacion calificacion)
    {
        db.DelegadosCalificaciones.Update(calificacion);
        await db.SaveChangesAsync();
    }
}
