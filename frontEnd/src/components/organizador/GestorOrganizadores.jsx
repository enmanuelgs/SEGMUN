import { useState, useEffect } from 'react';
import { getVoluntarios, getOrganizadores, crearOrganizador, editarOrganizador, eliminarOrganizador } from '../../services/api';

const VACIO = { idVoluntario: '', regional: '', distrito: '', cargo: '', contrasena: '' };

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
              cargo: o.cargo, contrasena: '' });
    setError('');
  }

  function cancelar() { setEditando(null); setForm(VACIO); setError(''); }

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      if (editando) {
        const payload = { regional: form.regional, distrito: form.distrito || null, cargo: form.cargo };
        if (form.contrasena) payload.contrasena = form.contrasena;
        await editarOrganizador(editando, payload);
      } else {
        await crearOrganizador({
          idVoluntario: Number(form.idVoluntario),
          regional: form.regional,
          distrito: form.distrito || null,
          cargo: form.cargo,
          contrasena: form.contrasena,
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

  const campo = (key, placeholder, type = 'text', requerido = true) => (
    <input type={type}
      className="form-control form-control-sm bg-dark text-light border-secondary"
      placeholder={placeholder} value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      required={requerido} />
  );

  return (
    <div>
      <h5 className="text-light mb-3">Organizadores</h5>

      <form onSubmit={handleGuardar} className="card bg-dark border-secondary p-3 mb-4">
        <h6 className="text-secondary mb-2">{editando ? 'Editar organizador' : 'Nuevo organizador'}</h6>
        <div className="row g-2">
          {!editando && (
            <div className="col-md-4">
              <select className="form-select form-select-sm bg-dark text-light border-secondary"
                value={form.idVoluntario}
                onChange={e => setForm(f => ({ ...f, idVoluntario: e.target.value }))}
                required>
                <option value="">— Seleccionar voluntario —</option>
                {voluntarios.map(v => <option key={v.id} value={v.id}>{v.nombreCompleto}</option>)}
              </select>
            </div>
          )}
          <div className="col-md-3">{campo('cargo', 'Cargo (ej: Presidente)')}</div>
          <div className="col-md-2">{campo('regional', 'Regional (ej: 15)')}</div>
          <div className="col-md-2">{campo('distrito', 'Distrito (opcional)', 'text', false)}</div>
          <div className="col-md-3">
            <input type="password"
              className="form-control form-control-sm bg-dark text-light border-secondary"
              placeholder={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              value={form.contrasena}
              onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
              required={!editando} />
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
            <tr><th>Nombre</th><th>Cargo</th><th>Regional</th><th>Distrito</th><th></th></tr>
          </thead>
          <tbody>
            {organizadores.map(o => (
              <tr key={o.id}>
                <td>{o.nombreVoluntario}</td>
                <td><span className="badge bg-primary">{o.cargo}</span></td>
                <td>{o.regional}</td>
                <td>{o.distrito ?? '—'}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-outline-primary btn-sm py-0" onClick={() => iniciarEdicion(o)}>Editar</button>
                    <button className="btn btn-outline-danger btn-sm py-0" onClick={() => handleEliminar(o.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {organizadores.length === 0 && (
              <tr><td colSpan={5} className="text-secondary text-center">No hay organizadores registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
