using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace EvaluacionPLERD.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IModeloService, ModeloService>();
        services.AddScoped<IParticipanteService, ParticipanteService>();
        services.AddScoped<ICalificacionService, CalificacionService>();
        services.AddScoped<IFeedbackService, FeedbackService>();
        services.AddScoped<IParticipacionService, ParticipacionService>();
        services.AddScoped<ISesionTrabajoService, SesionTrabajoService>();
        services.AddScoped<IPaseListaService, PaseListaService>();
        return services;
    }
}
