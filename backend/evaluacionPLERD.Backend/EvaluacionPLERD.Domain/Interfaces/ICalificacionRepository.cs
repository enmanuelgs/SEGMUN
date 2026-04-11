using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface ICalificacionRepository
{
    Task<Calificacion?> GetByParticipanteIdAsync(int idParticipante);
    Task<Calificacion> UpsertAsync(Calificacion calificacion);
}
