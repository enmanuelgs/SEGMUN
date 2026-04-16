using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IOrganizadorRepository
{
    Task<IEnumerable<Organizador>> GetAllAsync();
    Task<Organizador?> GetByIdAsync(int id);
    Task<Organizador?> GetByVoluntarioAsync(int idVoluntario);
    Task<Organizador> CreateAsync(Organizador organizador);
    Task UpdateAsync(Organizador organizador);
    Task DeleteAsync(Organizador organizador);
    Task<bool> ExistsAsync(int id);
}
