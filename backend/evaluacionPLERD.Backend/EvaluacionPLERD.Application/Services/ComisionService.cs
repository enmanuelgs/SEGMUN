using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class ComisionService(
    IComisionRepository repository,
    IModeloRepository modeloRepository) : IComisionService
{
    public async Task<IEnumerable<ComisionResponseDto>> GetAllByModeloAsync(int idModelo)
    {
        var comisiones = await repository.GetAllByModeloAsync(idModelo);
        return comisiones.Select(ToDto);
    }

    public async Task<ComisionResponseDto?> GetByIdAsync(int id)
    {
        var c = await repository.GetByIdAsync(id);
        return c is null ? null : ToDto(c);
    }

    public async Task<ComisionResponseDto> CreateAsync(CrearComisionDto dto)
    {
        if (!await modeloRepository.ExistsAsync(dto.IdModelo!.Value))
            throw new InvalidOperationException("El modelo especificado no existe.");

        if (await repository.NombreExistsInModeloAsync(dto.IdModelo!.Value, dto.NombreComision))
            throw new InvalidOperationException($"Ya existe una comisión con el nombre '{dto.NombreComision}' en este modelo.");

        var comision = new Comision
        {
            IdModelo         = dto.IdModelo!.Value,
            NombreComision   = dto.NombreComision,
            MaxParticipantes = dto.MaxParticipantes!.Value,
            NosRegistros     = 0,
        };

        var creada = await repository.CreateAsync(comision);
        return ToDto(creada);
    }

    public async Task<bool> UpdateAsync(int id, EditarComisionDto dto)
    {
        var comision = await repository.GetByIdAsync(id);
        if (comision is null) return false;

        if (!string.IsNullOrWhiteSpace(dto.NombreComision))
        {
            if (await repository.NombreExistsInModeloAsync(comision.IdModelo, dto.NombreComision) &&
                dto.NombreComision != comision.NombreComision)
                throw new InvalidOperationException($"Ya existe una comisión con el nombre '{dto.NombreComision}' en este modelo.");
            comision.NombreComision = dto.NombreComision;
        }

        if (dto.MaxParticipantes.HasValue)
            comision.MaxParticipantes = dto.MaxParticipantes.Value;

        await repository.UpdateAsync(comision);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var comision = await repository.GetByIdAsync(id);
        if (comision is null) return false;

        await repository.DeleteAsync(comision);
        return true;
    }

    private static ComisionResponseDto ToDto(Comision c) => new()
    {
        Id               = c.Id,
        IdModelo         = c.IdModelo,
        NombreComision   = c.NombreComision,
        MaxParticipantes = c.MaxParticipantes,
        NosRegistros     = c.NosRegistros,
    };
}
