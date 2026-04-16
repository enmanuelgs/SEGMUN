using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/participantes/{idParticipante:int}/participaciones")]
[Authorize(Roles = "Voluntario")]
public class ParticipacionesController(IParticipacionService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(int idParticipante)
    {
        var result = await service.GetByParticipanteIdAsync(idParticipante);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("sumar")]
    public async Task<IActionResult> Sumar(int idParticipante)
    {
        var (result, error) = await service.SumarAsync(idParticipante);
        return error switch
        {
            "not_found" => NotFound(),
            _ => Ok(result)
        };
    }

    [HttpPost("restar")]
    public async Task<IActionResult> Restar(int idParticipante)
    {
        var (result, error) = await service.RestarAsync(idParticipante);
        return error switch
        {
            "not_found" => NotFound(),
            "negative"  => BadRequest(new { mensaje = "El conteo no puede ser negativo." }),
            _ => Ok(result)
        };
    }
}
