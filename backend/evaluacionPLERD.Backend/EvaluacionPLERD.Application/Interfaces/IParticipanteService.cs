using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IParticipanteService
{
    Task<IEnumerable<ParticipanteResponseDto>> GetAllAsync(int? idModelo, int? idComision, string? nombres, string? apellidos, string? numeracion);
    Task<ParticipanteResponseDto?> GetByIdAsync(int id);
    Task<ParticipanteResponseDto> CreateAsync(CrearParticipanteDto dto);
    Task<bool> UpdateAsync(int id, EditarParticipanteDto dto);
    Task<bool> DeleteAsync(int id);
}
