using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Organizador")]
public class OrganizadoresController(IOrganizadorService service) : ControllerBase
{
    // GET api/organizadores
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await service.GetAllAsync());

    // GET api/organizadores/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    // POST api/organizadores
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearOrganizadorDto dto)
    {
        try
        {
            var creado = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = creado.Id }, creado);
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }

    // PUT api/organizadores/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, [FromBody] EditarOrganizadorDto dto)
    {
        var actualizado = await service.UpdateAsync(id, dto);
        return actualizado ? NoContent() : NotFound();
    }

    // DELETE api/organizadores/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var eliminado = await service.DeleteAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
