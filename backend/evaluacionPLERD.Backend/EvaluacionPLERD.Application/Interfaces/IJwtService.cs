namespace EvaluacionPLERD.Application.Interfaces;

public interface IJwtService
{
    /// <summary>Genera un JWT con el id, nombre y rol del usuario.</summary>
    (string token, DateTime expira) GenerarToken(int id, string nombre, string rol);

    /// <summary>Genera un JWT para organizador con claims adicionales.</summary>
    (string token, DateTime expira) GenerarTokenOrganizador(
        int id, string nombre,
        string? regional, string? distrito,
        string? cargo, bool esSuperuser);
}
