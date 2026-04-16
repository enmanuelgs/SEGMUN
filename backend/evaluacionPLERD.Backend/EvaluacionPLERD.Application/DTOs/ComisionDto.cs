using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class CrearComisionDto
{
    public int? IdModelo { get; set; }

    [Required]
    [MaxLength(100)]
    public string NombreComision { get; set; } = null!;

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "MaxParticipantes debe ser mayor a 0.")]
    public int? MaxParticipantes { get; set; }
}

public class EditarComisionDto
{
    [MaxLength(100)]
    public string? NombreComision { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "MaxParticipantes debe ser mayor a 0.")]
    public int? MaxParticipantes { get; set; }
}

public class ComisionResponseDto
{
    public int    Id               { get; set; }
    public int    IdModelo         { get; set; }
    public string NombreComision   { get; set; } = null!;
    public int    MaxParticipantes { get; set; }
    public int    NosRegistros     { get; set; }
}
