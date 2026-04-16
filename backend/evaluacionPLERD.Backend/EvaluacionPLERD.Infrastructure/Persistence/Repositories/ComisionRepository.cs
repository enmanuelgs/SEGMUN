using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class ComisionRepository(AppDbContext db) : IComisionRepository
{
    public async Task<IEnumerable<Comision>> GetAllByModeloAsync(int idModelo)
        => await db.Comisiones
            .Where(c => c.IdModelo == idModelo)
            .OrderBy(c => c.NombreComision)
            .ToListAsync();

    public async Task<Comision?> GetByIdAsync(int id)
        => await db.Comisiones.FindAsync(id);

    public async Task<Comision> CreateAsync(Comision comision)
    {
        db.Comisiones.Add(comision);
        await db.SaveChangesAsync();
        return comision;
    }

    public async Task UpdateAsync(Comision comision)
    {
        db.Comisiones.Update(comision);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Comision comision)
    {
        db.Comisiones.Remove(comision);
        await db.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
        => await db.Comisiones.AnyAsync(c => c.Id == id);

    public async Task<bool> NombreExistsInModeloAsync(int idModelo, string nombreComision)
        => await db.Comisiones.AnyAsync(c =>
            c.IdModelo == idModelo &&
            c.NombreComision.ToLower() == nombreComision.ToLower());
}
