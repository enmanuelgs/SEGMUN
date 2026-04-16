using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Organizador,Voluntario")]
public class ParticipantesController(IParticipanteService service) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int?    idModelo,
        [FromQuery] int?    idComision,
        [FromQuery] string? nombres,
        [FromQuery] string? apellidos,
        [FromQuery] string? numeracion)
        => Ok(await service.GetAllAsync(idModelo, idComision, nombres, apellidos, numeracion));

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Crear([FromBody] CrearParticipanteDto dto)
    {
        var creado = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = creado.Id }, creado);
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Editar(int id, [FromBody] EditarParticipanteDto dto)
    {
        var actualizado = await service.UpdateAsync(id, dto);
        return actualizado ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var eliminado = await service.DeleteAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
