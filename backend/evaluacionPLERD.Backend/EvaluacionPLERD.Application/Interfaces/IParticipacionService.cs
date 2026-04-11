using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IParticipacionService
{
    Task<ParticipacionResponseDto?> GetByParticipanteIdAsync(int idParticipante);
    Task<(ParticipacionResponseDto? result, string? error)> SumarAsync(int idParticipante);
    Task<(ParticipacionResponseDto? result, string? error)> RestarAsync(int idParticipante);
}
