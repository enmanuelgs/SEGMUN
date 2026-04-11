using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class ModeloService(IModeloRepository repository) : IModeloService
{
    public async Task<IEnumerable<ModeloResponseDto>> GetAllAsync()
    {
        var modelos = await repository.GetAllAsync();
        return modelos.Select(ToDto);
    }

    public async Task<ModeloResponseDto?> GetByIdAsync(int id)
    {
        var modelo = await repository.GetByIdAsync(id);
        return modelo is null ? null : ToDto(modelo);
    }

    public async Task<ModeloResponseDto> CreateAsync(CrearModeloDto dto)
    {
        if (await repository.ExisteDuplicadoAsync(dto.Distrito, dto.AnioEdicion))
            throw new InvalidOperationException(
                $"Ya existe un modelo para el distrito '{dto.Distrito}' en la edición {dto.AnioEdicion}.");

        var modelo = new Modelo
        {
            Distrito    = dto.Distrito,
            Regional    = dto.Regional,
            AnioEdicion = dto.AnioEdicion,
        };
        var creado = await repository.CreateAsync(modelo);
        return ToDto(creado);
    }

    public async Task DeleteAsync(int id) => await repository.DeleteAsync(id);

    private static ModeloResponseDto ToDto(Modelo m) => new()
    {
        Id                 = m.Id,
        Distrito           = m.Distrito,
        Regional           = m.Regional,
        AnioEdicion        = m.AnioEdicion,
        TotalParticipantes = m.Participantes.Count,
    };
}
