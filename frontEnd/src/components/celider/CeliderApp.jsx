import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GestorModelos      from './GestorModelos';
import GestorVoluntarios  from './GestorVoluntarios';
import GestorComisiones   from './GestorComisiones';
import GestorParticipantes from './GestorParticipantes';

const TABS = [
  { id: 'modelos',       label: 'Modelos' },
  { id: 'voluntarios',   label: 'Voluntarios' },
  { id: 'comisiones',    label: 'Comisiones' },
  { id: 'participantes', label: 'Participantes' },
];

export default function CeliderApp() {
  const { auth, logout } = useAuth();
  const [tab, setTab]    = useState('modelos');

  return (
    <div className="min-vh-100 bg-dark text-light">
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary px-4">
        <div className="d-flex align-items-center gap-3 me-4">
          <span className="navbar-brand fw-bold fs-5 mb-0">Sistema PLERD</span>
          <span className="badge bg-primary">Celíder</span>
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

        <div className="d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="text-light small fw-semibold">{auth.nombre}</div>
            <div className="text-secondary" style={{ fontSize: '0.7rem' }}>
              {auth.cargo} — Regional {auth.regional}{auth.distrito ? ` / ${auth.distrito}` : ''}
            </div>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Salir</button>
        </div>
      </nav>

      <div className="container-lg py-4">
        {tab === 'modelos'       && <GestorModelos />}
        {tab === 'voluntarios'   && <GestorVoluntarios />}
        {tab === 'comisiones'    && <GestorComisiones />}
        {tab === 'participantes' && <GestorParticipantes />}
      </div>
    </div>
  );
}
