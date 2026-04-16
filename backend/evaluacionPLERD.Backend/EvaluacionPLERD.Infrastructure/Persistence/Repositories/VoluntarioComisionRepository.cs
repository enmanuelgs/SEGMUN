using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Repositories;

public class VoluntarioComisionRepository(AppDbContext db) : IVoluntarioComisionRepository
{
    public async Task<VoluntarioComision?> GetByComisionAsync(int idComision)
        => await db.VoluntariosComisiones
            .Include(vc => vc.Comision)
            .Include(vc => vc.Director)
            .Include(vc => vc.Adjunto1)
            .Include(vc => vc.Adjunto2)
            .Include(vc => vc.EyC)
            .FirstOrDefaultAsync(vc => vc.IdComision == idComision);

    public async Task<VoluntarioComision> CreateAsync(VoluntarioComision voluntarioComision)
    {
        db.VoluntariosComisiones.Add(voluntarioComision);
        await db.SaveChangesAsync();
        return voluntarioComision;
    }

    public async Task UpdateAsync(VoluntarioComision voluntarioComision)
    {
        db.VoluntariosComisiones.Update(voluntarioComision);
        await db.SaveChangesAsync();
    }

    public async Task<bool> VoluntarioTieneConflictoFechaAsync(int idVoluntario, int idComisionDestino)
    {
        // Obtener la fecha del modelo destino
        var comisionDestino = await db.Comisiones
            .Include(c => c.Modelo)
            .FirstOrDefaultAsync(c => c.Id == idComisionDestino);

        var fechaDestino = comisionDestino?.Modelo?.FechaCelebracion;

        // ¿Tiene el voluntario algún cargo en OTRA comisión?
        var query = db.VoluntariosComisiones
            .Include(vc => vc.Comision).ThenInclude(c => c.Modelo)
            .Where(vc => vc.IdComision != idComisionDestino &&
                         (vc.IdDirector == idVoluntario ||
                          vc.IdAdjunto1 == idVoluntario ||
                          vc.IdAdjunto2 == idVoluntario ||
                          vc.IdEyC      == idVoluntario));

        if (fechaDestino is null)
        {
            // Sin fecha en el modelo destino → solo bloquear si el otro modelo tampoco tiene fecha
            // (si el otro modelo tiene fecha definida, podría ser otro día, lo permitimos)
            return await query.AnyAsync(vc => vc.Comision.Modelo == null ||
                                              vc.Comision.Modelo.FechaCelebracion == null);
        }

        // Con fecha → solo bloquear si coincide en fecha
        return await query.AnyAsync(vc =>
            vc.Comision.Modelo != null &&
            vc.Comision.Modelo.FechaCelebracion == fechaDestino);
    }
}
