using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class ParticipanteRepository(AppDbContext db) : IParticipanteRepository
{
    public async Task<IEnumerable<Participante>> GetAllAsync(int? idModelo, string? nombres, string? apellidos, string? numeracionPLERD)
    {
        var query = db.Participantes.AsQueryable();

        if (idModelo.HasValue)
            query = query.Where(p => p.IdModelo == idModelo.Value);

        if (!string.IsNullOrWhiteSpace(nombres))
            query = query.Where(p => p.Nombres.ToLower().Contains(nombres.ToLower()));

        if (!string.IsNullOrWhiteSpace(apellidos))
            query = query.Where(p => p.Apellidos.ToLower().Contains(apellidos.ToLower()));

        if (!string.IsNullOrWhiteSpace(numeracionPLERD))
            query = query.Where(p => p.NumeracionPLERD != null && p.NumeracionPLERD.ToLower().Contains(numeracionPLERD.ToLower()));

        return await query.ToListAsync();
    }

    public async Task<Participante?> GetByIdAsync(int id)
        => await db.Participantes.FindAsync(id);

    public async Task<Participante> CreateAsync(Participante participante)
    {
        db.Participantes.Add(participante);
        await db.SaveChangesAsync();
        return participante;
    }

    public async Task UpdateAsync(Participante participante)
    {
        db.Participantes.Update(participante);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Participante participante)
    {
        db.Participantes.Remove(participante);
        await db.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
        => await db.Participantes.AnyAsync(p => p.Id == id);
}
