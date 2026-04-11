using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface ISesionTrabajoRepository
{
    Task<IEnumerable<SesionTrabajo>> GetAllAsync(int? idModelo);
    Task<SesionTrabajo?> GetByIdAsync(int id);
    Task<SesionTrabajo> CreateAsync(SesionTrabajo sesion);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}
