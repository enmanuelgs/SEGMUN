namespace EvaluacionPLERD.Domain.Entities;

/// <summary>
/// Asignación de un delegado a una comisión.
/// Implementa principio FIFO: si se supera maxParticipantes, el delegado entra
/// con ExcedeCupo = true y se refleja en rojo en la UI.
/// </summary>
public class ComisionDelegado
{
    public int Id { get; set; }
    public int IdComision { get; set; }
    public int IdParticipante { get; set; }
    public int? IdCalificacion { get; set; }

    /// <summary>Orden de ingreso para aplicar principio FIFO al liberar cupo</summary>
    public int OrdenIngreso { get; set; }

    /// <summary>true = excede el cupo de la comisión; se muestra en rojo en la UI</summary>
    public bool ExcedeCupo { get; set; } = false;
    public DateTime FechaAsignacion { get; set; } = DateTime.UtcNow;

    public Comision Comision { get; set; } = null!;
    public Participante Participante { get; set; } = null!;
    public DelegadoCalificacion? Calificacion { get; set; }
}
