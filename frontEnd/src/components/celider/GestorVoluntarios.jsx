import { useState, useEffect } from 'react';
import { getVoluntarios, crearVoluntario, editarVoluntario, eliminarVoluntario } from '../../services/api';

const CATEGORIAS = ['V-Nacional', 'V-Regional', 'V-Distrital'];
const SEXOS      = ['Masculino', 'Femenino', 'Otro'];

const VACIO = { nombreCompleto: '', contrasena: '', sexo: 'Masculino', categoria: 'V-Distrital',
                regional: '', distrito: '', correoElectronico: '', numeroTelefonico: '' };

export default function GestorVoluntarios() {
  const [voluntarios, setVoluntarios] = useState([]);
  const [form, setForm]               = useState(VACIO);
  const [editando, setEditando]       = useState(null); // id | null
  const [error, setError]             = useState('');
  const [cargando, setCargando]       = useState(false);

  async function cargar() {
    try { setVoluntarios(await getVoluntarios()); }
    catch { setError('Error al cargar voluntarios.'); }
  }

  useEffect(() => { cargar(); }, []);

  function iniciarEdicion(v) {
    setEditando(v.id);
    setForm({ nombreCompleto: v.nombreCompleto, contrasena: '', sexo: v.sexo,
              categoria: v.categoria, regional: v.regional, distrito: v.distrito,
              correoElectronico: v.correoElectronico, numeroTelefonico: v.numeroTelefonico });
    setError('');
  }

  function cancelar() { setEditando(null); setForm(VACIO); setError(''); }

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      if (editando) {
        const payload = { ...form };
        if (!payload.contrasena) delete payload.contrasena;
        await editarVoluntario(editando, payload);
      } else {
        await crearVoluntario(form);
      }
      cancelar();
      cargar();
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este voluntario?')) return;
    try { await eliminarVoluntario(id); cargar(); }
    catch (err) { setError(err.message); }
  }

  const campo = (key, placeholder, type = 'text', requerido = true) => (
    <input
      type={type}
      className="form-control form-control-sm bg-dark text-light border-secondary"
      placeholder={placeholder}
      value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      required={requerido && key !== 'contrasena' ? true : undefined}
    />
  );

  return (
    <div>
      <h5 className="text-light mb-3">{editando ? 'Editar Voluntario' : 'Nuevo Voluntario'}</h5>

      <form onSubmit={handleGuardar} className="card bg-dark border-secondary p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-4">{campo('nombreCompleto', 'Nombre completo')}</div>
          <div className="col-md-3">
            <input type="password" className="form-control form-control-sm bg-dark text-light border-secondary"
              placeholder={editando ? 'Nueva contraseña (opcional)' : 'Contraseña'}
              value={form.contrasena}
              onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
              required={!editando}
            />
          </div>
          <div className="col-md-2">
            <select className="form-select form-select-sm bg-dark text-light border-secondary"
              value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}>
              {SEXOS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select form-select-sm bg-dark text-light border-secondary"
              value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
              {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-2">{campo('regional', 'Regional (ej: 15)')}</div>
          <div className="col-md-2">{campo('distrito', 'Distrito (ej: 15-03)')}</div>
          <div className="col-md-4">{campo('correoElectronico', 'Correo electrónico', 'email')}</div>
          <div className="col-md-4">{campo('numeroTelefonico', 'Teléfono')}</div>
        </div>

        {error && <div className="alert alert-danger py-1 small mt-2 mb-0">{error}</div>}

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary btn-sm" disabled={cargando}>
            {editando ? 'Guardar cambios' : '+ Crear Voluntario'}
          </button>
          {editando && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelar}>Cancelar</button>}
        </div>
      </form>

      <h5 className="text-light mb-3">Voluntarios registrados</h5>
      <div className="table-responsive">
        <table className="table table-dark table-hover table-sm">
          <thead>
            <tr><th>Nombre</th><th>Categoría</th><th>Regional</th><th>Distrito</th><th>Correo</th><th>Teléfono</th><th></th></tr>
          </thead>
          <tbody>
            {voluntarios.map(v => (
              <tr key={v.id}>
                <td>{v.nombreCompleto}</td>
                <td><span className={`badge ${v.categoria === 'V-Nacional' ? 'bg-warning text-dark' : v.categoria === 'V-Regional' ? 'bg-info text-dark' : 'bg-secondary'}`}>{v.categoria}</span></td>
                <td>{v.regional}</td>
                <td>{v.distrito}</td>
                <td className="text-secondary small">{v.correoElectronico}</td>
                <td className="text-secondary small">{v.numeroTelefonico}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-outline-primary btn-sm py-0" onClick={() => iniciarEdicion(v)}>Editar</button>
                    <button className="btn btn-outline-danger btn-sm py-0" onClick={() => handleEliminar(v.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {voluntarios.length === 0 && (
              <tr><td colSpan={7} className="text-secondary text-center">No hay voluntarios registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
