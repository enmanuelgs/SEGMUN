using EvaluacionPLERD.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Context;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Modelo>       Modelos       => Set<Modelo>();
    public DbSet<Participante> Participantes => Set<Participante>();
    public DbSet<Calificacion> Calificaciones => Set<Calificacion>();
    public DbSet<Participacion> Participaciones => Set<Participacion>();
    public DbSet<Feedback>        Feedbacks        => Set<Feedback>();
    public DbSet<SesionTrabajo>   SesionesTrabajo  => Set<SesionTrabajo>();
    public DbSet<PaseLista>       PasesLista       => Set<PaseLista>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Modelo>(e =>
        {
            e.ToTable("modelos");
            e.HasKey(m => m.Id);
            e.Property(m => m.Id).HasColumnName("id");
            e.Property(m => m.Distrito).HasColumnName("distrito");
            e.Property(m => m.Regional).HasColumnName("regional");
            e.Property(m => m.AnioEdicion).HasColumnName("anioedicion");
        });

        modelBuilder.Entity<Participante>(e =>
        {
            e.ToTable("participantes");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.IdModelo).HasColumnName("idmodelo");
            e.Property(p => p.NumeracionPLERD).HasColumnName("numeracionplerd");
            e.Property(p => p.Nombres).HasColumnName("nombres").IsRequired();
            e.Property(p => p.Apellidos).HasColumnName("apellidos").IsRequired();
            e.HasOne(p => p.Modelo)
             .WithMany(m => m.Participantes)
             .HasForeignKey(p => p.IdModelo)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Calificacion>(e =>
        {
            e.ToTable("calificaciones");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.IdParticipante).HasColumnName("idparticipante");
            e.Property(c => c.InvestigacionAcademica).HasColumnName("investigacionacademica");
            e.Property(c => c.PensamientoCritico).HasColumnName("pensamientocritico");
            e.Property(c => c.Oratoria).HasColumnName("oratoria");
            e.Property(c => c.Argumentacion).HasColumnName("argumentacion");
            e.Property(c => c.Redaccion).HasColumnName("redaccion");
            e.Property(c => c.Negociacion).HasColumnName("negociacion");
            e.Property(c => c.ResolucionConflictos).HasColumnName("resolucionconflictos");
            e.Property(c => c.Liderazgo).HasColumnName("liderazgo");
            e.Property(c => c.Colaboracion).HasColumnName("colaboracion");
            e.HasOne(c => c.Participante)
             .WithOne(p => p.Calificacion)
             .HasForeignKey<Calificacion>(c => c.IdParticipante);
        });

        modelBuilder.Entity<Participacion>(e =>
        {
            e.ToTable("participaciones");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.IdParticipante).HasColumnName("idparticipante");
            e.Property(p => p.NumParticipaciones).HasColumnName("numparticipaciones").HasDefaultValue((short)0);
            e.HasOne(p => p.Participante)
             .WithOne(p => p.Participacion)
             .HasForeignKey<Participacion>(p => p.IdParticipante);
        });

        modelBuilder.Entity<Feedback>(e =>
        {
            e.ToTable("feedbacks");
            e.HasKey(f => f.Id);
            e.Property(f => f.Id).HasColumnName("id");
            e.Property(f => f.IdParticipante).HasColumnName("idparticipante");
            e.Property(f => f.Comentario).HasColumnName("comentario");
            e.HasOne(f => f.Participante)
             .WithOne(p => p.Feedback)
             .HasForeignKey<Feedback>(f => f.IdParticipante);
        });

        modelBuilder.Entity<SesionTrabajo>(e =>
        {
            e.ToTable("sesionestrabajo");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.IdModelo).HasColumnName("idmodelo");
            e.Property(s => s.NumSesionTrabajo).HasColumnName("numsesiontrabajo").IsRequired();
            e.HasOne(s => s.Modelo)
             .WithMany(m => m.SesionesTrabajo)
             .HasForeignKey(s => s.IdModelo)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PaseLista>(e =>
        {
            e.ToTable("paselista");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.IdSesionTrabajo).HasColumnName("idsesiontrabajo");
            e.Property(p => p.IdParticipante).HasColumnName("idparticipante");
            e.Property(p => p.NumSesionTrabajo).HasColumnName("numsesiontrabajo").IsRequired();
            e.Property(p => p.NumeracionPLERD).HasColumnName("numeracionplerd");
            e.Property(p => p.NombreParticipante).HasColumnName("nombreparticipante").IsRequired();
            e.Property(p => p.EstadoPresencia).HasColumnName("estadopresencia").IsRequired();
            e.HasIndex(p => new { p.IdSesionTrabajo, p.IdParticipante }).IsUnique();
            e.HasOne(p => p.SesionTrabajo)
             .WithMany(s => s.PasesLista)
             .HasForeignKey(p => p.IdSesionTrabajo)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.Participante)
             .WithMany(p => p.PasesLista)
             .HasForeignKey(p => p.IdParticipante)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
