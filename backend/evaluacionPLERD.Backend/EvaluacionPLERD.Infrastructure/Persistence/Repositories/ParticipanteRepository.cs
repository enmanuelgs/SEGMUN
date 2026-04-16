using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class ParticipanteRepository(AppDbContext db) : IParticipanteRepository
{
    public async Task<IEnumerable<Participante>> GetAllAsync(int? idModelo, int? idComision, string? nombres, string? apellidos, string? numeracion)
    {
        var query = db.Participantes.Where(p => !p.Eliminado).AsQueryable();

        if (idModelo.HasValue)
            query = query.Where(p => p.IdModelo == idModelo.Value);

        // Si se filtra por comisión, solo devolver los asignados a esa comisión (via comisiones_delegados)
        if (idComision.HasValue)
        {
            var idsEnComision = db.ComisionesDelegados
                .Where(cd => cd.IdComision == idComision.Value)
                .Select(cd => cd.IdParticipante);
            query = query.Where(p => idsEnComision.Contains(p.Id));
        }

        if (!string.IsNullOrWhiteSpace(nombres))
            query = query.Where(p => p.Nombres.ToLower().Contains(nombres.ToLower()));

        if (!string.IsNullOrWhiteSpace(apellidos))
            query = query.Where(p => p.Apellidos.ToLower().Contains(apellidos.ToLower()));

        if (!string.IsNullOrWhiteSpace(numeracion))
            query = query.Where(p => p.Numeracion != null && p.Numeracion.ToLower().Contains(numeracion.ToLower()));

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
        participante.Eliminado = true;
        db.Participantes.Update(participante);
        await db.SaveChangesAsync();
    }

    public async Task<bool> ExistsAsync(int id)
        => await db.Participantes.AnyAsync(p => p.Id == id);
}
