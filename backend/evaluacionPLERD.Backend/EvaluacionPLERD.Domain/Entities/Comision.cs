namespace EvaluacionPLERD.Domain.Entities;

public class Comision
{
    public int Id { get; set; }
    public int IdModelo { get; set; }
    public string NombreComision { get; set; } = null!;
    public int MaxParticipantes { get; set; }
    public int NosRegistros { get; set; } = 0;

    public Modelo Modelo { get; set; } = null!;
    public VoluntarioComision? MesaDirectiva { get; set; }
    public ICollection<Participante> Participantes { get; set; } = new List<Participante>();
    public ICollection<ComisionDelegado> ComisionesDelegados { get; set; } = new List<ComisionDelegado>();
    public ICollection<SesionTrabajo> SesionesTrabajo { get; set; } = new List<SesionTrabajo>();
}
