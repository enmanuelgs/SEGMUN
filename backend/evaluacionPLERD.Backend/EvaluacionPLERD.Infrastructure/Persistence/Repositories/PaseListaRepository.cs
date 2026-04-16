using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class PaseListaRepository(AppDbContext db) : IPaseListaRepository
{
    public async Task<IEnumerable<PaseLista>> GetBySesionAsync(int idSesionTrabajo) =>
        await db.PasesLista
            .Include(p => p.Participante)
            .Where(p => p.IdSesionTrabajo == idSesionTrabajo)
            .OrderBy(p => p.NombreParticipante)
            .ToListAsync();

    public async Task<PaseLista?> GetAsync(int idSesionTrabajo, int idParticipante) =>
        await db.PasesLista.FirstOrDefaultAsync(
            p => p.IdSesionTrabajo == idSesionTrabajo && p.IdParticipante == idParticipante);

    public async Task CreateManyAsync(IEnumerable<PaseLista> pases)
    {
        db.PasesLista.AddRange(pases);
        await db.SaveChangesAsync();
    }

    public async Task<PaseLista> UpdateEstadoAsync(int idSesionTrabajo, int idParticipante, string estadoPresencia)
    {
        var pase = await db.PasesLista.FirstOrDefaultAsync(
            p => p.IdSesionTrabajo == idSesionTrabajo && p.IdParticipante == idParticipante)
            ?? throw new KeyNotFoundException("Registro de pase de lista no encontrado.");

        pase.EstadoPresencia = estadoPresencia;
        await db.SaveChangesAsync();
        return pase;
    }
}
