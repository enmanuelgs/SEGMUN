using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class SesionTrabajoService(
    ISesionTrabajoRepository sesionRepo,
    IPaseListaRepository paseRepo,
    IParticipanteRepository participanteRepo) : ISesionTrabajoService
{
    public async Task<IEnumerable<SesionTrabajoResponseDto>> GetAllAsync(int? idModelo)
    {
        var sesiones = await sesionRepo.GetAllAsync(idModelo);
        return sesiones.Select(ToDto);
    }

    public async Task<SesionTrabajoResponseDto?> GetByIdAsync(int id)
    {
        var sesion = await sesionRepo.GetByIdAsync(id);
        return sesion is null ? null : ToDto(sesion);
    }

    public async Task<SesionTrabajoResponseDto> CreateAsync(CrearSesionTrabajoDto dto)
    {
        var sesion = new SesionTrabajo
        {
            IdModelo         = dto.IdModelo,
            NumSesionTrabajo = dto.NumSesionTrabajo,
        };
        var creada = await sesionRepo.CreateAsync(sesion);

        // Inicializar pase de lista con todos los participantes del modelo (todos Ausente)
        var participantes = await participanteRepo.GetAllAsync(dto.IdModelo, null, null, null);
        var pases = participantes.Select(p => new PaseLista
        {
            IdSesionTrabajo    = creada.Id,
            IdParticipante     = p.Id,
            NumSesionTrabajo   = creada.NumSesionTrabajo,
            NumeracionPLERD    = p.NumeracionPLERD,
            NombreParticipante = $"{p.Nombres} {p.Apellidos}",
            EstadoPresencia    = "Ausente",
        });
        await paseRepo.CreateManyAsync(pases);

        // Recargar con conteos
        var recargada = await sesionRepo.GetByIdAsync(creada.Id);
        return ToDto(recargada!);
    }

    public async Task DeleteAsync(int id) => await sesionRepo.DeleteAsync(id);

    private static SesionTrabajoResponseDto ToDto(SesionTrabajo s) => new()
    {
        Id               = s.Id,
        IdModelo         = s.IdModelo,
        NumSesionTrabajo = s.NumSesionTrabajo,
        TotalParticipantes = s.PasesLista.Count,
        Presentes          = s.PasesLista.Count(p => p.EstadoPresencia == "Presente"),
        Tardanzas          = s.PasesLista.Count(p => p.EstadoPresencia == "Tardanza"),
        Ausentes           = s.PasesLista.Count(p => p.EstadoPresencia == "Ausente"),
    };
}
