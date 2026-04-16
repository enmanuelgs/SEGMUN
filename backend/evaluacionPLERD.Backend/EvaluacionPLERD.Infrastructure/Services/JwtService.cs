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
        var secretKey = configuration["Jwt:SecretKey"]!;
        var issuer    = configuration["Jwt:Issuer"]!;
        var audience  = configuration["Jwt:Audience"]!;
        var hours     = int.Parse(configuration["Jwt:ExpirationHours"] ?? "8");

        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expira  = DateTime.UtcNow.AddHours(hours);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, id.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, nombre),
            new Claim(ClaimTypes.Role, rol),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            expira,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expira);
    }
}
