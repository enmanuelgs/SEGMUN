using EvaluacionPLERD.Application.DTOs;

namespace EvaluacionPLERD.Application.Interfaces;

public interface IVoluntarioComisionService
{
    Task<VoluntarioComisionResponseDto?> GetByComisionAsync(int idComision);
    Task<VoluntarioComisionResponseDto> AsignarOActualizarAsync(AsignarMesaDirectivaDto dto);
}
