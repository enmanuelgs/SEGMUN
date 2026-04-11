import { useState } from 'react';
import TablaParticipantes from './components/TablaParticipantes';
import ExportarCalificaciones from './components/ExportarCalificaciones';
import ExportarFeedbacks from './components/ExportarFeedbacks';
import ModeloSelector from './components/ModeloSelector';
import SesionesTrabajoManager from './components/SesionesTrabajoManager';
import 'bootstrap/dist/css/bootstrap.min.css';

const TABS = [
  { id: 'participantes',           label: 'Participantes' },
  { id: 'sesiones',                label: 'Sesiones de Trabajo' },
  { id: 'exportar-calificaciones', label: 'Exportar Calificaciones' },
  { id: 'exportar-feedbacks',      label: 'Exportar Feedbacks' },
];

export default function App() {
  const [tabActiva, setTabActiva]         = useState('participantes');
  const [modeloActivo, setModeloActivo]   = useState(null);
  const [sesionActiva, setSesionActiva]   = useState(null);

  function handleCambiarModelo(modelo) {
    setModeloActivo(modelo);
    setSesionActiva(null); // al cambiar modelo, limpiar sesión activa
  }

  return (
    <div className="min-vh-100 bg-dark text-light">
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary px-4">
        <span className="navbar-brand fw-bold fs-5 me-4 flex-shrink-0">
          Sistema de Evaluación PLERD
        </span>

        <ul className="nav nav-tabs border-0 me-auto">
          {TABS.map(tab => (
            <li className="nav-item" key={tab.id}>
              <button
                className={`nav-link ${tabActiva === tab.id ? 'active text-primary border-primary border-bottom' : 'text-secondary border-0'}`}
                style={{ background: 'transparent' }}
                onClick={() => setTabActiva(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="d-flex align-items-center gap-3">
          {sesionActiva && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary bg-opacity-25 text-primary" style={{ fontSize: '0.75rem' }}>
                Sesión: {sesionActiva.numSesionTrabajo}
              </span>
              <button
                className="btn btn-sm btn-outline-secondary py-0 px-1"
                style={{ fontSize: '0.7rem' }}
                onClick={() => setSesionActiva(null)}
                title="Quitar filtro de sesión"
              >
                ✕
              </button>
            </div>
          )}
          <ModeloSelector
            modeloActivo={modeloActivo}
            onCambiarModelo={handleCambiarModelo}
          />
        </div>
      </nav>

      <div className="container-lg py-4">
        {tabActiva === 'participantes' && (
          <TablaParticipantes modeloActivo={modeloActivo} sesionActiva={sesionActiva} />
        )}
        {tabActiva === 'sesiones' && (
          <SesionesTrabajoManager
            modeloActivo={modeloActivo}
            sesionActiva={sesionActiva}
            onCambiarSesion={setSesionActiva}
          />
        )}
        {tabActiva === 'exportar-calificaciones' && (
          <ExportarCalificaciones modeloActivo={modeloActivo} />
        )}
        {tabActiva === 'exportar-feedbacks' && (
          <ExportarFeedbacks modeloActivo={modeloActivo} />
        )}
      </div>
    </div>
  );
}
