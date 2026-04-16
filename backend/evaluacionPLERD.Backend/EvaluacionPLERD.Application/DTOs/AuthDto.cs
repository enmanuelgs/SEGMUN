using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class LoginOrganizadorDto
{
    [Required]
    public string NombreCompleto { get; set; } = null!;

    [Required]
    public string Contrasena { get; set; } = null!;
}

public class LoginVoluntarioDto
{
    [Required]
    public string NombreCompleto { get; set; } = null!;

    [Required]
    public string Contrasena { get; set; } = null!;
}

public class AuthResponseDto
{
    public string Token       { get; set; } = null!;
    public string Rol         { get; set; } = null!;
    public int    Id          { get; set; }
    public string Nombre      { get; set; } = null!;
    public string? Regional   { get; set; }
    public string? Distrito   { get; set; }
    public string? Cargo      { get; set; }
    public bool   EsSuperuser { get; set; }
    public DateTime Expira    { get; set; }
}
