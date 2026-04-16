using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class VoluntarioComisionService(
    IVoluntarioComisionRepository repository,
    IComisionRepository comisionRepository,
    IVoluntarioRepository voluntarioRepository) : IVoluntarioComisionService
{
    public async Task<VoluntarioComisionResponseDto?> GetByComisionAsync(int idComision)
    {
        var vc = await repository.GetByComisionAsync(idComision);
        return vc is null ? null : ToDto(vc);
    }

    public async Task<VoluntarioComisionResponseDto> AsignarOActualizarAsync(AsignarMesaDirectivaDto dto)
    {
        var comision = await comisionRepository.GetByIdAsync(dto.IdComision!.Value);
        if (comision is null)
            throw new InvalidOperationException("La comisión especificada no existe.");

        // Validar que cada voluntario no tenga ya un cargo en otra comisión del mismo día
        await ValidarCargo(dto.IdDirector, "Director",  dto.IdComision!.Value);
        await ValidarCargo(dto.IdAdjunto1, "Adjunto 1", dto.IdComision!.Value);
        await ValidarCargo(dto.IdAdjunto2, "Adjunto 2", dto.IdComision!.Value);
        await ValidarCargo(dto.IdEyC,      "EyC",       dto.IdComision!.Value);

        var existente = await repository.GetByComisionAsync(dto.IdComision!.Value);

        if (existente is null)
        {
            var nuevo = new VoluntarioComision
            {
                IdComision = dto.IdComision!.Value,
                IdDirector = dto.IdDirector,
                IdAdjunto1 = dto.IdAdjunto1,
                IdAdjunto2 = dto.IdAdjunto2,
                IdEyC      = dto.IdEyC,
            };
            existente = await repository.CreateAsync(nuevo);
        }
        else
        {
            existente.IdDirector = dto.IdDirector;
            existente.IdAdjunto1 = dto.IdAdjunto1;
            existente.IdAdjunto2 = dto.IdAdjunto2;
            existente.IdEyC      = dto.IdEyC;
            await repository.UpdateAsync(existente);
        }

        // Recargar con nombres de voluntarios
        existente = await repository.GetByComisionAsync(dto.IdComision!.Value) ?? existente;
        existente.Comision = comision;
        return ToDto(existente);
    }

    private async Task ValidarCargo(int? idVoluntario, string cargo, int idComision)
    {
        if (idVoluntario is null) return;

        if (!await voluntarioRepository.ExistsAsync(idVoluntario.Value))
            throw new InvalidOperationException($"El voluntario asignado como {cargo} no existe.");

        if (await repository.VoluntarioTieneConflictoFechaAsync(idVoluntario.Value, idComision))
            throw new InvalidOperationException(
                $"El voluntario asignado como {cargo} ya ocupa un cargo en otra comisión celebrada el mismo día.");
    }

    private static VoluntarioComisionResponseDto ToDto(VoluntarioComision vc) => new()
    {
        Id              = vc.Id,
        IdComision      = vc.IdComision,
        NombreComision  = vc.Comision?.NombreComision ?? string.Empty,
        IdDirector      = vc.IdDirector,
        NombreDirector  = vc.Director?.NombreCompleto,
        IdAdjunto1      = vc.IdAdjunto1,
        NombreAdjunto1  = vc.Adjunto1?.NombreCompleto,
        IdAdjunto2      = vc.IdAdjunto2,
        NombreAdjunto2  = vc.Adjunto2?.NombreCompleto,
        IdEyC           = vc.IdEyC,
        NombreEyC       = vc.EyC?.NombreCompleto,
    };
}
