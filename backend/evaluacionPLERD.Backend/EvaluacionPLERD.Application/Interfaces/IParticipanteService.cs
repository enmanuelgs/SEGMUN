using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IParticipanteService
{
    Task<IEnumerable<ParticipanteResponseDto>> GetAllAsync(int? idModelo, string? nombres, string? apellidos, string? numeracionPLERD);
    Task<ParticipanteResponseDto?> GetByIdAsync(int id);
    Task<ParticipanteResponseDto> CreateAsync(CrearParticipanteDto dto);
    Task<bool> UpdateAsync(int id, EditarParticipanteDto dto);
    Task<bool> DeleteAsync(int id);
}
