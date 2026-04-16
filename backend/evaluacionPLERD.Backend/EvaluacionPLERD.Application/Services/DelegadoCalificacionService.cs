using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class DelegadoCalificacionService(
    IDelegadoCalificacionRepository repository,
    IParticipanteRepository participanteRepository,
    IComisionRepository comisionRepository) : IDelegadoCalificacionService
{
    public async Task<IEnumerable<DelegadoCalificacionResponseDto>> GetByComisionAsync(int idComision)
    {
        var calificaciones = await repository.GetByComisionAsync(idComision);
        return calificaciones.Select(ToDto);
    }

    public async Task<DelegadoCalificacionResponseDto?> GetByParticipanteAndComisionAsync(int idParticipante, int idComision)
    {
        var c = await repository.GetByParticipanteAndComisionAsync(idParticipante, idComision);
        return c is null ? null : ToDto(c);
    }

    public async Task<DelegadoCalificacionResponseDto> ActualizarAsync(int idParticipante, int idComision, ActualizarDelegadoCalificacionDto dto)
    {
        var participante = await participanteRepository.GetByIdAsync(idParticipante);
        if (participante is null)
            throw new InvalidOperationException("El participante especificado no existe.");

        var comision = await comisionRepository.GetByIdAsync(idComision);
        if (comision is null)
            throw new InvalidOperationException("La comisión especificada no existe.");

        var existente = await repository.GetByParticipanteAndComisionAsync(idParticipante, idComision);

        if (existente is null)
        {
            existente = new DelegadoCalificacion
            {
                IdParticipante = idParticipante,
                IdComision     = idComision,
                CFinal         = dto.CFinal!.Value,
            };
            existente = await repository.CreateAsync(existente);
        }
        else
        {
            existente.CFinal = dto.CFinal!.Value;
            await repository.UpdateAsync(existente);
        }

        existente.Participante = participante;
        existente.Comision     = comision;
        return ToDto(existente);
    }

    private static DelegadoCalificacionResponseDto ToDto(DelegadoCalificacion c) => new()
    {
        Id             = c.Id,
        IdParticipante = c.IdParticipante,
        Nombres        = c.Participante?.Nombres ?? string.Empty,
        Apellidos      = c.Participante?.Apellidos ?? string.Empty,
        IdComision     = c.IdComision,
        NombreComision = c.Comision?.NombreComision ?? string.Empty,
        CFinal         = c.CFinal,
    };
}
