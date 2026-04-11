using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Entities;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class ParticipacionService(
    IParticipacionRepository participacionRepository,
    IParticipanteRepository participanteRepository) : IParticipacionService
{
    public async Task<ParticipacionResponseDto?> GetByParticipanteIdAsync(int idParticipante)
    {
        var p = await participacionRepository.GetByParticipanteIdAsync(idParticipante);
        return p is null ? null : ToDto(p);
    }

    public async Task<(ParticipacionResponseDto? result, string? error)> SumarAsync(int idParticipante)
        => await CambiarConteoAsync(idParticipante, +1);

    public async Task<(ParticipacionResponseDto? result, string? error)> RestarAsync(int idParticipante)
        => await CambiarConteoAsync(idParticipante, -1);

    private async Task<(ParticipacionResponseDto? result, string? error)> CambiarConteoAsync(int idParticipante, int delta)
    {
        if (!await participanteRepository.ExistsAsync(idParticipante))
            return (null, "not_found");

        var participacion = await participacionRepository.GetByParticipanteIdAsync(idParticipante)
            ?? new Participacion { IdParticipante = idParticipante, NumParticipaciones = 0 };

        var nuevo = participacion.NumParticipaciones + delta;
        if (nuevo < 0) return (null, "negative");

        participacion.NumParticipaciones = (short)nuevo;
        var guardado = await participacionRepository.UpsertAsync(participacion);
        return (ToDto(guardado), null);
    }

    private static ParticipacionResponseDto ToDto(Participacion p) => new()
    {
        IdParticipante     = p.IdParticipante,
        NumParticipaciones = p.NumParticipaciones
    };
}
