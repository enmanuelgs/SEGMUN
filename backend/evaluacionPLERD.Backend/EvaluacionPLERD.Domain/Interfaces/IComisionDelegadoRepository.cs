using EvaluacionPLERD.Domain.Entities;

namespace EvaluacionPLERD.Domain.Interfaces;

public interface IComisionDelegadoRepository
{
    Task<IEnumerable<ComisionDelegado>> GetByComisionAsync(int idComision);
    Task<ComisionDelegado?> GetByParticipanteAsync(int idParticipante);
    Task<ComisionDelegado?> GetByComisionAndParticipanteAsync(int idComision, int idParticipante);
    Task<ComisionDelegado> CreateAsync(ComisionDelegado comisionDelegado);
    Task UpdateAsync(ComisionDelegado comisionDelegado);
    Task DeleteAsync(ComisionDelegado comisionDelegado);

    /// <summary>
    /// Retorna el siguiente número de orden de ingreso para la comisión (para FIFO).
    /// </summary>
    Task<int> GetNextOrdenIngresoAsync(int idComision);

    /// <summary>
    /// Retorna los delegados que exceden el cupo ordenados por OrdenIngreso (FIFO),
    /// para reasignar cupo cuando un delegado es removido.
    /// </summary>
    Task<IEnumerable<ComisionDelegado>> GetExcedentesFifoAsync(int idComision);

    /// <summary>
    /// Verifica si el participante ya está asignado a alguna comisión del mismo modelo.
    /// </summary>
    Task<bool> ExisteEnModeloAsync(int idModelo, int idParticipante);
}
