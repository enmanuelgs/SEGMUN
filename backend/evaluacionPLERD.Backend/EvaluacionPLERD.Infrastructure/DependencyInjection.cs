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
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

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
}
