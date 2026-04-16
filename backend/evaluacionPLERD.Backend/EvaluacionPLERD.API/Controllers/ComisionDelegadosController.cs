using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/comisiones/{idComision:int}/delegados")]
[Authorize(Roles = "Organizador,Voluntario")]
public class ComisionDelegadosController(IComisionDelegadoService service) : ControllerBase
{
    // GET api/comisiones/1/delegados
    [HttpGet]
    public async Task<IActionResult> GetByComision(int idComision)
        => Ok(await service.GetByComisionAsync(idComision));

    // POST api/comisiones/1/delegados
    [HttpPost]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Asignar(int idComision, [FromBody] AsignarDelegadoDto dto)
    {
        dto.IdComision = idComision;
        try
        {
            var result = await service.AsignarAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }

    // DELETE api/comisiones/1/delegados/5
    [HttpDelete("{idParticipante:int}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Remover(int idComision, int idParticipante)
    {
        var removido = await service.RemoverAsync(idComision, idParticipante);
        return removido ? NoContent() : NotFound();
    }
}
