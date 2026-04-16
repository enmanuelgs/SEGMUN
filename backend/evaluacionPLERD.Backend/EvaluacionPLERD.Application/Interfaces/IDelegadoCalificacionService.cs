using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IDelegadoCalificacionService
{
    Task<IEnumerable<DelegadoCalificacionResponseDto>> GetByComisionAsync(int idComision);
    Task<DelegadoCalificacionResponseDto?> GetByParticipanteAndComisionAsync(int idParticipante, int idComision);
    Task<DelegadoCalificacionResponseDto> ActualizarAsync(int idParticipante, int idComision, ActualizarDelegadoCalificacionDto dto);
}
