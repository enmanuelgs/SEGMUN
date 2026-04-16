using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IModeloRepository
{
    Task<IEnumerable<Modelo>> GetAllAsync();
    Task<Modelo?> GetByIdAsync(int id);
    Task<Modelo> CreateAsync(Modelo modelo);
    Task UpdateAsync(Modelo modelo);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> ExisteDuplicadoAsync(string? distrito, short? anioEdicion);
    Task<IEnumerable<Modelo>> GetByVoluntarioIdAsync(int voluntarioId);
    /// <summary>Todos los modelos donde Regional == regional (CELIDER Regional: ve todos los distritos + el regional).</summary>
    Task<IEnumerable<Modelo>> GetByRegionalAsync(string regional);
    /// <summary>Solo el modelo exacto de ese distrito (y el modelo regional, con Distrito = null).</summary>
    Task<IEnumerable<Modelo>> GetByDistritoAsync(string regional, string distrito);
}
