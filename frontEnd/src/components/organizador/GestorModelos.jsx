import { useState, useEffect } from 'react';
import { getModelos, crearModelo, editarModelo, eliminarModelo } from '../../services/api';

function formatDistrito(val) {
  const clean = val.replace(/-/g, '');
  if (/^\d{4}$/.test(clean)) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return val;
}

function derivarRegional(distrito) {
  const m = distrito.match(/^(\d{2})-\d{2}$/);
  return m ? m[1] : '';
}

function fmtFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const VACIO = { regional: '', distrito: '', anioEdicion: '', fechaCelebracion: '' };

export default function GestorModelos() {
  const [modelos, setModelos]   = useState([]);
  const [form, setForm]         = useState(VACIO);
  const [editando, setEditando] = useState(null); // id del modelo que se edita
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    try { setModelos(await getModelos()); }
    catch { setError('Error al cargar modelos.'); }
  }

  useEffect(() => { cargar(); }, []);

  function iniciarEdicion(m) {
    setEditando(m.id);
    setForm({
      regional:         m.regional        ?? '',
      distrito:         m.distrito        ?? '',
      anioEdicion:      m.anioEdicion     ?? '',
      fechaCelebracion: m.fechaCelebracion ?? '',
    });
    setError('');
  }

  function cancelar() { setEditando(null); setForm(VACIO); setError(''); }

  function handleDistritoBlur(e) {
    const fmt = formatDistrito(e.target.value);
    const reg = derivarRegional(fmt);
    setForm(f => ({ ...f, distrito: fmt, regional: reg || f.regional }));
  }

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    const payload = {
      regional:         form.regional         || null,
      distrito:         form.distrito         || null,
      anioEdicion:      form.anioEdicion      ? Number(form.anioEdicion) : null,
      fechaCelebracion: form.fechaCelebracion || null,
    };
    try {
      if (editando) {
        await editarModelo(editando, payload);
      } else {
        await crearModelo(payload);
      }
      cancelar();
      cargar();
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este modelo y todos sus datos?')) return;
    try { await eliminarModelo(id); cargar(); }
    catch (err) { setError(err.message); }
  }

  return (
    <div>
      <h5 className="text-light mb-3">{editando ? 'Editar Modelo' : 'Modelos'}</h5>

      <form onSubmit={handleGuardar} className="row g-2 mb-4 align-items-end">
        <div className="col-md-2">
          <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Regional</label>
          <input className="form-control bg-dark text-light border-secondary" placeholder="ej: 15"
            value={form.regional} onChange={e => setForm(f => ({ ...f, regional: e.target.value }))} />
        </div>
        <div className="col-md-2">
          <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Distrito</label>
          <input className="form-control bg-dark text-light border-secondary" placeholder="ej: 15-03"
            value={form.distrito}
            onChange={e => setForm(f => ({ ...f, distrito: e.target.value }))}
            onBlur={handleDistritoBlur} />
        </div>
        <div className="col-md-1">
          <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Año</label>
          <input type="number" className="form-control bg-dark text-light border-secondary" placeholder="2026"
            value={form.anioEdicion} onChange={e => setForm(f => ({ ...f, anioEdicion: e.target.value }))} />
        </div>
        <div className="col-md-3">
          <label className="form-label text-secondary mb-1" style={{ fontSize: '0.75rem' }}>Fecha de celebración</label>
          <input type="date" className="form-control bg-dark text-light border-secondary"
            value={form.fechaCelebracion}
            onChange={e => setForm(f => ({ ...f, fechaCelebracion: e.target.value }))} />
        </div>
        <div className="col-md-2">
          <button className="btn btn-primary w-100" disabled={cargando}>
            {editando ? 'Guardar cambios' : '+ Crear Modelo'}
          </button>
        </div>
        {editando && (
          <div className="col-md-2">
            <button type="button" className="btn btn-outline-secondary w-100" onClick={cancelar}>
              Cancelar
            </button>
          </div>
        )}
      </form>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-hover table-sm">
          <thead>
            <tr><th>ID</th><th>Regional</th><th>Distrito</th><th>Año</th><th>Fecha</th><th>Participantes</th><th></th></tr>
          </thead>
          <tbody>
            {modelos.map(m => (
              <tr key={m.id} className={editando === m.id ? 'table-primary' : ''}>
                <td className="text-secondary">{m.id}</td>
                <td>{m.regional ?? '—'}</td>
                <td>{m.distrito ?? '—'}</td>
                <td>{m.anioEdicion ?? '—'}</td>
                <td>
                  {m.fechaCelebracion
                    ? <span className="badge bg-info text-dark">{fmtFecha(m.fechaCelebracion)}</span>
                    : <span className="text-secondary">—</span>}
                </td>
                <td><span className="badge bg-secondary">{m.totalParticipantes ?? 0}</span></td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-outline-primary btn-sm py-0"
                      onClick={() => iniciarEdicion(m)}>Editar</button>
                    <button className="btn btn-outline-danger btn-sm py-0"
                      onClick={() => handleEliminar(m.id)}>Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
            {modelos.length === 0 && (
              <tr><td colSpan={7} className="text-secondary text-center">No hay modelos creados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
