using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class ActualizarDelegadoCalificacionDto
{
    [Required]
    [Range(0, 100, ErrorMessage = "La calificación final debe estar entre 0 y 100.")]
    public decimal? CFinal { get; set; }
}

public class DelegadoCalificacionResponseDto
{
    public int     Id             { get; set; }
    public int     IdParticipante { get; set; }
    public string  Nombres        { get; set; } = null!;
    public string  Apellidos      { get; set; } = null!;
    public int     IdComision     { get; set; }
    public string  NombreComision { get; set; } = null!;
    public decimal CFinal         { get; set; }
}
