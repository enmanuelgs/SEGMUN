using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IParticipanteRepository
{
    Task<IEnumerable<Participante>> GetAllAsync(int? idModelo, string? nombres, string? apellidos, string? numeracionPLERD);
    Task<Participante?> GetByIdAsync(int id);
    Task<Participante> CreateAsync(Participante participante);
    Task UpdateAsync(Participante participante);
    Task DeleteAsync(Participante participante);
    Task<bool> ExistsAsync(int id);
}
