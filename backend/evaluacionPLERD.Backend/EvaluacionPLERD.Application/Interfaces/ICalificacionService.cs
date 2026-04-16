using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface ICalificacionService
{
    Task<CalificacionResponseDto?> GetByParticipanteIdAsync(int idParticipante, int idVoluntario);
    Task<CalificacionResponseDto?> UpdateAsync(int idParticipante, int idVoluntario, EditarCalificacionDto dto);
}
