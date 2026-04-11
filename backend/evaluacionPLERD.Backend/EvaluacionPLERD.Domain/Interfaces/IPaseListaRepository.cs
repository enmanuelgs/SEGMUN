using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IPaseListaRepository
{
    Task<IEnumerable<PaseLista>> GetBySesionAsync(int idSesionTrabajo);
    Task<PaseLista?> GetAsync(int idSesionTrabajo, int idParticipante);
    Task CreateManyAsync(IEnumerable<PaseLista> pases);
    Task<PaseLista> UpdateEstadoAsync(int idSesionTrabajo, int idParticipante, string estadoPresencia);
}
