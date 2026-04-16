using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/comisiones/{idComision:int}/mesa-directiva")]
[Authorize(Roles = "Organizador,Voluntario")]
public class MesaDirectivaController(IVoluntarioComisionService service) : ControllerBase
{
    // GET api/comisiones/1/mesa-directiva
    [HttpGet]
    public async Task<IActionResult> GetByComision(int idComision)
    {
        var result = await service.GetByComisionAsync(idComision);
        return result is null ? NotFound() : Ok(result);
    }

    // PUT api/comisiones/1/mesa-directiva
    [HttpPut]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> AsignarOActualizar(int idComision, [FromBody] AsignarMesaDirectivaDto dto)
    {
        dto.IdComision = idComision;
        try
        {
            var result = await service.AsignarOActualizarAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }
}
