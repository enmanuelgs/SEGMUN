using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/modelos/{idModelo:int}/comisiones")]
[Authorize(Roles = "Organizador,Voluntario")]
public class ComisionesController(IComisionService service) : ControllerBase
{
    // GET api/modelos/1/comisiones
    [HttpGet]
    public async Task<IActionResult> GetAll(int idModelo)
        => Ok(await service.GetAllByModeloAsync(idModelo));

    // GET api/modelos/1/comisiones/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int idModelo, int id)
    {
        var result = await service.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    // POST api/modelos/1/comisiones
    [HttpPost]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Crear(int idModelo, [FromBody] CrearComisionDto dto)
    {
        dto.IdModelo = idModelo;
        try
        {
            var creada = await service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { idModelo, id = creada.Id }, creada);
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }

    // PUT api/modelos/1/comisiones/5
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Editar(int idModelo, int id, [FromBody] EditarComisionDto dto)
    {
        try
        {
            var actualizado = await service.UpdateAsync(id, dto);
            return actualizado ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return Conflict(ex.Message); }
    }

    // DELETE api/modelos/1/comisiones/5
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Organizador")]
    public async Task<IActionResult> Eliminar(int idModelo, int id)
    {
        var eliminado = await service.DeleteAsync(id);
        return eliminado ? NoContent() : NotFound();
    }
}
