using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class AsignarMesaDirectivaDto
{
    public int? IdComision { get; set; }

    public int? IdDirector  { get; set; }
    public int? IdAdjunto1  { get; set; }
    public int? IdAdjunto2  { get; set; }
    public int? IdEyC       { get; set; }
}

public class VoluntarioComisionResponseDto
{
    public int     Id              { get; set; }
    public int     IdComision      { get; set; }
    public string  NombreComision  { get; set; } = null!;

    public int?    IdDirector      { get; set; }
    public string? NombreDirector  { get; set; }

    public int?    IdAdjunto1      { get; set; }
    public string? NombreAdjunto1  { get; set; }

    public int?    IdAdjunto2      { get; set; }
    public string? NombreAdjunto2  { get; set; }

    public int?    IdEyC           { get; set; }
    public string? NombreEyC       { get; set; }
}
