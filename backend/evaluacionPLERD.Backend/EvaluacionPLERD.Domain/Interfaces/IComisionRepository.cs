using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IComisionRepository
{
    Task<IEnumerable<Comision>> GetAllByModeloAsync(int idModelo);
    Task<Comision?> GetByIdAsync(int id);
    Task<Comision> CreateAsync(Comision comision);
    Task UpdateAsync(Comision comision);
    Task DeleteAsync(Comision comision);
    Task<bool> ExistsAsync(int id);
    Task<bool> NombreExistsInModeloAsync(int idModelo, string nombreComision);
}
