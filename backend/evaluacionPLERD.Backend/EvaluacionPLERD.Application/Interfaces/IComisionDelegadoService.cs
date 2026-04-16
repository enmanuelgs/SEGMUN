using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IComisionDelegadoService
{
    Task<IEnumerable<ComisionDelegadoResponseDto>> GetByComisionAsync(int idComision);
    Task<ComisionDelegadoResponseDto> AsignarAsync(AsignarDelegadoDto dto);
    Task<bool> RemoverAsync(int idComision, int idParticipante);
}
