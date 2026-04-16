using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Organizador,Voluntario")]
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
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Crear([FromBody] CrearModeloDto dto)
    {
        try
        {
            var creado = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = creado.Id }, creado);
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }

    // PUT api/modelos/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Editar(int id, [FromBody] CrearModeloDto dto)
    {
        var result = await service.UpdateAsync(id, dto);
        return result is null ? NotFound() : Ok(result);
    }

    // DELETE api/modelos/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Eliminar(int id)
    {
        await service.DeleteAsync(id);
        return NoContent();
    }
}
