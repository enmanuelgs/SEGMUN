using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface ISesionTrabajoService
{
    Task<IEnumerable<SesionTrabajoResponseDto>> GetAllAsync(int? idModelo);
    Task<SesionTrabajoResponseDto?> GetByIdAsync(int id);
    Task<SesionTrabajoResponseDto> CreateAsync(CrearSesionTrabajoDto dto);
    Task DeleteAsync(int id);
}
