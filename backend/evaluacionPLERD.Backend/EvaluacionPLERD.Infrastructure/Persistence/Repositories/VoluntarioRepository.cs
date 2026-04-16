using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class VoluntarioRepository(AppDbContext db) : IVoluntarioRepository
{
    public async Task<IEnumerable<Voluntario>> GetAllAsync()
        => await db.Voluntarios
            .OrderBy(v => v.NombreCompleto)
            .ToListAsync();

    public async Task<Voluntario?> GetByIdAsync(int id)
        => await db.Voluntarios.FindAsync(id);

    public async Task<Voluntario?> GetByNombreCompletoAsync(string nombreCompleto)
        => await db.Voluntarios.FirstOrDefaultAsync(v =>
            v.NombreCompleto.ToLower() == nombreCompleto.ToLower());

    public async Task<Voluntario> CreateAsync(Voluntario voluntario)
    {
        db.Voluntarios.Add(voluntario);
        await db.SaveChangesAsync();
        return voluntario;
    }

    public async Task UpdateAsync(Voluntario voluntario)
    {
        db.Voluntarios.Update(voluntario);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Voluntario voluntario)
    {
        db.Voluntarios.Remove(voluntario);
        await db.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
        => await db.Voluntarios.AnyAsync(v => v.Id == id);

    public async Task<bool> NombreCompletoExistsAsync(string nombreCompleto)
        => await db.Voluntarios.AnyAsync(v =>
            v.NombreCompleto.ToLower() == nombreCompleto.ToLower());
}
