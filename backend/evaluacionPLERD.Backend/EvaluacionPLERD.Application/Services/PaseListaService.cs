using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class PaseListaService(IPaseListaRepository repo) : IPaseListaService
{
    public async Task<IEnumerable<PaseListaResponseDto>> GetBySesionAsync(int idSesionTrabajo)
    {
        var pases = await repo.GetBySesionAsync(idSesionTrabajo);
        return pases.Select(ToDto);
    }

    public async Task<PaseListaResponseDto> ActualizarEstadoAsync(
        int idSesionTrabajo, int idParticipante, ActualizarPaseListaDto dto)
    {
        var estados = new[] { "Presente", "Ausente", "Tardanza" };
        if (!estados.Contains(dto.EstadoPresencia))
            throw new ArgumentException($"EstadoPresencia debe ser: {string.Join(", ", estados)}");

        var pase = await repo.UpdateEstadoAsync(idSesionTrabajo, idParticipante, dto.EstadoPresencia);
        return ToDto(pase);
    }

    private static PaseListaResponseDto ToDto(PaseLista p) => new()
    {
        Id                 = p.Id,
        IdSesionTrabajo    = p.IdSesionTrabajo,
        IdParticipante     = p.IdParticipante,
        NumSesionTrabajo   = p.NumSesionTrabajo,
        NumeracionPLERD    = p.NumeracionPLERD,
        NombreParticipante = p.NombreParticipante,
        EstadoPresencia    = p.EstadoPresencia,
    };
}
