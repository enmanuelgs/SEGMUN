using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/comisiones/{idComision:int}/calificaciones-finales")]
[Authorize(Roles = "Voluntario")]
public class DelegadoCalificacionesController(IDelegadoCalificacionService service) : ControllerBase
{
    // GET api/comisiones/1/calificaciones-finales
    [HttpGet]
    public async Task<IActionResult> GetByComision(int idComision)
        => Ok(await service.GetByComisionAsync(idComision));

    // GET api/comisiones/1/calificaciones-finales/participante/5
    [HttpGet("participante/{idParticipante:int}")]
    public async Task<IActionResult> GetByParticipante(int idComision, int idParticipante)
    {
        var result = await service.GetByParticipanteAndComisionAsync(idParticipante, idComision);
        return result is null ? NotFound() : Ok(result);
    }

    // PUT api/comisiones/1/calificaciones-finales/participante/5
    [HttpPut("participante/{idParticipante:int}")]
    public async Task<IActionResult> Actualizar(int idComision, int idParticipante, [FromBody] ActualizarDelegadoCalificacionDto dto)
    {
        try
        {
            var result = await service.ActualizarAsync(idParticipante, idComision, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }
}
