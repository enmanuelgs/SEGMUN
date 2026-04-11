using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelosController(IModeloService service) : ControllerBase
{
    // GET api/modelos
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await service.GetAllAsync());

    // GET api/modelos/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    // POST api/modelos
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearModeloDto dto)
    {
        try
        {
            var creado = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = creado.Id }, creado);
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }

    // DELETE api/modelos/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}
