using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IVoluntarioRepository
{
    Task<IEnumerable<Voluntario>> GetAllAsync();
    Task<Voluntario?> GetByIdAsync(int id);
    Task<Voluntario?> GetByNombreCompletoAsync(string nombreCompleto);
    Task<Voluntario> CreateAsync(Voluntario voluntario);
    Task UpdateAsync(Voluntario voluntario);
    Task DeleteAsync(Voluntario voluntario);
    Task<bool> ExistsAsync(int id);
    Task<bool> NombreCompletoExistsAsync(string nombreCompleto);
}
