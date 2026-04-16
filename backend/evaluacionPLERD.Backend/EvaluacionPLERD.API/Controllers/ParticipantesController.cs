using System.Security.Claims;
using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Organizador,Voluntario")]
public class ParticipantesController(IParticipanteService service, IModeloService modeloService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] int?    idModelo,
        [FromQuery] int?    idComision,
        [FromQuery] string? nombres,
        [FromQuery] string? apellidos,
        [FromQuery] string? numeracion)
    {
        var esSuperuser = User.FindFirstValue("EsSuperuser") == "true";
        var rol         = User.FindFirstValue(ClaimTypes.Role);

        // Superuser y voluntarios acceden sin restricciones
        if (esSuperuser || rol == "Voluntario")
            return Ok(await service.GetAllAsync(idModelo, idComision, nombres, apellidos, numeracion));

        // Organizador normal: construir lista de IDs de modelos permitidos
        var regional = User.FindFirstValue("Regional");
        var distrito = User.FindFirstValue("Distrito");

        if (string.IsNullOrEmpty(regional))
            return Ok(Enumerable.Empty<ParticipanteResponseDto>());

        IEnumerable<ModeloResponseDto> modelosPermitidos = !string.IsNullOrEmpty(distrito)
            ? await modeloService.GetByDistritoAsync(regional, distrito)
            : await modeloService.GetByRegionalAsync(regional);

        var idsPermitidos = modelosPermitidos.Select(m => m.Id).ToHashSet();

        // Si pidieron un modelo específico, validar que sea permitido
        if (idModelo.HasValue && !idsPermitidos.Contains(idModelo.Value))
            return Forbid();

        // Si pidieron un modelo permitido (o ninguno), filtrar por los permitidos
        if (!idModelo.HasValue && idsPermitidos.Count > 0)
        {
            // Sin filtro de modelo: devolver todos los participantes de los modelos permitidos
            var todos = new List<ParticipanteResponseDto>();
            foreach (var id in idsPermitidos)
            {
                var parte = await service.GetAllAsync(id, idComision, nombres, apellidos, numeracion);
                todos.AddRange(parte);
            }
            return Ok(todos);
        }

        return Ok(await service.GetAllAsync(idModelo, idComision, nombres, apellidos, numeracion));
    }

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
