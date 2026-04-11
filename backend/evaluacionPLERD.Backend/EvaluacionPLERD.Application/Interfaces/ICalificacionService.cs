using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface ICalificacionService
{
    Task<CalificacionResponseDto?> GetByParticipanteIdAsync(int idParticipante);
    Task<CalificacionResponseDto?> UpdateAsync(int idParticipante, EditarCalificacionDto dto);
}
