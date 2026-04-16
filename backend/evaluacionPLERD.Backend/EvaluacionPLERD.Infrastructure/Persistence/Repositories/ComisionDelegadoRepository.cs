using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class ComisionDelegadoRepository(AppDbContext db) : IComisionDelegadoRepository
{
    public async Task<IEnumerable<ComisionDelegado>> GetByComisionAsync(int idComision)
        => await db.ComisionesDelegados
            .Include(cd => cd.Comision)
            .Include(cd => cd.Participante)
            .Where(cd => cd.IdComision == idComision)
            .OrderBy(cd => cd.Participante.Apellidos)
            .ThenBy(cd => cd.Participante.Nombres)
            .ToListAsync();

    public async Task<ComisionDelegado?> GetByParticipanteAsync(int idParticipante)
        => await db.ComisionesDelegados
            .Include(cd => cd.Comision)
            .FirstOrDefaultAsync(cd => cd.IdParticipante == idParticipante);

    public async Task<ComisionDelegado?> GetByComisionAndParticipanteAsync(int idComision, int idParticipante)
        => await db.ComisionesDelegados
            .Include(cd => cd.Comision)
            .Include(cd => cd.Participante)
            .FirstOrDefaultAsync(cd =>
                cd.IdComision == idComision &&
                cd.IdParticipante == idParticipante);

    public async Task<ComisionDelegado> CreateAsync(ComisionDelegado comisionDelegado)
    {
        db.ComisionesDelegados.Add(comisionDelegado);
        await db.SaveChangesAsync();
        return comisionDelegado;
    }

    public async Task UpdateAsync(ComisionDelegado comisionDelegado)
    {
        db.ComisionesDelegados.Update(comisionDelegado);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(ComisionDelegado comisionDelegado)
    {
        db.ComisionesDelegados.Remove(comisionDelegado);
        await db.SaveChangesAsync();
    }

    public async Task<int> GetNextOrdenIngresoAsync(int idComision)
    {
        var max = await db.ComisionesDelegados
            .Where(cd => cd.IdComision == idComision)
            .Select(cd => (int?)cd.OrdenIngreso)
            .MaxAsync();
        return (max ?? 0) + 1;
    }

    public async Task<IEnumerable<ComisionDelegado>> GetExcedentesFifoAsync(int idComision)
        => await db.ComisionesDelegados
            .Where(cd => cd.IdComision == idComision && cd.ExcedeCupo)
            .OrderBy(cd => cd.OrdenIngreso)
            .ToListAsync();

    public async Task<bool> ExisteEnModeloAsync(int idModelo, int idParticipante)
        => await db.ComisionesDelegados
            .Include(cd => cd.Comision)
            .AnyAsync(cd => cd.Comision.IdModelo == idModelo && cd.IdParticipante == idParticipante);
}
