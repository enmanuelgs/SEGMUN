import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getModelos, getComisiones, getMesaDirectiva } from '../../services/api';
import TablaParticipantes       from '../TablaParticipantes';
import SesionesTrabajoManager   from '../SesionesTrabajoManager';
import ExportarCalificaciones   from '../ExportarCalificaciones';
import ExportarFeedbacks        from '../ExportarFeedbacks';

const TABS = [
  { id: 'participantes',           label: 'Participantes' },
  { id: 'sesiones',                label: 'Sesiones de Trabajo' },
  { id: 'exportar-calificaciones', label: 'Exportar Calificaciones' },
  { id: 'exportar-feedbacks',      label: 'Exportar Feedbacks' },
];

export default function VoluntarioApp() {
  const { auth, logout } = useAuth();

  const [modelos, setModelos]         = useState([]);
  const [modeloActivo, setModActivo]  = useState(null);
  const [comisiones, setComisiones]   = useState([]);
  const [misComisiones, setMisCom]    = useState([]); // donde soy mesa directiva
  const [comisionActiva, setComAct]   = useState(null);
  const [sesionActiva, setSesAct]     = useState(null);
  const [tab, setTab]                 = useState('participantes');
  const [cargandoCom, setCargandoCom] = useState(false);

  // Cargar todos los modelos al inicio
  useEffect(() => { getModelos().then(setModelos).catch(() => {}); }, []);

  // Cuando cambia el modelo, cargar sus comisiones y filtrar las mías
  useEffect(() => {
    if (!modeloActivo) { setComisiones([]); setMisCom([]); setComAct(null); return; }
    setCargandoCom(true);
    getComisiones(modeloActivo.id)
      .then(async (coms) => {
        setComisiones(coms);
        // Filtrar comisiones donde soy parte de la mesa directiva
        const misas = await Promise.all(
          coms.map(c => getMesaDirectiva(c.id).catch(() => null))
        );
        const miId = auth.id;
        const filtradas = coms.filter((c, i) => {
          const m = misas[i];
          return m && (m.idDirector === miId || m.idAdjunto1 === miId ||
                       m.idAdjunto2 === miId || m.idEyC === miId);
        });
        setMisCom(filtradas);
        // Auto-seleccionar si solo hay una comisión asignada
        if (filtradas.length === 1) setComAct(filtradas[0]);
      })
      .catch(() => {})
      .finally(() => setCargandoCom(false));
  }, [modeloActivo, auth.id]);

  function handleCambiarModelo(e) {
    const m = modelos.find(m => m.id === Number(e.target.value)) ?? null;
    setModActivo(m);
    setComAct(null);
    setSesAct(null);
  }

  function handleCambiarComision(e) {
    const c = (misComisiones.length ? misComisiones : comisiones)
      .find(c => c.id === Number(e.target.value)) ?? null;
    setComAct(c);
    setSesAct(null);
  }

  // El modelo activo en formato compatible con los componentes existentes
  const modeloParaComponentes = comisionActiva
    ? { ...modeloActivo, idComision: comisionActiva.id }
    : modeloActivo;

  const listaComisiones = misComisiones.length ? misComisiones : comisiones;

  return (
    <div className="min-vh-100 bg-dark text-light">
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary px-4">
        <div className="d-flex align-items-center gap-3 me-4">
          <span className="navbar-brand fw-bold fs-5 mb-0">Sistema de Evaluación</span>
          <span className="badge bg-success">Voluntario</span>
        </div>

        <ul className="nav nav-tabs border-0 me-auto">
          {TABS.map(t => (
            <li className="nav-item" key={t.id}>
              <button
                className={`nav-link ${tab === t.id ? 'active text-primary border-primary border-bottom' : 'text-secondary border-0'}`}
                style={{ background: 'transparent' }}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="d-flex align-items-center gap-2">
          {/* Selector de sesión activa */}
          {sesionActiva && (
            <div className="d-flex align-items-center gap-1">
              <span className="badge bg-primary bg-opacity-25 text-primary" style={{ fontSize: '0.75rem' }}>
                Sesión: {sesionActiva.numSesionTrabajo}
              </span>
              <button className="btn btn-sm btn-outline-secondary py-0 px-1"
                style={{ fontSize: '0.7rem' }} onClick={() => setSesAct(null)} title="Quitar filtro">✕</button>
            </div>
          )}

          {/* Selector de comisión */}
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ minWidth: 160, maxWidth: 220 }}
            value={comisionActiva?.id ?? ''}
            onChange={handleCambiarComision}
            disabled={!modeloActivo || cargandoCom}
          >
            <option value="">
              {!modeloActivo ? '— Comisión —' : cargandoCom ? 'Cargando...' : listaComisiones.length === 0 ? 'Sin comisiones' : '— Comisión —'}
            </option>
            {listaComisiones.map(c => (
              <option key={c.id} value={c.id}>{c.nombreComision}</option>
            ))}
          </select>

          {/* Selector de modelo */}
          <select
            className="form-select form-select-sm bg-dark text-light border-secondary"
            style={{ minWidth: 160, maxWidth: 220 }}
            value={modeloActivo?.id ?? ''}
            onChange={handleCambiarModelo}
          >
            <option value="">— Modelo —</option>
            {modelos.map(m => {
              const fecha = m.fechaCelebracion
                ? ` ${m.fechaCelebracion.split('-').reverse().join('/')}`
                : '';
              return (
                <option key={m.id} value={m.id}>
                  R{m.regional ?? '?'} — {m.distrito ?? '?'} ({m.anioEdicion ?? '?'}){fecha}
                </option>
              );
            })}
          </select>

          <div className="text-end ms-2">
            <div className="text-light small fw-semibold">{auth.nombre}</div>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Salir</button>
        </div>
      </nav>

      {/* Aviso si no hay comisiones propias pero hay modelo */}
      {modeloActivo && misComisiones.length === 0 && comisiones.length > 0 && !cargandoCom && (
        <div className="alert alert-warning mx-4 mt-3 py-2 small mb-0">
          No estás asignado a ninguna comisión de este modelo como mesa directiva.
        </div>
      )}
      {/* Aviso si tiene varias comisiones pero no ha seleccionado */}
      {modeloActivo && misComisiones.length > 1 && !comisionActiva && !cargandoCom && (
        <div className="alert alert-info mx-4 mt-3 py-2 small mb-0">
          Tienes más de una comisión asignada en este modelo. Selecciona una comisión para ver sus participantes.
        </div>
      )}

      <div className="container-lg py-4">
        {tab === 'participantes' && (
          // Si tiene comisiones asignadas y no ha elegido una, no mostrar participantes de todos
          misComisiones.length > 0 && !comisionActiva
            ? null
            : <TablaParticipantes modeloActivo={modeloParaComponentes} sesionActiva={sesionActiva} />
        )}
        {tab === 'sesiones' && (
          <SesionesTrabajoManager
            modeloActivo={modeloParaComponentes}
            sesionActiva={sesionActiva}
            onCambiarSesion={setSesAct}
          />
        )}
        {tab === 'exportar-calificaciones' && (
          <ExportarCalificaciones modeloActivo={modeloParaComponentes} />
        )}
        {tab === 'exportar-feedbacks' && (
          <ExportarFeedbacks modeloActivo={modeloParaComponentes} />
        )}
      </div>
    </div>
  );
}
