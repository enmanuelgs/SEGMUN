using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class CrearModeloDto
{
    public string? Distrito { get; set; }
    public string? Regional { get; set; }

    [Range(1900, 2100)]
    public short? AnioEdicion { get; set; }

    public DateOnly? FechaCelebracion { get; set; }
}

public class ModeloResponseDto
{
    public int Id { get; set; }
    public string? Distrito { get; set; }
    public string? Regional { get; set; }
    public short? AnioEdicion { get; set; }
    public DateOnly? FechaCelebracion { get; set; }
    public int TotalParticipantes { get; set; }
}
