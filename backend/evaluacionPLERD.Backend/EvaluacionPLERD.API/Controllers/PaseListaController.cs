using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/paselista")]
public class PaseListaController(IPaseListaService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetBySesion([FromQuery] int idSesionTrabajo)
    {
        var pases = await service.GetBySesionAsync(idSesionTrabajo);
        return Ok(pases);
    }

    [HttpPut("{idSesionTrabajo:int}/{idParticipante:int}")]
    public async Task<IActionResult> ActualizarEstado(
        int idSesionTrabajo, int idParticipante, [FromBody] ActualizarPaseListaDto dto)
    {
        try
        {
            var pase = await service.ActualizarEstadoAsync(idSesionTrabajo, idParticipante, dto);
            return Ok(pase);
        }
        catch (ArgumentException ex)   { return BadRequest(ex.Message); }
        catch (KeyNotFoundException ex) { return NotFound(ex.Message); }
    }
}
