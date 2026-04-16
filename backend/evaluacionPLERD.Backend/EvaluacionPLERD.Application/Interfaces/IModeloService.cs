using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IModeloService
{
    Task<IEnumerable<ModeloResponseDto>> GetAllAsync();
    Task<ModeloResponseDto?> GetByIdAsync(int id);
    Task<ModeloResponseDto> CreateAsync(CrearModeloDto dto);
    Task<ModeloResponseDto?> UpdateAsync(int id, CrearModeloDto dto);
    Task DeleteAsync(int id);
}
