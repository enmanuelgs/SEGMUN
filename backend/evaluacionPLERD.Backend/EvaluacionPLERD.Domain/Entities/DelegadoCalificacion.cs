namespace EvaluacionPLERD.Domain.Entities;

/// <summary>
/// Calificación final de un delegado dentro de una comisión específica.
/// Distinta de 'calificaciones' (rúbricas por criterio asignadas por voluntarios).
/// </summary>
public class DelegadoCalificacion
{
    public int Id { get; set; }
    public int IdParticipante { get; set; }
    public int IdComision { get; set; }
    public decimal CFinal { get; set; } = 0;

    public Participante Participante { get; set; } = null!;
    public Comision Comision { get; set; } = null!;
    public ComisionDelegado? ComisionDelegado { get; set; }
}
