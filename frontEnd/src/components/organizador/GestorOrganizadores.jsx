import { useState, useEffect } from 'react';
import { getVoluntarios, getOrganizadores, crearOrganizador, editarOrganizador, eliminarOrganizador } from '../../services/api';
import { formatDistrito } from '../../utils/formatters';

const CARGOS = [
  '— Seleccionar cargo —',
  'PRESIDENTE - CELIDER Regional',
  'SG - CELIDER Regional',
  'S. Capacitaciones - CELIDER Regional',
  'S. Proyectos - CELIDER Regional',
  'S. Comunicaciones - CELIDER Regional',
  'PRESIDENTE - CELIDER Distrital',
  'SG - CELIDER Distrital',
  'S. Capacitaciones - CELIDER Distrital',
  'S. Proyectos - CELIDER Distrital',
  'S. Comunicaciones - CELIDER Distrital',
];

const VACIO = { idVoluntario: '', regional: '', distrito: '', cargo: '', contrasena: '', esSuperuser: false };

export default function GestorOrganizadores() {
  const [voluntarios, setVoluntarios]     = useState([]);
  const [organizadores, setOrganizadores] = useState([]);
  const [form, setForm]                   = useState(VACIO);
  const [editando, setEditando]           = useState(null);
  const [error, setError]                 = useState('');
  const [cargando, setCargando]           = useState(false);

  async function cargar() {
    try {
      const [vols, orgs] = await Promise.all([getVoluntarios(), getOrganizadores()]);
      setVoluntarios(vols);
      setOrganizadores(orgs);
    } catch { setError('Error al cargar datos.'); }
  }

  useEffect(() => { cargar(); }, []);

  function iniciarEdicion(o) {
    setEditando(o.id);
    setForm({ idVoluntario: o.idVoluntario, regional: o.regional, distrito: o.distrito ?? '',
              cargo: o.cargo, contrasena: '', esSuperuser: o.esSuperuser ?? false });
    setError('');
  }

  function cancelar() { setEditando(null); setForm(VACIO); setError(''); }

  // Auto-derivar regional del distrito
  function handleDistritoChange(value) {
    const fmt = formatDistrito(value);
    const match = fmt.match(/^(\d{2})-\d{2}$/);
    setForm(f => ({ ...f, distrito: fmt, regional: match ? match[1] : f.regional }));
  }

  async function handleGuardar(e) {
    e.preventDefault();
    if (!editando && form.cargo === '— Seleccionar cargo —') {
      setError('Selecciona un cargo.'); return;
    }
    setError('');
    setCargando(true);
    try {
      if (editando) {
        const payload = {
          regional:     form.regional,
          distrito:     form.distrito || null,
          cargo:        form.cargo !== '— Seleccionar cargo —' ? form.cargo : undefined,
          esSuperuser:  form.esSuperuser,
        };
        if (form.contrasena) payload.contrasena = form.contrasena;
        await editarOrganizador(editando, payload);
      } else {
        await crearOrganizador({
          idVoluntario: Number(form.idVoluntario),
          regional:     form.regional,
          distrito:     form.distrito || null,
          cargo:        form.cargo,
          contrasena:   form.contrasena,
          esSuperuser:  form.esSuperuser,
        });
      }
      cancelar();
      cargar();
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este organizador?')) return;
    try { await eliminarOrganizador(id); cargar(); }
    catch (err) { setError(err.message); }
  }

  return (
    <div>
      <h5 className="text-light mb-3">Organizadores</h5>

      <form onSubmit={handleGuardar} className="card bg-dark border-secondary p-3 mb-4">
        <h6 className="text-secondary mb-2">{editando ? 'Editar organizador' : 'Nuevo organizador'}</h6>
        <div className="row g-2">
          {/* Voluntario (solo al crear) */}
          {!editando && (
            <div className="col-md-4">
              <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Voluntario</label>
              <select className="form-select form-select-sm bg-dark text-light border-secondary"
                value={form.idVoluntario}
                onChange={e => setForm(f => ({ ...f, idVoluntario: e.target.value }))}
                required>
                <option value="">— Seleccionar voluntario —</option>
                {voluntarios.map(v => <option key={v.id} value={v.id}>{v.nombreCompleto}</option>)}
              </select>
            </div>
          )}

          {/* Cargo como select */}
          <div className="col-md-4">
            <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Cargo / Rol</label>
            <select className="form-select form-select-sm bg-dark text-light border-secondary"
              value={form.cargo}
              onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}
              required>
              {CARGOS.map(c => <option key={c} value={c === '— Seleccionar cargo —' ? '' : c}>{c}</option>)}
            </select>
          </div>

          {/* Regional */}
          <div className="col-md-2">
            <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Regional</label>
            <input className="form-control form-control-sm bg-dark text-light border-secondary"
              placeholder="Ej: 15"
              value={form.regional}
              onChange={e => setForm(f => ({ ...f, regional: e.target.value }))}
              required />
          </div>

          {/* Distrito (opcional para CELIDER Regional) */}
          <div className="col-md-2">
            <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Distrito</label>
            <input className="form-control form-control-sm bg-dark text-light border-secondary"
              placeholder="Ej: 15-03"
              value={form.distrito}
              onChange={e => handleDistritoChange(e.target.value)} />
          </div>

          {/* Contraseña */}
          <div className="col-md-3">
            <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Contraseña</label>
            <input type="password"
              className="form-control form-control-sm bg-dark text-light border-secondary"
              placeholder={editando ? 'Nueva (opcional)' : 'Contraseña'}
              value={form.contrasena}
              onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
              required={!editando} />
          </div>

          {/* EsSuperuser checkbox */}
          <div className="col-12">
            <div className="form-check form-check-inline">
              <input className="form-check-input" type="checkbox" id="chk-superuser"
                checked={form.esSuperuser}
                onChange={e => setForm(f => ({ ...f, esSuperuser: e.target.checked }))} />
              <label className="form-check-label text-warning small" htmlFor="chk-superuser">
                ⚠ Superuser (acceso total al sistema)
              </label>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger py-1 small mt-2 mb-0">{error}</div>}
        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary btn-sm" disabled={cargando}>
            {editando ? 'Guardar cambios' : '+ Crear Organizador'}
          </button>
          {editando && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      <div className="table-responsive">
        <table className="table table-dark table-hover table-sm">
          <thead>
            <tr><th>Nombre</th><th>Cargo</th><th>Regional</th><th>Distrito</th><th>Nivel</th><th></th></tr>
          </thead>
          <tbody>
            {organizadores.map(o => (
              <tr key={o.id}>
                <td>{o.nombreVoluntario}</td>
                <td><span className="badge bg-primary">{o.cargo}</span></td>
                <td>{o.regional}</td>
                <td>{o.distrito ?? '—'}</td>
                <td>
                  {o.esSuperuser
                    ? <span className="badge bg-danger">Superuser</span>
                    : <span className="badge bg-secondary">Admin</span>}
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-outline-primary btn-sm py-0" onClick={() => iniciarEdicion(o)}>Editar</button>
                    <button className="btn btn-outline-danger btn-sm py-0" onClick={() => handleEliminar(o.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {organizadores.length === 0 && (
              <tr><td colSpan={6} className="text-secondary text-center">No hay organizadores registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
