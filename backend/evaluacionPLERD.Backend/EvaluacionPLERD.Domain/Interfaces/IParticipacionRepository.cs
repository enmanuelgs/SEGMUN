using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IParticipacionRepository
{
    Task<Participacion?> GetByParticipanteIdAsync(int idParticipante);
    Task<Participacion> UpsertAsync(Participacion participacion);
}
