using System.Security.Claims;
using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/participantes/{idParticipante:int}/calificaciones")]
[Authorize(Roles = "Voluntario")]
public class CalificacionesController(ICalificacionService service) : ControllerBase
{
    private int GetVoluntarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub")
                  ?? "0");

    [HttpGet]
    public async Task<IActionResult> Get(int idParticipante)
    {
        var result = await service.GetByParticipanteIdAsync(idParticipante, GetVoluntarioId());
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Editar(int idParticipante, [FromBody] EditarCalificacionDto dto)
    {
        try
        {
            var result = await service.UpdateAsync(idParticipante, GetVoluntarioId(), dto);
            return result is null ? NotFound() : Ok(result);
        }
        catch (InvalidOperationException ex) { return Forbid(); }
    }
}
