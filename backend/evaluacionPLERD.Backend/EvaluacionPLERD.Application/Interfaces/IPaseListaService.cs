using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IPaseListaService
{
    Task<IEnumerable<PaseListaResponseDto>> GetBySesionAsync(int idSesionTrabajo);
    Task<PaseListaResponseDto> ActualizarEstadoAsync(int idSesionTrabajo, int idParticipante, ActualizarPaseListaDto dto);
}
