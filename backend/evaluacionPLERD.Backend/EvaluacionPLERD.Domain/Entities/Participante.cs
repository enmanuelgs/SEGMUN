namespace EvaluacionPLERD.Domain.Entities;

public class Participante
{
    public int Id { get; set; }
    public int? IdModelo { get; set; }
    public int? IdComision { get; set; }

    public string? Numeracion { get; set; }

    /// <summary>Número de registro del delegado dentro de su comisión</summary>
    public int? NoRegistro { get; set; }

    public string Nombres { get; set; } = null!;
    public string Apellidos { get; set; } = null!;

    /// <summary>País o entidad que representa (ej. "Estados Unidos", "S.E. Francia")</summary>
    public string? Representacion { get; set; }

    public string? NumeroTelefono { get; set; }
    public string? Correo { get; set; }
    public string? Regional { get; set; }
    public string? Distrito { get; set; }

    public string? CentroEducativo { get; set; }

    /// <summary>Identificador único externo (ej. clave de acceso al modelo)</summary>
    public string? LlaveUnica { get; set; }

    public bool Eliminado { get; set; } = false;

    public Modelo? Modelo { get; set; }
    public Comision? Comision { get; set; }
    public Calificacion? Calificacion { get; set; }
    public Participacion? Participacion { get; set; }
    public Feedback? Feedback { get; set; }
    public DelegadoCalificacion? DelegadoCalificacion { get; set; }
    public ComisionDelegado? ComisionDelegado { get; set; }
    public ICollection<PaseLista> PasesLista { get; set; } = new List<PaseLista>();
}
