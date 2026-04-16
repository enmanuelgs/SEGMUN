using EvaluacionPLERD.Application.DTOs;
using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Interfaces;

namespace EvaluacionPLERD.Application.Services;

public class AuthService(
    IOrganizadorRepository organizadorRepository,
    IVoluntarioRepository voluntarioRepository,
    IJwtService jwtService) : IAuthService
{
    public async Task<AuthResponseDto> LoginOrganizadorAsync(LoginOrganizadorDto dto)
    {
        var voluntario = await voluntarioRepository.GetByNombreCompletoAsync(dto.NombreCompleto)
            ?? throw new UnauthorizedAccessException("Credenciales inválidas.");

        var organizador = await organizadorRepository.GetByVoluntarioAsync(voluntario.Id)
            ?? throw new UnauthorizedAccessException("Este voluntario no tiene rol de organizador.");

        if (organizador.Contrasena != dto.Contrasena)
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        var (token, expira) = jwtService.GenerarToken(organizador.Id, voluntario.NombreCompleto, "Organizador");

        return new AuthResponseDto
        {
            Token    = token,
            Rol      = "Organizador",
            Id       = organizador.Id,
            Nombre   = voluntario.NombreCompleto,
            Regional = organizador.Regional,
            Distrito = organizador.Distrito,
            Cargo    = organizador.Cargo,
            Expira   = expira,
        };
    }

    public async Task<AuthResponseDto> LoginVoluntarioAsync(LoginVoluntarioDto dto)
    {
        var voluntario = await voluntarioRepository.GetByNombreCompletoAsync(dto.NombreCompleto)
            ?? throw new UnauthorizedAccessException("Credenciales inválidas.");

        if (voluntario.Contrasena != dto.Contrasena)
            throw new UnauthorizedAccessException("Credenciales inválidas.");

        var (token, expira) = jwtService.GenerarToken(voluntario.Id, voluntario.NombreCompleto, "Voluntario");

        return new AuthResponseDto
        {
            Token   = token,
            Rol     = "Voluntario",
            Id      = voluntario.Id,
            Nombre  = voluntario.NombreCompleto,
            Expira  = expira,
        };
    }
}
