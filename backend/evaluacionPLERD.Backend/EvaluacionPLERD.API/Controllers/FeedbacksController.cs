using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/participantes/{idParticipante:int}/feedback")]
public class FeedbacksController(IFeedbackService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(int idParticipante)
    {
        var result = await service.GetByParticipanteIdAsync(idParticipante);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut]
    public async Task<IActionResult> Editar(int idParticipante, [FromBody] EditarFeedbackDto dto)
    {
        var result = await service.UpdateAsync(idParticipante, dto);
        return result is null ? NotFound() : Ok(result);
    }
}
