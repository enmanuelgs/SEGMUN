namespace EvaluacionPLERD.Application.Interfaces;

public interface IJwtService
{
    /// <summary>Genera un JWT con el id, nombre y rol del usuario.</summary>
    (string token, DateTime expira) GenerarToken(int id, string nombre, string rol);
}
