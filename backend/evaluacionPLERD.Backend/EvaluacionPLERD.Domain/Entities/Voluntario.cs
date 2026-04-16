namespace EvaluacionPLERD.Domain.Entities;

public class Voluntario
{
    public int Id { get; set; }
    public string NombreCompleto { get; set; } = null!;
    public string Contrasena { get; set; } = null!;
    public string Sexo { get; set; } = null!;

    /// <summary>V-Nacional, V-Regional, V-Distrital</summary>
    public string Categoria { get; set; } = null!;
    public string Regional { get; set; } = null!;
    public string Distrito { get; set; } = null!;
    public string CorreoElectronico { get; set; } = null!;
    public string NumeroTelefonico { get; set; } = null!;

    public Organizador? Organizador { get; set; }
    public ICollection<VoluntarioComision> ComisionesComoDirector { get; set; } = new List<VoluntarioComision>();
    public ICollection<VoluntarioComision> ComisionesComoAdjunto1 { get; set; } = new List<VoluntarioComision>();
    public ICollection<VoluntarioComision> ComisionesComoAdjunto2 { get; set; } = new List<VoluntarioComision>();
    public ICollection<VoluntarioComision> ComisionesComoEyC { get; set; } = new List<VoluntarioComision>();
}
