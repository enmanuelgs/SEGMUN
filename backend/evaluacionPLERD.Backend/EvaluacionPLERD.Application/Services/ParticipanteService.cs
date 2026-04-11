using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class ParticipanteService(
    IParticipanteRepository repository,
    ISesionTrabajoRepository sesionRepo,
    IPaseListaRepository paseRepo) : IParticipanteService
{
    public async Task<IEnumerable<ParticipanteResponseDto>> GetAllAsync(int? idModelo, string? nombres, string? apellidos, string? numeracionPLERD)
    {
        var participantes = await repository.GetAllAsync(idModelo, nombres, apellidos, numeracionPLERD);
        return participantes.Select(ToDto);
    }

    public async Task<ParticipanteResponseDto?> GetByIdAsync(int id)
    {
        var p = await repository.GetByIdAsync(id);
        return p is null ? null : ToDto(p);
    }

    public async Task<ParticipanteResponseDto> CreateAsync(CrearParticipanteDto dto)
    {
        var participante = new Participante
        {
            IdModelo        = dto.IdModelo,
            NumeracionPLERD = dto.NumeracionPLERD,
            Nombres         = dto.Nombres,
            Apellidos       = dto.Apellidos,
        };
        var creado = await repository.CreateAsync(participante);

        // Agregarlo al pase de lista de todas las sesiones existentes del modelo (Ausente por defecto)
        if (dto.IdModelo.HasValue)
        {
            var sesiones = await sesionRepo.GetAllAsync(dto.IdModelo);
            var pases = sesiones.Select(s => new PaseLista
            {
                IdSesionTrabajo    = s.Id,
                IdParticipante     = creado.Id,
                NumSesionTrabajo   = s.NumSesionTrabajo,
                NumeracionPLERD    = creado.NumeracionPLERD,
                NombreParticipante = $"{creado.Nombres} {creado.Apellidos}",
                EstadoPresencia    = "Ausente",
            });
            await paseRepo.CreateManyAsync(pases);
        }

        return ToDto(creado);
    }

    public async Task<bool> UpdateAsync(int id, EditarParticipanteDto dto)
    {
        var participante = await repository.GetByIdAsync(id);
        if (participante is null) return false;

        if (dto.IdModelo.HasValue)
            participante.IdModelo = dto.IdModelo.Value;

        if (!string.IsNullOrWhiteSpace(dto.Nombres))
            participante.Nombres = dto.Nombres;

        if (!string.IsNullOrWhiteSpace(dto.Apellidos))
            participante.Apellidos = dto.Apellidos;

        if (dto.NumeracionPLERD is not null)
            participante.NumeracionPLERD = dto.NumeracionPLERD;

        await repository.UpdateAsync(participante);
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var participante = await repository.GetByIdAsync(id);
        if (participante is null) return false;

        await repository.DeleteAsync(participante);
        return true;
    }

    private static ParticipanteResponseDto ToDto(Participante p) => new()
    {
        Id              = p.Id,
        IdModelo        = p.IdModelo,
        NumeracionPLERD = p.NumeracionPLERD,
        Nombres         = p.Nombres,
        Apellidos       = p.Apellidos,
    };
}
