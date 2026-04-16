namespace EvaluacionPLERD.Domain.Entities;

public class SesionTrabajo
{
    public int Id { get; set; }
    public int? IdModelo { get; set; }
    public int? IdComision { get; set; }
    public string NumSesionTrabajo { get; set; } = null!;

    public Modelo? Modelo { get; set; }
    public Comision? Comision { get; set; }
    public ICollection<PaseLista> PasesLista { get; set; } = new List<PaseLista>();
}
