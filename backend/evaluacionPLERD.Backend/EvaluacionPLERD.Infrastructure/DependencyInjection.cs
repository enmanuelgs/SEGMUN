using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using EvaluacionPLERD.Infrastructure.Persistence.Repositories;
using EvaluacionPLERD.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace EvaluacionPLERD.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = BuildConnectionString(configuration);
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Repositorios existentes
        services.AddScoped<IModeloRepository, ModeloRepository>();
        services.AddScoped<IParticipanteRepository, ParticipanteRepository>();
        services.AddScoped<ICalificacionRepository, CalificacionRepository>();
        services.AddScoped<ICalificacionEvaluadorRepository, CalificacionEvaluadorRepository>();
        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IParticipacionRepository, ParticipacionRepository>();
        services.AddScoped<ISesionTrabajoRepository, SesionTrabajoRepository>();
        services.AddScoped<IPaseListaRepository, PaseListaRepository>();

        // Repositorios nuevos
        services.AddScoped<IComisionRepository, ComisionRepository>();
        services.AddScoped<IVoluntarioRepository, VoluntarioRepository>();
        services.AddScoped<IOrganizadorRepository, OrganizadorRepository>();
        services.AddScoped<IVoluntarioComisionRepository, VoluntarioComisionRepository>();
        services.AddScoped<IComisionDelegadoRepository, ComisionDelegadoRepository>();
        services.AddScoped<IDelegadoCalificacionRepository, DelegadoCalificacionRepository>();
        services.AddScoped<IJwtService, JwtService>();

        return services;
    }

    private static string BuildConnectionString(IConfiguration configuration)
    {
        var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
        if (!string.IsNullOrEmpty(databaseUrl))
        {
            // Railway provee DATABASE_URL en formato: postgresql://user:pass@host:port/db
            var uri = new Uri(databaseUrl);
            var userInfo = uri.UserInfo.Split(':');
            return $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
        }
        return configuration.GetConnectionString("DefaultConnection")!;
    }
}
