using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class ModeloRepository(AppDbContext db) : IModeloRepository
{
    public async Task<IEnumerable<Modelo>> GetAllAsync()
        => await db.Modelos
            .Include(m => m.Participantes)
            .OrderByDescending(m => m.AnioEdicion)
            .ThenBy(m => m.Distrito)
            .ToListAsync();

    public async Task<Modelo?> GetByIdAsync(int id)
        => await db.Modelos
            .Include(m => m.Participantes)
            .FirstOrDefaultAsync(m => m.Id == id);

    public async Task<Modelo> CreateAsync(Modelo modelo)
    {
        db.Modelos.Add(modelo);
        await db.SaveChangesAsync();
        return modelo;
    }

    public async Task UpdateAsync(Modelo modelo)
    {
        db.Modelos.Update(modelo);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var modelo = await db.Modelos.FindAsync(id);
        if (modelo is not null)
        {
            db.Modelos.Remove(modelo);
            await db.SaveChangesAsync();
        }
    }

    public async Task<bool> ExistsAsync(int id)
        => await db.Modelos.AnyAsync(m => m.Id == id);

    public async Task<bool> ExisteDuplicadoAsync(string? distrito, short? anioEdicion)
    {
        if (string.IsNullOrWhiteSpace(distrito) || anioEdicion is null) return false;
        var d = distrito.Trim().ToLower();
        return await db.Modelos.AnyAsync(m =>
            m.Distrito != null &&
            m.Distrito.ToLower() == d &&
            m.AnioEdicion == anioEdicion);
    }
}
