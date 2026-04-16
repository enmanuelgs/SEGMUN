using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IOrganizadorService
{
    Task<IEnumerable<OrganizadorResponseDto>> GetAllAsync();
    Task<OrganizadorResponseDto?> GetByIdAsync(int id);
    Task<OrganizadorResponseDto> CreateAsync(CrearOrganizadorDto dto);
    Task<bool> UpdateAsync(int id, EditarOrganizadorDto dto);
    Task<bool> DeleteAsync(int id);
}
