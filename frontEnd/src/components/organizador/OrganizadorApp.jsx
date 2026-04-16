import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import GestorModelos       from './GestorModelos';
import GestorVoluntarios   from './GestorVoluntarios';
import GestorComisiones    from './GestorComisiones';
import GestorParticipantes from './GestorParticipantes';
import GestorOrganizadores from './GestorOrganizadores';

// Cargos que corresponden a CELIDER Regional (sin Distrito)
export function esCeliderRegional(cargo) {
  return cargo?.includes('CELIDER Regional');
}

// Determina si tiene acceso a todo (superuser)
export function esAdmin(auth) {
  return auth?.esSuperuser === true;
}

export default function OrganizadorApp() {
  const { auth, logout } = useAuth();
  const superuser = esAdmin(auth);

  // Tabs disponibles según nivel de acceso
  const TABS = [
    { id: 'modelos',        label: 'Modelos' },
    { id: 'voluntarios',    label: 'Voluntarios' },
    ...(superuser ? [{ id: 'organizadores', label: 'Organizadores' }] : []),
    { id: 'comisiones',     label: 'Comisiones' },
    { id: 'participantes',  label: 'Participantes' },
  ];

  const [tab, setTab] = useState(() => localStorage.getItem('oa_tab') || 'modelos');

  useEffect(() => {
    localStorage.setItem('oa_tab', tab);
  }, [tab]);

  // Si el tab actual ya no existe (por cambio de rol), ir al primero
  const tabActivo = TABS.find(t => t.id === tab) ? tab : TABS[0].id;

  const badgeColor = superuser ? 'bg-danger' : 'bg-primary';
  const badgeLabel = superuser ? 'Superuser' : 'Organizador';

  return (
    <div className="min-vh-100 bg-dark text-light">
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary px-4">
        <div className="d-flex align-items-center gap-3 me-4">
          <span className="navbar-brand fw-bold fs-5 mb-0">Sistema de Evaluación</span>
          <span className={`badge ${badgeColor}`}>{badgeLabel}</span>
        </div>

        <ul className="nav nav-tabs border-0 me-auto">
          {TABS.map(t => (
            <li className="nav-item" key={t.id}>
              <button
                className={`nav-link ${tabActivo === t.id ? 'active text-primary border-primary border-bottom' : 'text-secondary border-0'}`}
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
              {auth.cargo}
              {auth.regional ? ` — Regional ${auth.regional}` : ''}
              {auth.distrito ? ` / ${auth.distrito}` : ''}
            </div>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={logout}>Salir</button>
        </div>
      </nav>

      <div className="container-lg py-4">
        {tabActivo === 'modelos'       && <GestorModelos       superuser={superuser} />}
        {tabActivo === 'voluntarios'   && <GestorVoluntarios   superuser={superuser} />}
        {tabActivo === 'organizadores' && <GestorOrganizadores />}
        {tabActivo === 'comisiones'    && <GestorComisiones    superuser={superuser} />}
        {tabActivo === 'participantes' && <GestorParticipantes superuser={superuser} />}
      </div>
    </div>
  );
}
