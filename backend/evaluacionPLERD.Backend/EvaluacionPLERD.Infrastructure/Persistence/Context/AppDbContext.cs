using EvaluacionPLERD.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace EvaluacionPLERD.Infrastructure.Persistence.Context;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    // ── Tablas existentes ────────────────────────────────────────────────────
    public DbSet<Modelo>               Modelos               => Set<Modelo>();
    public DbSet<Participante>         Participantes         => Set<Participante>();
    public DbSet<Calificacion>         Calificaciones        => Set<Calificacion>();
    public DbSet<Participacion>        Participaciones       => Set<Participacion>();
    public DbSet<Feedback>             Feedbacks             => Set<Feedback>();
    public DbSet<SesionTrabajo>        SesionesTrabajo       => Set<SesionTrabajo>();
    public DbSet<PaseLista>            PasesLista            => Set<PaseLista>();

    // ── Tablas nuevas ────────────────────────────────────────────────────────
    public DbSet<Comision>             Comisiones            => Set<Comision>();
    public DbSet<Voluntario>           Voluntarios           => Set<Voluntario>();
    public DbSet<VoluntarioComision>   VoluntariosComisiones => Set<VoluntarioComision>();
    public DbSet<Organizador>          Organizadores         => Set<Organizador>();
    public DbSet<DelegadoCalificacion>  DelegadosCalificaciones  => Set<DelegadoCalificacion>();
    public DbSet<ComisionDelegado>      ComisionesDelegados      => Set<ComisionDelegado>();
    public DbSet<CalificacionEvaluador> CalificacionesEvaluadores => Set<CalificacionEvaluador>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // ── modelos ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Modelo>(e =>
        {
            e.ToTable("modelos");
            e.HasKey(m => m.Id);
            e.Property(m => m.Id).HasColumnName("id");
            e.Property(m => m.Distrito).HasColumnName("distrito");
            e.Property(m => m.Regional).HasColumnName("regional");
            e.Property(m => m.AnioEdicion).HasColumnName("anioedicion");
            e.Property(m => m.FechaCelebracion).HasColumnName("fechacelebracion");

            e.HasMany(m => m.Comisiones)
             .WithOne(c => c.Modelo)
             .HasForeignKey(c => c.IdModelo)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── comisiones ───────────────────────────────────────────────────────
        modelBuilder.Entity<Comision>(e =>
        {
            e.ToTable("comisiones");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.IdModelo).HasColumnName("idmodelo").IsRequired();
            e.Property(c => c.NombreComision).HasColumnName("nombrecomision").IsRequired().HasMaxLength(100);
            e.Property(c => c.MaxParticipantes).HasColumnName("maxparticipantes").IsRequired();
            e.Property(c => c.NosRegistros).HasColumnName("nosregistros").HasDefaultValue(0);

            e.HasIndex(c => new { c.IdModelo, c.NombreComision }).IsUnique();

            e.HasOne(c => c.MesaDirectiva)
             .WithOne(vc => vc.Comision)
             .HasForeignKey<VoluntarioComision>(vc => vc.IdComision)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(c => c.SesionesTrabajo)
             .WithOne(s => s.Comision)
             .HasForeignKey(s => s.IdComision)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(c => c.ComisionesDelegados)
             .WithOne(cd => cd.Comision)
             .HasForeignKey(cd => cd.IdComision)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── voluntarios ──────────────────────────────────────────────────────
        modelBuilder.Entity<Voluntario>(e =>
        {
            e.ToTable("voluntarios");
            e.HasKey(v => v.Id);
            e.Property(v => v.Id).HasColumnName("id");
            e.Property(v => v.NombreCompleto).HasColumnName("nombrecompleto").IsRequired().HasMaxLength(100);
            e.Property(v => v.Contrasena).HasColumnName("contrasena").IsRequired().HasMaxLength(50);
            e.Property(v => v.Sexo).HasColumnName("sexo").IsRequired().HasMaxLength(10);
            e.Property(v => v.Categoria).HasColumnName("categoria").IsRequired().HasMaxLength(50);
            e.Property(v => v.Regional).HasColumnName("regional").IsRequired().HasMaxLength(2);
            e.Property(v => v.Distrito).HasColumnName("distrito").IsRequired().HasMaxLength(5);
            e.Property(v => v.CorreoElectronico).HasColumnName("correoelectronico").IsRequired().HasMaxLength(50);
            e.Property(v => v.NumeroTelefonico).HasColumnName("numerotelefonico").IsRequired().HasMaxLength(20);

            e.HasIndex(v => v.NombreCompleto).IsUnique();
        });

        // ── voluntarios_comisiones ───────────────────────────────────────────
        modelBuilder.Entity<VoluntarioComision>(e =>
        {
            e.ToTable("voluntarios_comisiones");
            e.HasKey(vc => vc.Id);
            e.Property(vc => vc.Id).HasColumnName("id");
            e.Property(vc => vc.IdComision).HasColumnName("idcomision").IsRequired();
            e.Property(vc => vc.IdDirector).HasColumnName("iddirector");
            e.Property(vc => vc.IdAdjunto1).HasColumnName("idadjunto1");
            e.Property(vc => vc.IdAdjunto2).HasColumnName("idadjunto2");
            e.Property(vc => vc.IdEyC).HasColumnName("ideyc");

            // Los índices únicos por cargo se eliminaron: un voluntario puede participar
            // en múltiples comisiones siempre que sean en fechas distintas.
            // La validación de conflicto se hace a nivel de servicio comparando FechaCelebracion.
            e.HasIndex(vc => vc.IdDirector).HasFilter("iddirector IS NOT NULL");
            e.HasIndex(vc => vc.IdAdjunto1).HasFilter("idadjunto1 IS NOT NULL");
            e.HasIndex(vc => vc.IdAdjunto2).HasFilter("idadjunto2 IS NOT NULL");
            e.HasIndex(vc => vc.IdEyC).HasFilter("ideyc IS NOT NULL");

            e.HasOne(vc => vc.Director)
             .WithMany(v => v.ComisionesComoDirector)
             .HasForeignKey(vc => vc.IdDirector)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(vc => vc.Adjunto1)
             .WithMany(v => v.ComisionesComoAdjunto1)
             .HasForeignKey(vc => vc.IdAdjunto1)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(vc => vc.Adjunto2)
             .WithMany(v => v.ComisionesComoAdjunto2)
             .HasForeignKey(vc => vc.IdAdjunto2)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(vc => vc.EyC)
             .WithMany(v => v.ComisionesComoEyC)
             .HasForeignKey(vc => vc.IdEyC)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── organizadores ────────────────────────────────────────────────────
        modelBuilder.Entity<Organizador>(e =>
        {
            e.ToTable("organizadores");
            e.HasKey(o => o.Id);
            e.Property(o => o.Id).HasColumnName("id");
            e.Property(o => o.Regional).HasColumnName("regional").IsRequired().HasMaxLength(2);
            e.Property(o => o.Distrito).HasColumnName("distrito").HasMaxLength(5);
            e.Property(o => o.IdVoluntario).HasColumnName("idvoluntario").IsRequired();
            e.Property(o => o.Cargo).HasColumnName("cargo").IsRequired().HasMaxLength(70);
            e.Property(o => o.Contrasena).HasColumnName("contrasena").IsRequired().HasMaxLength(50);
            e.Property(o => o.EsSuperuser).HasColumnName("essuperuser").HasDefaultValue(false);

            e.HasIndex(o => o.IdVoluntario).IsUnique();

            e.HasOne(o => o.Voluntario)
             .WithOne(v => v.Organizador)
             .HasForeignKey<Organizador>(o => o.IdVoluntario)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── participantes ────────────────────────────────────────────────────
        modelBuilder.Entity<Participante>(e =>
        {
            e.ToTable("participantes");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.IdModelo).HasColumnName("idmodelo");
            e.Property(p => p.IdComision).HasColumnName("idcomision");
            e.Property(p => p.Numeracion).HasColumnName("numeracion");
            e.Property(p => p.NoRegistro).HasColumnName("noregistro");
            e.Property(p => p.Nombres).HasColumnName("nombres").IsRequired();
            e.Property(p => p.Apellidos).HasColumnName("apellidos").IsRequired();
            e.Property(p => p.Representacion).HasColumnName("representacion");
            e.Property(p => p.NumeroTelefono).HasColumnName("numerotelefono").HasMaxLength(17);
            e.Property(p => p.Correo).HasColumnName("correo").HasMaxLength(50);
            e.Property(p => p.Regional).HasColumnName("regional").HasMaxLength(2);
            e.Property(p => p.Distrito).HasColumnName("distrito").HasMaxLength(5);
            e.Property(p => p.CentroEducativo).HasColumnName("centroeducativo").HasMaxLength(100);
            e.Property(p => p.LlaveUnica).HasColumnName("llaveúnica").HasMaxLength(50);
            e.Property(p => p.Eliminado).HasColumnName("eliminado").HasDefaultValue(false);

            e.HasOne(p => p.Modelo)
             .WithMany(m => m.Participantes)
             .HasForeignKey(p => p.IdModelo)
             .OnDelete(DeleteBehavior.SetNull);

            e.HasOne(p => p.Comision)
             .WithMany(c => c.Participantes)
             .HasForeignKey(p => p.IdComision)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── calificaciones ───────────────────────────────────────────────────
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

        // ── participaciones ──────────────────────────────────────────────────
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

        // ── feedbacks ────────────────────────────────────────────────────────
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

        // ── delegados_calificaciones ─────────────────────────────────────────
        modelBuilder.Entity<DelegadoCalificacion>(e =>
        {
            e.ToTable("delegados_calificaciones");
            e.HasKey(dc => dc.Id);
            e.Property(dc => dc.Id).HasColumnName("id");
            e.Property(dc => dc.IdParticipante).HasColumnName("idparticipante").IsRequired();
            e.Property(dc => dc.IdComision).HasColumnName("idcomision").IsRequired();
            e.Property(dc => dc.CFinal).HasColumnName("cfinal").HasPrecision(5, 2).HasDefaultValue(0m);

            e.HasIndex(dc => new { dc.IdParticipante, dc.IdComision }).IsUnique();

            e.HasOne(dc => dc.Participante)
             .WithOne(p => p.DelegadoCalificacion)
             .HasForeignKey<DelegadoCalificacion>(dc => dc.IdParticipante)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(dc => dc.Comision)
             .WithMany()
             .HasForeignKey(dc => dc.IdComision)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── calificaciones_evaluadores ───────────────────────────────────────
        modelBuilder.Entity<CalificacionEvaluador>(e =>
        {
            e.ToTable("calificaciones_evaluadores");
            e.HasKey(c => c.Id);
            e.Property(c => c.Id).HasColumnName("id");
            e.Property(c => c.IdParticipante).HasColumnName("idparticipante").IsRequired();
            e.Property(c => c.IdVoluntario).HasColumnName("idvoluntario").IsRequired();
            e.Property(c => c.InvestigacionAcademica).HasColumnName("investigacionacademica");
            e.Property(c => c.PensamientoCritico).HasColumnName("pensamientocritico");
            e.Property(c => c.Oratoria).HasColumnName("oratoria");
            e.Property(c => c.Argumentacion).HasColumnName("argumentacion");
            e.Property(c => c.Redaccion).HasColumnName("redaccion");
            e.Property(c => c.Negociacion).HasColumnName("negociacion");
            e.Property(c => c.ResolucionConflictos).HasColumnName("resolucionconflictos");
            e.Property(c => c.Liderazgo).HasColumnName("liderazgo");
            e.Property(c => c.Colaboracion).HasColumnName("colaboracion");

            e.HasIndex(c => new { c.IdParticipante, c.IdVoluntario }).IsUnique();

            e.HasOne(c => c.Participante)
             .WithMany()
             .HasForeignKey(c => c.IdParticipante)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(c => c.Voluntario)
             .WithMany()
             .HasForeignKey(c => c.IdVoluntario)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── comisiones_delegados ─────────────────────────────────────────────
        modelBuilder.Entity<ComisionDelegado>(e =>
        {
            e.ToTable("comisiones_delegados");
            e.HasKey(cd => cd.Id);
            e.Property(cd => cd.Id).HasColumnName("id");
            e.Property(cd => cd.IdComision).HasColumnName("idcomision").IsRequired();
            e.Property(cd => cd.IdParticipante).HasColumnName("idparticipante").IsRequired();
            e.Property(cd => cd.IdCalificacion).HasColumnName("idcalificacion");
            e.Property(cd => cd.OrdenIngreso).HasColumnName("ordeningreso").IsRequired();
            e.Property(cd => cd.ExcedeCupo).HasColumnName("excedecupo").HasDefaultValue(false);
            e.Property(cd => cd.FechaAsignacion).HasColumnName("fechaasignacion").IsRequired();

            e.HasIndex(cd => new { cd.IdComision, cd.IdParticipante }).IsUnique();

            e.HasOne(cd => cd.Participante)
             .WithOne(p => p.ComisionDelegado)
             .HasForeignKey<ComisionDelegado>(cd => cd.IdParticipante)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(cd => cd.Calificacion)
             .WithOne(dc => dc.ComisionDelegado)
             .HasForeignKey<ComisionDelegado>(cd => cd.IdCalificacion)
             .OnDelete(DeleteBehavior.SetNull);
        });

        // ── sesionestrabajo ──────────────────────────────────────────────────
        modelBuilder.Entity<SesionTrabajo>(e =>
        {
            e.ToTable("sesionestrabajo");
            e.HasKey(s => s.Id);
            e.Property(s => s.Id).HasColumnName("id");
            e.Property(s => s.IdModelo).HasColumnName("idmodelo");
            e.Property(s => s.IdComision).HasColumnName("idcomision");
            e.Property(s => s.NumSesionTrabajo).HasColumnName("numsesiontrabajo").IsRequired();

            e.HasOne(s => s.Modelo)
             .WithMany(m => m.SesionesTrabajo)
             .HasForeignKey(s => s.IdModelo)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(s => s.PasesLista)
             .WithOne(p => p.SesionTrabajo)
             .HasForeignKey(p => p.IdSesionTrabajo)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── paselista ────────────────────────────────────────────────────────
        modelBuilder.Entity<PaseLista>(e =>
        {
            e.ToTable("paselista");
            e.HasKey(p => p.Id);
            e.Property(p => p.Id).HasColumnName("id");
            e.Property(p => p.IdSesionTrabajo).HasColumnName("idsesiontrabajo");
            e.Property(p => p.IdParticipante).HasColumnName("idparticipante");
            e.Property(p => p.NumSesionTrabajo).HasColumnName("numsesiontrabajo").IsRequired();
            e.Property(p => p.Numeracion).HasColumnName("numeracion");
            e.Property(p => p.NombreParticipante).HasColumnName("nombreparticipante").IsRequired();
            e.Property(p => p.EstadoPresencia).HasColumnName("estadopresencia").IsRequired();

            e.HasIndex(p => new { p.IdSesionTrabajo, p.IdParticipante }).IsUnique();

            e.HasOne(p => p.Participante)
             .WithMany(p => p.PasesLista)
             .HasForeignKey(p => p.IdParticipante)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
