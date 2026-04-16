namespace EvaluacionPLERD.Domain.Entities;

public class Modelo
{
    public int Id { get; set; }
    public string? Distrito { get; set; }
    public string? Regional { get; set; }
    public short? AnioEdicion { get; set; }
    public DateOnly? FechaCelebracion { get; set; }

    public ICollection<Comision> Comisiones { get; set; } = new List<Comision>();
    public ICollection<Participante> Participantes { get; set; } = new List<Participante>();
    public ICollection<SesionTrabajo> SesionesTrabajo { get; set; } = new List<SesionTrabajo>();
}
