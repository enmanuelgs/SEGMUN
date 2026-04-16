using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class CrearVoluntarioDto
{
    [Required]
    [MaxLength(100)]
    public string NombreCompleto { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string Contrasena { get; set; } = null!;

    [Required]
    [MaxLength(10)]
    public string Sexo { get; set; } = null!;

    /// <summary>V-Nacional, V-Regional, V-Distrital</summary>
    [Required]
    [MaxLength(50)]
    public string Categoria { get; set; } = null!;

    [Required]
    [MaxLength(2)]
    public string Regional { get; set; } = null!;

    [Required]
    [MaxLength(5)]
    public string Distrito { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string CorreoElectronico { get; set; } = null!;

    [Required]
    [MaxLength(20)]
    public string NumeroTelefonico { get; set; } = null!;
}

public class EditarVoluntarioDto
{
    [MaxLength(100)]
    public string? NombreCompleto { get; set; }

    [MaxLength(50)]
    public string? Contrasena { get; set; }

    [MaxLength(10)]
    public string? Sexo { get; set; }

    [MaxLength(50)]
    public string? Categoria { get; set; }

    [MaxLength(2)]
    public string? Regional { get; set; }

    [MaxLength(5)]
    public string? Distrito { get; set; }

    [MaxLength(50)]
    public string? CorreoElectronico { get; set; }

    [MaxLength(20)]
    public string? NumeroTelefonico { get; set; }
}

public class VoluntarioResponseDto
{
    public int    Id                { get; set; }
    public string NombreCompleto    { get; set; } = null!;
    public string Sexo              { get; set; } = null!;
    public string Categoria         { get; set; } = null!;
    public string Regional          { get; set; } = null!;
    public string Distrito          { get; set; } = null!;
    public string CorreoElectronico { get; set; } = null!;
    public string NumeroTelefonico  { get; set; } = null!;
}
