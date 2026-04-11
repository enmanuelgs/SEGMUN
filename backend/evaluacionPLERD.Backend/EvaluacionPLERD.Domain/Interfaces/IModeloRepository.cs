using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IModeloRepository
{
    Task<IEnumerable<Modelo>> GetAllAsync();
    Task<Modelo?> GetByIdAsync(int id);
    Task<Modelo> CreateAsync(Modelo modelo);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
    Task<bool> ExisteDuplicadoAsync(string? distrito, short? anioEdicion);
}
