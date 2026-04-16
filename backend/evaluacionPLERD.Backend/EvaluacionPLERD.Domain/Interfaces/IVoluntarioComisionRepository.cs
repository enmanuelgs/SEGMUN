using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IVoluntarioComisionRepository
{
    Task<VoluntarioComision?> GetByComisionAsync(int idComision);
    Task<VoluntarioComision> CreateAsync(VoluntarioComision voluntarioComision);
    Task UpdateAsync(VoluntarioComision voluntarioComision);

    /// <summary>
    /// Verifica si un voluntario ya ocupa un cargo de mesa directiva en alguna comisión cuyo modelo
    /// coincide en fecha con el modelo de <paramref name="idComisionDestino"/>.
    /// Si el modelo destino no tiene fecha definida, bloquea cualquier asignación previa
    /// (salvo en la misma comisión, para permitir reasignaciones).
    /// </summary>
    Task<bool> VoluntarioTieneConflictoFechaAsync(int idVoluntario, int idComisionDestino);
}
