using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class CrearParticipanteDto
{
    [Required]
    public int? IdModelo { get; set; }

    public string? NumeracionPLERD { get; set; }

    [Required]
    public string Nombres { get; set; } = null!;

    [Required]
    public string Apellidos { get; set; } = null!;
}

public class EditarParticipanteDto
{
    public int? IdModelo { get; set; }
    public string? NumeracionPLERD { get; set; }
    public string? Nombres { get; set; }
    public string? Apellidos { get; set; }
}

public class ParticipanteResponseDto
{
    public int Id { get; set; }
    public int? IdModelo { get; set; }
    public string? NumeracionPLERD { get; set; }
    public string Nombres { get; set; } = null!;
    public string Apellidos { get; set; } = null!;
}
