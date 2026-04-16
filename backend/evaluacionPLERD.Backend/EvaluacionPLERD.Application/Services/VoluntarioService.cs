using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class VoluntarioService(IVoluntarioRepository repository) : IVoluntarioService
{
    public async Task<IEnumerable<VoluntarioResponseDto>> GetAllAsync()
    {
        var voluntarios = await repository.GetAllAsync();
        return voluntarios.Select(ToDto);
    }

    public async Task<VoluntarioResponseDto?> GetByIdAsync(int id)
    {
        var v = await repository.GetByIdAsync(id);
        return v is null ? null : ToDto(v);
    }

    public async Task<VoluntarioResponseDto> CreateAsync(CrearVoluntarioDto dto)
    {
        if (await repository.NombreCompletoExistsAsync(dto.NombreCompleto))
            throw new InvalidOperationException($"Ya existe un voluntario con el nombre '{dto.NombreCompleto}'. Un celíder no puede crear un voluntario duplicado.");

        var voluntario = new Voluntario
        {
            NombreCompleto    = dto.NombreCompleto,
            Contrasena        = dto.Contrasena,
            Sexo              = dto.Sexo,
            Categoria         = dto.Categoria,
            Regional          = dto.Regional,
            Distrito          = dto.Distrito,
            CorreoElectronico = dto.CorreoElectronico,
            NumeroTelefonico  = dto.NumeroTelefonico,
        };

        var creado = await repository.CreateAsync(voluntario);
        return ToDto(creado);
    }

    public async Task<bool> UpdateAsync(int id, EditarVoluntarioDto dto)
    {
        var voluntario = await repository.GetByIdAsync(id);
        if (voluntario is null) return false;

        if (!string.IsNullOrWhiteSpace(dto.NombreCompleto))
        {
            if (dto.NombreCompleto != voluntario.NombreCompleto &&
                await repository.NombreCompletoExistsAsync(dto.NombreCompleto))
                throw new InvalidOperationException($"Ya existe un voluntario con el nombre '{dto.NombreCompleto}'.");
            voluntario.NombreCompleto = dto.NombreCompleto;
        }

        if (!string.IsNullOrWhiteSpace(dto.Contrasena))        voluntario.Contrasena        = dto.Contrasena;
        if (!string.IsNullOrWhiteSpace(dto.Sexo))              voluntario.Sexo              = dto.Sexo;
        if (!string.IsNullOrWhiteSpace(dto.Categoria))         voluntario.Categoria         = dto.Categoria;
        if (!string.IsNullOrWhiteSpace(dto.Regional))          voluntario.Regional          = dto.Regional;
        if (!string.IsNullOrWhiteSpace(dto.Distrito))          voluntario.Distrito          = dto.Distrito;
        if (!string.IsNullOrWhiteSpace(dto.CorreoElectronico)) voluntario.CorreoElectronico = dto.CorreoElectronico;
        if (!string.IsNullOrWhiteSpace(dto.NumeroTelefonico))  voluntario.NumeroTelefonico  = dto.NumeroTelefonico;

        await repository.UpdateAsync(voluntario);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var voluntario = await repository.GetByIdAsync(id);
        if (voluntario is null) return false;

        await repository.DeleteAsync(voluntario);
        return true;
    }

    private static VoluntarioResponseDto ToDto(Voluntario v) => new()
    {
        Id                = v.Id,
        NombreCompleto    = v.NombreCompleto,
        Sexo              = v.Sexo,
        Categoria         = v.Categoria,
        Regional          = v.Regional,
        Distrito          = v.Distrito,
        CorreoElectronico = v.CorreoElectronico,
        NumeroTelefonico  = v.NumeroTelefonico,
    };
}
