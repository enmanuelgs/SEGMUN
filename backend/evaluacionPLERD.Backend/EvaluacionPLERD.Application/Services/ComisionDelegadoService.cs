using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class ComisionDelegadoService(
    IComisionDelegadoRepository repository,
    IComisionRepository comisionRepository,
    IParticipanteRepository participanteRepository) : IComisionDelegadoService
{
    public async Task<IEnumerable<ComisionDelegadoResponseDto>> GetByComisionAsync(int idComision)
    {
        var asignaciones = await repository.GetByComisionAsync(idComision);
        return asignaciones.Select(ToDto);
    }

    public async Task<ComisionDelegadoResponseDto> AsignarAsync(AsignarDelegadoDto dto)
    {
        var comision = await comisionRepository.GetByIdAsync(dto.IdComision!.Value);
        if (comision is null)
            throw new InvalidOperationException("La comisión especificada no existe.");

        var participante = await participanteRepository.GetByIdAsync(dto.IdParticipante!.Value);
        if (participante is null)
            throw new InvalidOperationException("El participante especificado no existe.");

        var yaAsignado = await repository.GetByComisionAndParticipanteAsync(dto.IdComision!.Value, dto.IdParticipante!.Value);
        if (yaAsignado is not null)
            throw new InvalidOperationException("Este participante ya está asignado a esta comisión.");

        var yaEnModelo = await repository.ExisteEnModeloAsync(comision.IdModelo, dto.IdParticipante!.Value);
        if (yaEnModelo)
            throw new InvalidOperationException("Este participante ya está asignado a otra comisión en este modelo.");

        // Actualizar representación si se proporcionó
        if (!string.IsNullOrWhiteSpace(dto.Representacion))
        {
            participante.Representacion = dto.Representacion.Trim();
            await participanteRepository.UpdateAsync(participante);
        }

        var excede = comision.NosRegistros >= comision.MaxParticipantes;
        var orden  = await repository.GetNextOrdenIngresoAsync(dto.IdComision!.Value);

        var asignacion = new ComisionDelegado
        {
            IdComision      = dto.IdComision!.Value,
            IdParticipante  = dto.IdParticipante!.Value,
            OrdenIngreso    = orden,
            ExcedeCupo      = excede,
            FechaAsignacion = DateTime.UtcNow,
        };

        var creada = await repository.CreateAsync(asignacion);

        // Incrementar contador de registros en la comisión
        comision.NosRegistros++;
        await comisionRepository.UpdateAsync(comision);

        creada.Comision     = comision;
        creada.Participante = participante;
        return ToDto(creada);
    }

    public async Task<bool> RemoverAsync(int idComision, int idParticipante)
    {
        var asignacion = await repository.GetByComisionAndParticipanteAsync(idComision, idParticipante);
        if (asignacion is null) return false;

        await repository.DeleteAsync(asignacion);

        // Decrementar contador
        var comision = await comisionRepository.GetByIdAsync(idComision);
        if (comision is not null && comision.NosRegistros > 0)
        {
            comision.NosRegistros--;
            await comisionRepository.UpdateAsync(comision);

            // Principio FIFO: si quedó cupo libre, promover el primer excedente
            if (!asignacion.ExcedeCupo)
            {
                var excedentes = await repository.GetExcedentesFifoAsync(idComision);
                var primero = excedentes.FirstOrDefault();
                if (primero is not null)
                {
                    primero.ExcedeCupo = false;
                    await repository.UpdateAsync(primero);
                }
            }
        }

        return true;
    }

    private static ComisionDelegadoResponseDto ToDto(ComisionDelegado cd) => new()
    {
        Id              = cd.Id,
        IdComision      = cd.IdComision,
        NombreComision  = cd.Comision?.NombreComision ?? string.Empty,
        IdParticipante  = cd.IdParticipante,
        Nombres         = cd.Participante?.Nombres ?? string.Empty,
        Apellidos       = cd.Participante?.Apellidos ?? string.Empty,
        Representacion  = cd.Participante?.Representacion,
        OrdenIngreso    = cd.OrdenIngreso,
        ExcedeCupo      = cd.ExcedeCupo,
        FechaAsignacion = cd.FechaAsignacion,
    };
}
