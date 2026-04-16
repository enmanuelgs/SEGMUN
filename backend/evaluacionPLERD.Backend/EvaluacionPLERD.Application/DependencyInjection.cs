using EvaluacionPLERD.Application.Interfaces;
using EvaluacionPLERD.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace EvaluacionPLERD.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Existentes
        services.AddScoped<IModeloService, ModeloService>();
        services.AddScoped<IParticipanteService, ParticipanteService>();
        services.AddScoped<ICalificacionService, CalificacionService>();
        services.AddScoped<IFeedbackService, FeedbackService>();
        services.AddScoped<IParticipacionService, ParticipacionService>();
        services.AddScoped<ISesionTrabajoService, SesionTrabajoService>();
        services.AddScoped<IPaseListaService, PaseListaService>();

        // Nuevos
        services.AddScoped<IComisionService, ComisionService>();
        services.AddScoped<IVoluntarioService, VoluntarioService>();
        services.AddScoped<IOrganizadorService, OrganizadorService>();
        services.AddScoped<IVoluntarioComisionService, VoluntarioComisionService>();
        services.AddScoped<IComisionDelegadoService, ComisionDelegadoService>();
        services.AddScoped<IDelegadoCalificacionService, DelegadoCalificacionService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
