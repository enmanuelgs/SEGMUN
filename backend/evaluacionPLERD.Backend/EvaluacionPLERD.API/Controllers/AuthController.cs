using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EvaluacionPLERD.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    // POST api/auth/organizador/login
    [HttpPost("organizador/login")]
    public async Task<IActionResult> LoginOrganizador([FromBody] LoginOrganizadorDto dto)
    {
        try
        {
            var result = await authService.LoginOrganizadorAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }

    // POST api/auth/voluntario/login
    [HttpPost("voluntario/login")]
    public async Task<IActionResult> LoginVoluntario([FromBody] LoginVoluntarioDto dto)
    {
        try
        {
            var result = await authService.LoginVoluntarioAsync(dto);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(ex.Message);
        }
    }
}
