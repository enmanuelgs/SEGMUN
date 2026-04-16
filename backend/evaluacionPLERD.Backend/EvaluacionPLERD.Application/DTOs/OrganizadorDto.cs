using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class CrearOrganizadorDto
{
    [Required]
    public int? IdVoluntario { get; set; }

    [Required]
    [MaxLength(2)]
    public string Regional { get; set; } = null!;

    [MaxLength(5)]
    public string? Distrito { get; set; }

    /// <summary>
    /// Presidente | Secretario/a General | Secretario/a Capacitaciones |
    /// Secretario/a Proyectos | Secretario/a Comunicaciones | Secretariado Modelo
    /// </summary>
    [Required]
    [MaxLength(70)]
    public string Cargo { get; set; } = null!;

    [Required]
    [MaxLength(50)]
    public string Contrasena { get; set; } = null!;

    public bool EsSuperuser { get; set; } = false;
}

public class EditarOrganizadorDto
{
    [MaxLength(2)]
    public string? Regional { get; set; }

    [MaxLength(5)]
    public string? Distrito { get; set; }

    [MaxLength(70)]
    public string? Cargo { get; set; }

    [MaxLength(50)]
    public string? Contrasena { get; set; }

    public bool? EsSuperuser { get; set; }
}

public class OrganizadorResponseDto
{
    public int     Id               { get; set; }
    public string  Regional         { get; set; } = null!;
    public string? Distrito         { get; set; }
    public int     IdVoluntario     { get; set; }
    public string  NombreVoluntario { get; set; } = null!;
    public string  Cargo            { get; set; } = null!;
    public bool    EsSuperuser      { get; set; }
}
