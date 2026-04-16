using System.ComponentModel.DataAnnotations;

namespace EvaluacionPLERD.Application.DTOs;

public class EditarCalificacionDto
{
    [Range(0, 15)] public short? InvestigacionAcademica { get; set; }
    [Range(0, 15)] public short? PensamientoCritico { get; set; }
    [Range(0, 10)] public short? Oratoria { get; set; }
    [Range(0, 10)] public short? Argumentacion { get; set; }
    [Range(0, 10)] public short? Redaccion { get; set; }
    [Range(0, 10)] public short? Negociacion { get; set; }
    [Range(0, 10)] public short? ResolucionConflictos { get; set; }
    [Range(0, 10)] public short? Liderazgo { get; set; }
    [Range(0, 10)] public short? Colaboracion { get; set; }
}

public class CalificacionResponseDto
{
    public int IdParticipante { get; set; }
    public short? InvestigacionAcademica { get; set; }
    public short? PensamientoCritico { get; set; }
    public short? Oratoria { get; set; }
    public short? Argumentacion { get; set; }
    public short? Redaccion { get; set; }
    public short? Negociacion { get; set; }
    public short? ResolucionConflictos { get; set; }
    public short? Liderazgo { get; set; }
    public short? Colaboracion { get; set; }
    public int Total { get; set; }

    // Ponderadas (promedio entre Director, Adjunto 1 y Adjunto 2 que hayan evaluado)
    public decimal? PonderadaInvestigacionAcademica { get; set; }
    public decimal? PonderadaPensamientoCritico     { get; set; }
    public decimal? PonderadaOratoria               { get; set; }
    public decimal? PonderadaArgumentacion          { get; set; }
    public decimal? PonderadaRedaccion              { get; set; }
    public decimal? PonderadaNegociacion            { get; set; }
    public decimal? PonderadaResolucionConflictos   { get; set; }
    public decimal? PonderadaLiderazgo              { get; set; }
    public decimal? PonderadaColaboracion           { get; set; }
    public decimal  PonderadaTotal                  { get; set; }

    /// <summary>"Director" | "Adjunto1" | "Adjunto2" | "EyC" | null</summary>
    public string? RolEnComision { get; set; }

    /// <summary>true si puede colocar calificaciones (Director, Adj1, Adj2).</summary>
    public bool EsEvaluador { get; set; }
}
