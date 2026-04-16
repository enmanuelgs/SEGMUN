using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginOrganizadorAsync(LoginOrganizadorDto dto);
    Task<AuthResponseDto> LoginVoluntarioAsync(LoginVoluntarioDto dto);
}
