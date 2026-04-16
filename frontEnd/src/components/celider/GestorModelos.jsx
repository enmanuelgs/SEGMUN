import { useState, useEffect } from 'react';
import { getModelos, crearModelo, eliminarModelo } from '../../services/api';

export default function GestorModelos() {
  const [modelos, setModelos]   = useState([]);
  const [form, setForm]         = useState({ regional: '', distrito: '', anioEdicion: '' });
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  async function cargar() {
    try { setModelos(await getModelos()); }
    catch { setError('Error al cargar modelos.'); }
  }

  useEffect(() => { cargar(); }, []);

  async function handleCrear(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await crearModelo({
        regional:    form.regional || null,
        distrito:    form.distrito || null,
        anioEdicion: form.anioEdicion ? Number(form.anioEdicion) : null,
      });
      setForm({ regional: '', distrito: '', anioEdicion: '' });
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
      <h5 className="text-light mb-3">Modelos</h5>

      <form onSubmit={handleCrear} className="row g-2 mb-4">
        <div className="col-md-3">
          <input className="form-control bg-dark text-light border-secondary" placeholder="Regional (ej: 15)"
            value={form.regional} onChange={e => setForm(f => ({ ...f, regional: e.target.value }))} />
        </div>
        <div className="col-md-3">
          <input className="form-control bg-dark text-light border-secondary" placeholder="Distrito (ej: 15-03)"
            value={form.distrito} onChange={e => setForm(f => ({ ...f, distrito: e.target.value }))} />
        </div>
        <div className="col-md-3">
          <input type="number" className="form-control bg-dark text-light border-secondary" placeholder="Año edición"
            value={form.anioEdicion} onChange={e => setForm(f => ({ ...f, anioEdicion: e.target.value }))} />
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary w-100" disabled={cargando}>+ Crear Modelo</button>
        </div>
      </form>

      {error && <div className="alert alert-danger py-2 small">{error}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-hover table-sm">
          <thead><tr><th>ID</th><th>Regional</th><th>Distrito</th><th>Año</th><th>Participantes</th><th></th></tr></thead>
          <tbody>
            {modelos.map(m => (
              <tr key={m.id}>
                <td className="text-secondary">{m.id}</td>
                <td>{m.regional ?? '—'}</td>
                <td>{m.distrito ?? '—'}</td>
                <td>{m.anioEdicion ?? '—'}</td>
                <td><span className="badge bg-secondary">{m.totalParticipantes ?? 0}</span></td>
                <td>
                  <button className="btn btn-outline-danger btn-sm py-0"
                    onClick={() => handleEliminar(m.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
            {modelos.length === 0 && (
              <tr><td colSpan={6} className="text-secondary text-center">No hay modelos creados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
