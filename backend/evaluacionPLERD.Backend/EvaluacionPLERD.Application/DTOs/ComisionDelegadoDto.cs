using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class AsignarDelegadoDto
{
    public int? IdComision    { get; set; }

    [Required]
    public int? IdParticipante { get; set; }

    public string? Representacion { get; set; }
}

public class ComisionDelegadoResponseDto
{
    public int      Id               { get; set; }
    public int      IdComision       { get; set; }
    public string   NombreComision   { get; set; } = null!;
    public int      IdParticipante   { get; set; }
    public string   Nombres          { get; set; } = null!;
    public string   Apellidos        { get; set; } = null!;
    public string?  Representacion   { get; set; }
    public int      OrdenIngreso     { get; set; }
    public bool     ExcedeCupo       { get; set; }
    public DateTime FechaAsignacion  { get; set; }
}
