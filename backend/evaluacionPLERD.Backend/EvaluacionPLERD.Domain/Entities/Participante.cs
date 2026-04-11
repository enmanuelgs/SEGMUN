namespace EvaluacionPLERD.Domain.Entities;

public class Participante
{
    public int Id { get; set; }
    public string? NumeracionPLERD { get; set; }
    public string Nombres { get; set; } = null!;
    public string Apellidos { get; set; } = null!;

    public int? IdModelo { get; set; }

    public Modelo? Modelo { get; set; }
    public Calificacion? Calificacion { get; set; }
    public Participacion? Participacion { get; set; }
    public Feedback? Feedback { get; set; }
    public ICollection<PaseLista> PasesLista { get; set; } = new List<PaseLista>();
}
