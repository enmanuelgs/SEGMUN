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
    public async Task<IEnumerable<ParticipanteResponseDto>> GetAllAsync(int? idModelo, int? idComision, string? nombres, string? apellidos, string? numeracion)
    {
        var participantes = await repository.GetAllAsync(idModelo, idComision, nombres, apellidos, numeracion);
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
            IdModelo       = dto.IdModelo,
            IdComision     = dto.IdComision,
            Numeracion     = dto.Numeracion,
            NoRegistro     = dto.NoRegistro,
            Representacion = dto.Representacion,
            Nombres        = dto.Nombres,
            Apellidos      = dto.Apellidos,
            NumeroTelefono = dto.NumeroTelefono,
            Correo         = dto.Correo,
            Regional       = dto.Regional,
            Distrito       = dto.Distrito,
            CentroEducativo = dto.CentroEducativo,
            LlaveUnica      = dto.LlaveUnica,
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
                Numeracion         = creado.Numeracion,
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

        if (dto.IdComision.HasValue)
            participante.IdComision = dto.IdComision.Value;

        if (!string.IsNullOrWhiteSpace(dto.Nombres))
            participante.Nombres = dto.Nombres;

        if (!string.IsNullOrWhiteSpace(dto.Apellidos))
            participante.Apellidos = dto.Apellidos;

        if (dto.Numeracion is not null)
            participante.Numeracion = dto.Numeracion;

        if (dto.NoRegistro.HasValue)
            participante.NoRegistro = dto.NoRegistro.Value;

        if (dto.Representacion is not null)
            participante.Representacion = dto.Representacion;

        if (dto.NumeroTelefono is not null)
            participante.NumeroTelefono = dto.NumeroTelefono;

        if (dto.Correo is not null)
            participante.Correo = dto.Correo;

        if (dto.Regional is not null)
            participante.Regional = dto.Regional;

        if (dto.Distrito is not null)
            participante.Distrito = dto.Distrito;

        if (dto.CentroEducativo is not null)
            participante.CentroEducativo = dto.CentroEducativo;

        if (dto.LlaveUnica is not null)
            participante.LlaveUnica = dto.LlaveUnica;

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
        Id             = p.Id,
        IdModelo       = p.IdModelo,
        IdComision     = p.IdComision,
        Numeracion     = p.Numeracion,
        NoRegistro     = p.NoRegistro,
        Representacion = p.Representacion,
        Nombres        = p.Nombres,
        Apellidos      = p.Apellidos,
        NumeroTelefono = p.NumeroTelefono,
        Correo         = p.Correo,
        Regional       = p.Regional,
        Distrito       = p.Distrito,
        CentroEducativo = p.CentroEducativo,
        LlaveUnica      = p.LlaveUnica,
    };
}
