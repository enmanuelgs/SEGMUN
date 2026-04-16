namespace EvaluacionPLERD.Application.DTOs;

public class ActualizarPaseListaDto
{
    public string EstadoPresencia { get; set; } = null!; // "Presente", "Ausente", "Tardanza"
}

public class PaseListaResponseDto
{
    public int Id { get; set; }
    public int IdSesionTrabajo { get; set; }
    public int IdParticipante { get; set; }
    public string NumSesionTrabajo { get; set; } = null!;
    public string? Numeracion { get; set; }
    public string NombreParticipante { get; set; } = null!;
    public string EstadoPresencia { get; set; } = null!;
}
