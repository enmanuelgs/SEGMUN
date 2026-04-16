namespace EvaluacionPLERD.Domain.Entities;

public class Organizador
{
    public int Id { get; set; }
    public string Regional { get; set; } = null!;

    /// <summary>Null si es Organizador Regional (no distrital)</summary>
    public string? Distrito { get; set; }

    public int IdVoluntario { get; set; }

    /// <summary>
    /// Presidente | Secretario/a General | Secretario/a Capacitaciones |
    /// Secretario/a Proyectos | Secretario/a Comunicaciones | Secretariado Modelo
    /// </summary>
    public string Cargo { get; set; } = null!;
    public string Contrasena { get; set; } = null!;

    /// <summary>Si es true, tiene acceso total al sistema (superuser).</summary>
    public bool EsSuperuser { get; set; }

    public Voluntario Voluntario { get; set; } = null!;
}
