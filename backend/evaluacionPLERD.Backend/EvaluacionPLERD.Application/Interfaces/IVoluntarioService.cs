using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IVoluntarioService
{
    Task<IEnumerable<VoluntarioResponseDto>> GetAllAsync();
    Task<VoluntarioResponseDto?> GetByIdAsync(int id);
    Task<VoluntarioResponseDto> CreateAsync(CrearVoluntarioDto dto);
    Task<bool> UpdateAsync(int id, EditarVoluntarioDto dto);
    Task<bool> DeleteAsync(int id);
}
