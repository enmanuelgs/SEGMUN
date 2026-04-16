using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IDelegadoCalificacionRepository
{
    Task<DelegadoCalificacion?> GetByParticipanteAndComisionAsync(int idParticipante, int idComision);
    Task<IEnumerable<DelegadoCalificacion>> GetByComisionAsync(int idComision);
    Task<DelegadoCalificacion> CreateAsync(DelegadoCalificacion calificacion);
    Task UpdateAsync(DelegadoCalificacion calificacion);
}
