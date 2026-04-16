using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IComisionService
{
    Task<IEnumerable<ComisionResponseDto>> GetAllByModeloAsync(int idModelo);
    Task<ComisionResponseDto?> GetByIdAsync(int id);
    Task<ComisionResponseDto> CreateAsync(CrearComisionDto dto);
    Task<bool> UpdateAsync(int id, EditarComisionDto dto);
    Task<bool> DeleteAsync(int id);
}
