using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/sesionestrabajo")]
public class SesionesTrabajoController(ISesionTrabajoService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? idModelo)
    {
        var sesiones = await service.GetAllAsync(idModelo);
        return Ok(sesiones);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sesion = await service.GetByIdAsync(id);
        return sesion is null ? NotFound() : Ok(sesion);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CrearSesionTrabajoDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.NumSesionTrabajo))
            return BadRequest("NumSesionTrabajo es obligatorio.");
        var creada = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = creada.Id }, creada);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}
