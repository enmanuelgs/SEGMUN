import { useState, useEffect } from 'react';
import { getVoluntarios, crearVoluntario, editarVoluntario, eliminarVoluntario } from '../../services/api';
import { formatTelefono, formatDistrito } from '../../utils/formatters';

const CATEGORIAS = ['V-Nacional', 'V-Regional', 'V-Distrital'];
const SEXOS      = ['Masculino', 'Femenino', 'Otro'];

const VACIO = { nombreCompleto: '', contrasena: '', sexo: 'Masculino', categoria: 'V-Distrital',
                regional: '', distrito: '', correoElectronico: '', numeroTelefonico: '' };

export default function GestorVoluntarios({ superuser }) {
  const [voluntarios, setVoluntarios] = useState([]);
  const [form, setForm]               = useState(VACIO);
  const [editando, setEditando]       = useState(null);
  const [error, setError]             = useState('');
  const [cargando, setCargando]       = useState(false);
  const [busqueda, setBusqueda]       = useState('');

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

  const campo = (key, label, type = 'text', requerido = true, opts = {}) => (
    <>
      <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>{label}</label>
      <input
        type={type}
        className="form-control form-control-sm bg-dark text-light border-secondary"
        placeholder={label}
        value={form[key]}
        onChange={e => {
          let val = e.target.value;
          if (opts.formatTelefono) val = formatTelefono(val);
          if (opts.formatDistrito) val = formatDistrito(val);
          setForm(f => ({ ...f, [key]: val }));
        }}
        required={requerido && key !== 'contrasena' ? true : undefined}
      />
    </>
  );

  const filtrados = voluntarios.filter(v => {
    const q = busqueda.toLowerCase();
    return !q || v.nombreCompleto.toLowerCase().includes(q)
              || v.regional?.toLowerCase().includes(q)
              || v.distrito?.toLowerCase().includes(q);
  });

  return (
    <div>
      <h5 className="text-light mb-3">Voluntarios</h5>

      {/* Formulario solo para superuser */}
      {superuser && (
        <form onSubmit={handleGuardar} className="card bg-dark border-secondary p-3 mb-4">
          <h6 className="text-secondary mb-2">{editando ? 'Editar voluntario' : 'Nuevo voluntario'}</h6>
          <div className="row g-2">
            <div className="col-md-4">{campo('nombreCompleto', 'Nombre completo')}</div>
            <div className="col-md-3">
              <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Contraseña</label>
              <input type="password" className="form-control form-control-sm bg-dark text-light border-secondary"
                placeholder={editando ? 'Nueva (opcional)' : 'Contraseña'}
                value={form.contrasena}
                onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))}
                required={!editando}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Sexo</label>
              <select className="form-select form-select-sm bg-dark text-light border-secondary"
                value={form.sexo} onChange={e => setForm(f => ({ ...f, sexo: e.target.value }))}>
                {SEXOS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Categoría</label>
              <select className="form-select form-select-sm bg-dark text-light border-secondary"
                value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3">{campo('numeroTelefonico', 'Teléfono', 'text', true, { formatTelefono: true })}</div>
            <div className="col-md-3">{campo('correoElectronico', 'Correo', 'email')}</div>
            <div className="col-md-2">{campo('regional', 'Regional')}</div>
            <div className="col-md-2">{campo('distrito', 'Distrito', 'text', false, { formatDistrito: true })}</div>
          </div>
          {error && <div className="alert alert-danger py-1 small mt-2 mb-0">{error}</div>}
          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary btn-sm" disabled={cargando}>
              {editando ? 'Guardar cambios' : '+ Crear Voluntario'}
            </button>
            {editando && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelar}>Cancelar</button>}
          </div>
        </form>
      )}

      {/* Buscador */}
      <input className="form-control bg-dark text-light border-secondary mb-3"
        placeholder="Buscar por nombre, regional o distrito..."
        value={busqueda} onChange={e => setBusqueda(e.target.value)} />

      {!superuser && (
        <div className="alert alert-info py-2 small mb-3">
          Vista de solo lectura. Solo el superuser puede crear o modificar voluntarios.
        </div>
      )}

      <div className="table-responsive">
        <table className="table table-dark table-hover table-sm">
          <thead>
            <tr><th>Nombre</th><th>Categoría</th><th>Regional</th><th>Distrito</th><th>Correo</th><th>Teléfono</th>{superuser && <th></th>}</tr>
          </thead>
          <tbody>
            {filtrados.map(v => (
              <tr key={v.id}>
                <td>{v.nombreCompleto}</td>
                <td>
                  <span className={`badge ${v.categoria === 'V-Nacional' ? 'bg-warning text-dark' : v.categoria === 'V-Regional' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                    {v.categoria}
                  </span>
                </td>
                <td>{v.regional}</td>
                <td>{v.distrito}</td>
                <td className="text-secondary small">{v.correoElectronico}</td>
                <td className="text-secondary small">{v.numeroTelefonico}</td>
                {superuser && (
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-outline-primary btn-sm py-0" onClick={() => iniciarEdicion(v)}>Editar</button>
                      <button className="btn btn-outline-danger btn-sm py-0" onClick={() => handleEliminar(v.id)}>Eliminar</button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={superuser ? 7 : 6} className="text-secondary text-center">No hay voluntarios registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
