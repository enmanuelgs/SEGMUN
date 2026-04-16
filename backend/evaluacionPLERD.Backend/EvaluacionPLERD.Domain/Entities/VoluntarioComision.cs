namespace EvaluacionPLERD.Domain.Entities;

/// <summary>
/// Mesa directiva de una comisión: cada comisión tiene exactamente un registro
/// con los voluntarios que ocupan cada cargo.
/// Un voluntario solo puede ocupar un cargo de mesa directiva a la vez (unique por columna).
/// </summary>
public class VoluntarioComision
{
    public int Id { get; set; }
    public int IdComision { get; set; }

    public int? IdDirector { get; set; }
    public int? IdAdjunto1 { get; set; }
    public int? IdAdjunto2 { get; set; }
    public int? IdEyC { get; set; }

    public Comision Comision { get; set; } = null!;
    public Voluntario? Director { get; set; }
    public Voluntario? Adjunto1 { get; set; }
    public Voluntario? Adjunto2 { get; set; }
    public Voluntario? EyC { get; set; }
}
