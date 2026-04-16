using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class CrearParticipanteDto
{
    [Required]
    public int? IdModelo { get; set; }

    public int?    IdComision     { get; set; }
    public string? Numeracion     { get; set; }
    public int?    NoRegistro     { get; set; }
    public string? Representacion { get; set; }

    [Required]
    public string Nombres { get; set; } = null!;

    [Required]
    public string Apellidos { get; set; } = null!;

    [MaxLength(17)]
    public string? NumeroTelefono { get; set; }

    [MaxLength(50)]
    public string? Correo { get; set; }

    [MaxLength(2)]
    public string? Regional { get; set; }

    [MaxLength(5)]
    public string? Distrito { get; set; }

    [MaxLength(100)]
    public string? CentroEducativo { get; set; }

    [MaxLength(50)]
    public string? LlaveUnica { get; set; }
}

public class EditarParticipanteDto
{
    public int?    IdModelo       { get; set; }
    public int?    IdComision     { get; set; }
    public string? Numeracion     { get; set; }
    public int?    NoRegistro     { get; set; }
    public string? Representacion { get; set; }
    public string? Nombres        { get; set; }
    public string? Apellidos      { get; set; }
    public string? NumeroTelefono { get; set; }
    public string? Correo         { get; set; }
    public string? Regional       { get; set; }
    public string? Distrito        { get; set; }
    public string? CentroEducativo { get; set; }
    public string? LlaveUnica      { get; set; }
}

public class ParticipanteResponseDto
{
    public int     Id              { get; set; }
    public int?    IdModelo        { get; set; }
    public int?    IdComision      { get; set; }
    public string? Numeracion      { get; set; }
    public int?    NoRegistro      { get; set; }
    public string  Nombres         { get; set; } = null!;
    public string  Apellidos       { get; set; } = null!;
    public string? Representacion  { get; set; }
    public string? NumeroTelefono  { get; set; }
    public string? Correo          { get; set; }
    public string? Regional        { get; set; }
    public string? Distrito        { get; set; }
    public string? CentroEducativo { get; set; }
    public string? LlaveUnica      { get; set; }
}
