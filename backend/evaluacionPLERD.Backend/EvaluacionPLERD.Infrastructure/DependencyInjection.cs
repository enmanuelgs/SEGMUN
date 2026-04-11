using EvaluacionPLERD.Domain.Interfaces;
using EvaluacionPLERD.Infrastructure.Persistence.Context;
using EvaluacionPLERD.Infrastructure.Persistence.Repositories;
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

        services.AddScoped<IModeloRepository, ModeloRepository>();
        services.AddScoped<IParticipanteRepository, ParticipanteRepository>();
        services.AddScoped<ICalificacionRepository, CalificacionRepository>();
        services.AddScoped<IFeedbackRepository, FeedbackRepository>();
        services.AddScoped<IParticipacionRepository, ParticipacionRepository>();
        services.AddScoped<ISesionTrabajoRepository, SesionTrabajoRepository>();
        services.AddScoped<IPaseListaRepository, PaseListaRepository>();

        return services;
    }
}
