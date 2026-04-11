namespace EvaluacionPLERD.Application.DTOs;

public class CrearSesionTrabajoDto
{
    public int? IdModelo { get; set; }
    public string NumSesionTrabajo { get; set; } = null!;
}

public class SesionTrabajoResponseDto
{
    public int Id { get; set; }
    public int? IdModelo { get; set; }
    public string NumSesionTrabajo { get; set; } = null!;
    public int TotalParticipantes { get; set; }
    public int Presentes { get; set; }
    public int Tardanzas { get; set; }
    public int Ausentes { get; set; }
}
