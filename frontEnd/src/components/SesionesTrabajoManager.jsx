import { useState, useEffect, useCallback } from 'react';
import { getSesiones, crearSesion, eliminarSesion, getPaseLista, actualizarPresencia } from '../services/api';

const ESTADOS = ['Presente', 'Tardanza', 'Ausente'];

const ESTADO_VARIANT = {
  Presente: 'success',
  Tardanza: 'warning',
  Ausente:  'secondary',
};

function PaseListaPanel({ sesion, onCerrar }) {
  const [pases, setPases]       = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(null); // idParticipante en guardado

  const cargar = useCallback(async () => {
    setCargando(true);
    try { setPases(await getPaseLista(sesion.id)); }
    finally { setCargando(false); }
  }, [sesion.id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function cambiarEstado(idParticipante, estadoPresencia) {
    setGuardando(idParticipante);
    try {
      const actualizado = await actualizarPresencia(sesion.id, idParticipante, { estadoPresencia });
      setPases(prev => prev.map(p => p.idParticipante === idParticipante ? actualizado : p));
    } finally {
      setGuardando(null);
    }
  }

  async function marcarTodos(estado) {
    for (const p of pases) {
      if (p.estadoPresencia !== estado) await cambiarEstado(p.idParticipante, estado);
    }
  }

  const presentes  = pases.filter(p => p.estadoPresencia === 'Presente').length;
  const tardanzas  = pases.filter(p => p.estadoPresencia === 'Tardanza').length;
  const ausentes   = pases.filter(p => p.estadoPresencia === 'Ausente').length;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={onCerrar}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
           onClick={e => e.stopPropagation()}>
        <div className="modal-content bg-dark border-secondary text-light">
          <div className="modal-header border-secondary">
            <div>
              <h5 className="modal-title mb-0">{sesion.numSesionTrabajo}</h5>
              <div className="d-flex gap-3 mt-1 small">
                <span className="text-success">✓ {presentes} presentes</span>
                <span className="text-warning">⏱ {tardanzas} tardanzas</span>
                <span className="text-secondary">✗ {ausentes} ausentes</span>
              </div>
            </div>
            <button className="btn-close btn-close-white" onClick={onCerrar} />
          </div>

          <div className="modal-body">
            <div className="d-flex gap-2 mb-3">
              <span className="text-secondary small me-1 align-self-center">Marcar todos:</span>
              {ESTADOS.map(e => (
                <button key={e} className={`btn btn-sm btn-outline-${ESTADO_VARIANT[e]}`}
                        onClick={() => marcarTodos(e)}>
                  {e}
                </button>
              ))}
            </div>

            {cargando ? (
              <div className="d-flex align-items-center gap-2 text-secondary">
                <div className="spinner-border spinner-border-sm" />
                <span>Cargando...</span>
              </div>
            ) : pases.length === 0 ? (
              <p className="text-secondary fst-italic">No hay participantes en esta sesión.</p>
            ) : (
              <div className="list-group list-group-flush">
                {pases.map(p => (
                  <div key={p.idParticipante}
                       className="list-group-item bg-dark border-secondary text-light d-flex justify-content-between align-items-center py-2">
                    <div>
                      {p.numeracion && (
                        <span className="badge bg-secondary me-2">{p.numeracion}</span>
                      )}
                      <span>{p.nombreParticipante}</span>
                    </div>
                    <div className="d-flex gap-1">
                      {ESTADOS.map(estado => (
                        <button
                          key={estado}
                          disabled={guardando === p.idParticipante}
                          onClick={() => cambiarEstado(p.idParticipante, estado)}
                          className={`btn btn-sm ${
                            p.estadoPresencia === estado
                              ? `btn-${ESTADO_VARIANT[estado]}`
                              : `btn-outline-${ESTADO_VARIANT[estado]}`
                          }`}
                        >
                          {guardando === p.idParticipante && p.estadoPresencia !== estado
                            ? <span className="spinner-border spinner-border-sm" />
                            : estado}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer border-secondary">
            <button className="btn btn-secondary" onClick={onCerrar}>Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SesionesTrabajoManager({ modeloActivo, sesionActiva, onCambiarSesion }) {
  const [sesiones, setSesiones]       = useState([]);
  const [cargando, setCargando]       = useState(false);
  const [creando, setCreando]         = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [error, setError]             = useState('');
  const [quorumError, setQuorumError] = useState('');
  const [sesionPaseActiva, setSesionPaseActiva] = useState(null); // la sesión cuyo pase se está viendo

  const cargar = useCallback(async () => {
    if (!modeloActivo) { setSesiones([]); return; }
    setCargando(true);
    try { setSesiones(await getSesiones({ idModelo: modeloActivo.id })); }
    finally { setCargando(false); }
  }, [modeloActivo]);

  useEffect(() => { cargar(); }, [cargar]);

  async function handleCrear(e) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setCreando(true);
    setError('');
    try {
      await crearSesion({ idModelo: modeloActivo?.id ?? null, numSesionTrabajo: nuevoNombre.trim() });
      setNuevoNombre('');
      await cargar();
    } catch (err) {
      setError('Error al crear sesión: ' + err.message);
    } finally {
      setCreando(false);
    }
  }

  function handleActivar(s, esActiva) {
    setQuorumError('');
    if (esActiva) { onCambiarSesion(null); return; }

    const asistentes = s.presentes + s.tardanzas;
    const quorum = Math.ceil((2 / 3) * s.totalParticipantes);

    if (s.totalParticipantes > 0 && asistentes < quorum) {
      setQuorumError(
        `Sin quórum en "${s.numSesionTrabajo}": ` +
        `${asistentes} asistentes, se necesitan ${quorum} (2/3 de ${s.totalParticipantes}). ` +
        `Faltan ${quorum - asistentes}.`
      );
      return;
    }

    onCambiarSesion(s);
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar esta sesión de trabajo y su pase de lista?')) return;
    try {
      await eliminarSesion(id);
      if (sesionActiva?.id === id) onCambiarSesion(null);
      await cargar();
    } catch (err) {
      setError('Error al eliminar: ' + err.message);
    }
  }

  if (!modeloActivo) {
    return (
      <div className="card bg-dark border-secondary shadow">
        <div className="card-body p-5 text-center">
          <p className="text-secondary fs-5 mb-0">
            Selecciona un modelo desde la barra superior para gestionar sesiones.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-dark border-secondary shadow">
      <div className="card-body p-4">
        <h5 className="card-title text-light mb-4">Sesiones de Trabajo</h5>

        {/* Formulario nueva sesión */}
        <form onSubmit={handleCrear} className="d-flex gap-2 mb-4">
          <input
            type="text"
            className="form-control bg-dark text-light border-secondary"
            placeholder="Ej: Primera sesión de trabajo"
            value={nuevoNombre}
            onChange={e => setNuevoNombre(e.target.value)}
            disabled={creando}
          />
          <button className="btn btn-primary text-nowrap" type="submit" disabled={creando || !nuevoNombre.trim()}>
            {creando ? <span className="spinner-border spinner-border-sm" /> : '+ Crear'}
          </button>
        </form>

        {error      && <div className="alert alert-danger  py-2 small mb-3">{error}</div>}
        {quorumError && <div className="alert alert-warning py-2 small mb-3">{quorumError}</div>}

        {cargando ? (
          <div className="d-flex align-items-center gap-2 text-secondary">
            <div className="spinner-border spinner-border-sm" />
            <span>Cargando sesiones...</span>
          </div>
        ) : sesiones.length === 0 ? (
          <p className="text-secondary fst-italic">No hay sesiones de trabajo creadas aún.</p>
        ) : (
          <div className="d-flex flex-column gap-2">
            {sesiones.map(s => {
              const esActiva = sesionActiva?.id === s.id;
              return (
                <div key={s.id}
                     className={`card border ${esActiva ? 'border-primary' : 'border-secondary'} bg-dark`}>
                  <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-light fw-semibold">{s.numSesionTrabajo}</span>
                      <div className="d-flex gap-3 mt-1 small">
                        <span className="text-success">✓ {s.presentes} presentes</span>
                        <span className="text-warning">⏱ {s.tardanzas} tardanzas</span>
                        <span className="text-secondary">✗ {s.ausentes} ausentes</span>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setSesionPaseActiva(s)}
                        title="Ver / editar pase de lista"
                      >
                        Pase de Lista
                      </button>
                      <button
                        className={`btn btn-sm ${esActiva ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handleActivar(s, esActiva)}
                        title={esActiva
                          ? 'Desactivar filtro de sesión'
                          : `Activar sesión (requiere quórum: 2/3 de ${s.totalParticipantes} participantes = ${Math.ceil(2/3 * s.totalParticipantes)})`}
                      >
                        {esActiva ? 'Activa ✓' : 'Activar'}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleEliminar(s.id)}
                        title="Eliminar sesión"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {sesionActiva && (
          <div className="alert alert-primary py-2 small mt-4 mb-0">
            Filtrando Participantes por: <strong>{sesionActiva.numSesionTrabajo}</strong>
            {' '}— solo se muestran presentes y tardanzas.
            <button className="btn btn-link btn-sm p-0 ms-2 text-primary"
                    onClick={() => onCambiarSesion(null)}>
              Quitar filtro
            </button>
          </div>
        )}
      </div>

      {sesionPaseActiva && (
        <PaseListaPanel
          sesion={sesionPaseActiva}
          onCerrar={() => { setSesionPaseActiva(null); cargar(); }}
        />
      )}
    </div>
  );
}
