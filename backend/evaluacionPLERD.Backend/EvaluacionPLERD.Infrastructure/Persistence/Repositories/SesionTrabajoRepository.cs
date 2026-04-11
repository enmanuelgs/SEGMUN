using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class SesionTrabajoRepository(AppDbContext db) : ISesionTrabajoRepository
{
    public async Task<IEnumerable<SesionTrabajo>> GetAllAsync(int? idModelo)
    {
        var query = db.SesionesTrabajo.Include(s => s.PasesLista).AsQueryable();
        if (idModelo.HasValue)
            query = query.Where(s => s.IdModelo == idModelo.Value);
        return await query.ToListAsync();
    }

    public async Task<SesionTrabajo?> GetByIdAsync(int id) =>
        await db.SesionesTrabajo
            .Include(s => s.PasesLista)
            .FirstOrDefaultAsync(s => s.Id == id);

    public async Task<SesionTrabajo> CreateAsync(SesionTrabajo sesion)
    {
        db.SesionesTrabajo.Add(sesion);
        await db.SaveChangesAsync();
        return sesion;
    }

    public async Task DeleteAsync(int id)
    {
        var sesion = await db.SesionesTrabajo.FindAsync(id);
        if (sesion is not null)
        {
            db.SesionesTrabajo.Remove(sesion);
            await db.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id) =>
        await db.SesionesTrabajo.AnyAsync(s => s.Id == id);
}
