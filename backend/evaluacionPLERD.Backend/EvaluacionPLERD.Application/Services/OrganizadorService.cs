using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class OrganizadorService(
    IOrganizadorRepository repository,
    IVoluntarioRepository voluntarioRepository) : IOrganizadorService
{
    public async Task<IEnumerable<OrganizadorResponseDto>> GetAllAsync()
    {
        var organizadores = await repository.GetAllAsync();
        return organizadores.Select(ToDto);
    }

    public async Task<OrganizadorResponseDto?> GetByIdAsync(int id)
    {
        var o = await repository.GetByIdAsync(id);
        return o is null ? null : ToDto(o);
    }

    public async Task<OrganizadorResponseDto> CreateAsync(CrearOrganizadorDto dto)
    {
        var voluntario = await voluntarioRepository.GetByIdAsync(dto.IdVoluntario!.Value);
        if (voluntario is null)
            throw new InvalidOperationException("El voluntario especificado no existe.");

        if (await repository.GetByVoluntarioAsync(dto.IdVoluntario!.Value) is not null)
            throw new InvalidOperationException("Este voluntario ya tiene un registro de organizador.");

        var organizador = new Organizador
        {
            IdVoluntario = dto.IdVoluntario!.Value,
            Regional     = dto.Regional,
            Distrito     = dto.Distrito,
            Cargo        = dto.Cargo,
            Contrasena   = dto.Contrasena,
            EsSuperuser  = dto.EsSuperuser,
        };

        var creado = await repository.CreateAsync(organizador);
        creado.Voluntario = voluntario;
        return ToDto(creado);
    }

    public async Task<bool> UpdateAsync(int id, EditarOrganizadorDto dto)
    {
        var organizador = await repository.GetByIdAsync(id);
        if (organizador is null) return false;

        if (!string.IsNullOrWhiteSpace(dto.Regional))   organizador.Regional   = dto.Regional;
        if (dto.Distrito is not null)                    organizador.Distrito   = dto.Distrito;
        if (!string.IsNullOrWhiteSpace(dto.Cargo))       organizador.Cargo      = dto.Cargo;
        if (!string.IsNullOrWhiteSpace(dto.Contrasena))  organizador.Contrasena = dto.Contrasena;
        if (dto.EsSuperuser.HasValue)                    organizador.EsSuperuser = dto.EsSuperuser.Value;

        await repository.UpdateAsync(organizador);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var organizador = await repository.GetByIdAsync(id);
        if (organizador is null) return false;

        await repository.DeleteAsync(organizador);
        return true;
    }

    private static OrganizadorResponseDto ToDto(Organizador o) => new()
    {
        Id               = o.Id,
        Regional         = o.Regional,
        Distrito         = o.Distrito,
        IdVoluntario     = o.IdVoluntario,
        NombreVoluntario = o.Voluntario?.NombreCompleto ?? string.Empty,
        Cargo            = o.Cargo,
        EsSuperuser      = o.EsSuperuser,
    };
}
