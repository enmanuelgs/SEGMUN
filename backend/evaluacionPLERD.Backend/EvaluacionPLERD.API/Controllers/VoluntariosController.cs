using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Organizador")]
public class VoluntariosController(IVoluntarioService service) : ControllerBase
{
    // GET api/voluntarios
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await service.GetAllAsync());

    // GET api/voluntarios/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    // POST api/voluntarios
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearVoluntarioDto dto)
    {
        try
        {
            var creado = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = creado.Id }, creado);
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }

    // PUT api/voluntarios/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, [FromBody] EditarVoluntarioDto dto)
    {
        try
        {
            var actualizado = await service.UpdateAsync(id, dto);
            return actualizado ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }

    // DELETE api/voluntarios/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var eliminado = await service.DeleteAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
