using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class OrganizadorRepository(AppDbContext db) : IOrganizadorRepository
{
    public async Task<IEnumerable<Organizador>> GetAllAsync()
        => await db.Organizadores
            .Include(o => o.Voluntario)
            .OrderBy(o => o.Regional)
            .ThenBy(o => o.Distrito)
            .ToListAsync();

    public async Task<Organizador?> GetByIdAsync(int id)
        => await db.Organizadores
            .Include(o => o.Voluntario)
            .FirstOrDefaultAsync(o => o.Id == id);

    public async Task<Organizador?> GetByVoluntarioAsync(int idVoluntario)
        => await db.Organizadores
            .Include(o => o.Voluntario)
            .FirstOrDefaultAsync(o => o.IdVoluntario == idVoluntario);

    public async Task<Organizador> CreateAsync(Organizador organizador)
    {
        db.Organizadores.Add(organizador);
        await db.SaveChangesAsync();
        return organizador;
    }

    public async Task UpdateAsync(Organizador organizador)
    {
        db.Organizadores.Update(organizador);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Organizador organizador)
    {
        db.Organizadores.Remove(organizador);
        await db.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
        => await db.Organizadores.AnyAsync(o => o.Id == id);
}
