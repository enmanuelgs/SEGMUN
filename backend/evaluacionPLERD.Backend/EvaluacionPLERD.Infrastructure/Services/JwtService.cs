using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EvaluacionPLERD.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace EvaluacionPLERD.Infrastructure.Services;

public class JwtService(IConfiguration configuration) : IJwtService
{
    public (string token, DateTime expira) GenerarToken(int id, string nombre, string rol)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, nombre),
            new Claim(ClaimTypes.Role, rol),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };
        return Crear(claims);
    }

    public (string token, DateTime expira) GenerarTokenOrganizador(
        int id, string nombre,
        string? regional, string? distrito,
        string? cargo, bool esSuperuser)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, nombre),
            new(ClaimTypes.Role, "Organizador"),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new("EsSuperuser", esSuperuser.ToString().ToLower()),
        };
        if (!string.IsNullOrEmpty(regional))  claims.Add(new("Regional",  regional));
        if (!string.IsNullOrEmpty(distrito))  claims.Add(new("Distrito",  distrito));
        if (!string.IsNullOrEmpty(cargo))     claims.Add(new("Cargo",     cargo));

        return Crear([.. claims]);
    }

    private (string token, DateTime expira) Crear(Claim[] claims)
    {
        var secretKey = configuration["Jwt:SecretKey"]!;
        var issuer    = configuration["Jwt:Issuer"]!;
        var audience  = configuration["Jwt:Audience"]!;
        var hours     = int.Parse(configuration["Jwt:ExpirationHours"] ?? "8");

        var key    = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds  = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expira = DateTime.UtcNow.AddHours(hours);

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            expira,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expira);
    }
}
