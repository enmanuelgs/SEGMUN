using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface ICalificacionEvaluadorRepository
{
    Task<CalificacionEvaluador?> GetByParticipanteAndVoluntarioAsync(int idParticipante, int idVoluntario);
    Task<IEnumerable<CalificacionEvaluador>> GetByParticipanteAsync(int idParticipante);
    Task<CalificacionEvaluador> UpsertAsync(CalificacionEvaluador cal);
}
