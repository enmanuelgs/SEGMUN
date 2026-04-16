import { useState, useEffect } from 'react';
import { getModelos, getParticipantes, crearParticipante, editarParticipante, eliminarParticipante } from '../../services/api';

function formatDistrito(val) {
  const clean = val.replace(/-/g, '');
  if (/^\d{4}$/.test(clean)) return `${clean.slice(0, 2)}-${clean.slice(2)}`;
  return val;
}

const vacioPara = (modelo) => ({
  nombres: '', apellidos: '', numeracion: '',
  centroEducativo: '', numeroTelefono: '', correo: '',
  regional: modelo?.regional ?? '', distrito: modelo?.distrito ?? '', llaveUnica: '',
});

export default function GestorParticipantes() {
  const [modelos, setModelos]    = useState([]);
  const [idModelo, setIdModelo]  = useState('');
  const [modeloActual, setModeloActual] = useState(null);
  const [participantes, setPart] = useState([]);
  const [form, setForm]          = useState(vacioPara(null));
  const [editando, setEditando]  = useState(null);
  const [busqueda, setBusqueda]  = useState('');
  const [error, setError]        = useState('');
  const [cargando, setCargando]  = useState(false);

  useEffect(() => { getModelos().then(setModelos).catch(() => {}); }, []);

  async function cargar(id) {
    if (!id) { setPart([]); return; }
    try { setPart(await getParticipantes({ idModelo: id })); }
    catch { setError('Error al cargar participantes.'); }
  }

  function handleModeloChange(id) {
    setIdModelo(id);
    const modelo = modelos.find(m => String(m.id) === String(id)) ?? null;
    setModeloActual(modelo);
    setForm(vacioPara(modelo));
    setEditando(null);
    cargar(id);
  }

  function iniciarEdicion(p) {
    setEditando(p.id);
    setForm({ nombres: p.nombres, apellidos: p.apellidos,
              numeracion: p.numeracion ?? '', centroEducativo: p.centroEducativo ?? '',
              numeroTelefono: p.numeroTelefono ?? '', correo: p.correo ?? '',
              regional: p.regional ?? '', distrito: p.distrito ?? '', llaveUnica: p.llaveUnica ?? '' });
    setError('');
  }

  function cancelar() { setEditando(null); setForm(vacioPara(modeloActual)); setError(''); }

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      if (editando) {
        await editarParticipante(editando, form);
      } else {
        await crearParticipante({ ...form, idModelo: Number(idModelo) });
      }
      cancelar();
      cargar(idModelo);
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar este participante?')) return;
    try { await eliminarParticipante(id); cargar(idModelo); }
    catch (err) { setError(err.message); }
  }

  const campo = (key, placeholder, requerido = false, opts = {}) => (
    <input className="form-control form-control-sm bg-dark text-light border-secondary"
      placeholder={placeholder} value={form[key]}
      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      onBlur={opts.formatDistrito ? e => {
        const fmt = formatDistrito(e.target.value);
        setForm(f => ({ ...f, [key]: fmt }));
      } : undefined}
      required={requerido} />
  );

  const filtrados = participantes.filter(p => {
    const q = busqueda.toLowerCase();
    return !q || p.nombres.toLowerCase().includes(q) || p.apellidos.toLowerCase().includes(q)
      || (p.numeracion ?? '').toLowerCase().includes(q);
  });

  return (
    <div>
      <h5 className="text-light mb-3">Participantes</h5>

      <div className="mb-3">
        <select className="form-select bg-dark text-light border-secondary"
          value={idModelo} onChange={e => handleModeloChange(e.target.value)}>
          <option value="">— Seleccionar modelo —</option>
          {modelos.map(m => (
            <option key={m.id} value={m.id}>
              Regional {m.regional ?? '?'} — {m.distrito ?? '?'} ({m.anioEdicion ?? '?'})
            </option>
          ))}
        </select>
      </div>

      {idModelo && (
        <>
          <form onSubmit={handleGuardar} className="card bg-dark border-secondary p-3 mb-4">
            <h6 className="text-secondary mb-2">{editando ? 'Editar participante' : 'Nuevo participante'}</h6>
            <div className="row g-2">
              <div className="col-md-3">{campo('nombres', 'Nombres', true)}</div>
              <div className="col-md-3">{campo('apellidos', 'Apellidos', true)}</div>
              <div className="col-md-3">{campo('numeracion', 'Numeración')}</div>
              <div className="col-md-4">{campo('centroEducativo', 'Centro Educativo')}</div>
              <div className="col-md-3">{campo('numeroTelefono', 'Teléfono')}</div>
              <div className="col-md-3">{campo('correo', 'Correo')}</div>
              <div className="col-md-2">{campo('regional', 'Regional')}</div>
              <div className="col-md-2">{campo('distrito', 'Distrito', false, { formatDistrito: true })}</div>
              <div className="col-md-2">{campo('llaveUnica', 'Llave única')}</div>
            </div>
            {error && <div className="alert alert-danger py-1 small mt-2 mb-0">{error}</div>}
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary btn-sm" disabled={cargando}>
                {editando ? 'Guardar cambios' : '+ Crear Participante'}
              </button>
              {editando && <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelar}>Cancelar</button>}
            </div>
          </form>

          <input className="form-control bg-dark text-light border-secondary mb-3"
            placeholder="Buscar por nombre, apellido o numeración..."
            value={busqueda} onChange={e => setBusqueda(e.target.value)} />

          <div className="table-responsive">
            <table className="table table-dark table-hover table-sm">
              <thead>
                <tr><th>Numeración</th><th>Apellidos</th><th>Nombres</th><th>Centro Educativo</th><th>Teléfono</th><th>Correo</th><th></th></tr>
              </thead>
              <tbody>
                {filtrados.map(p => (
                  <tr key={p.id}>
                    <td className="text-secondary small">{p.numeracion ?? '—'}</td>
                    <td>{p.apellidos}</td>
                    <td>{p.nombres}</td>
                    <td>{p.centroEducativo ?? '—'}</td>
                    <td className="text-secondary small">{p.numeroTelefono ?? '—'}</td>
                    <td className="text-secondary small">{p.correo ?? '—'}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button className="btn btn-outline-primary btn-sm py-0" onClick={() => iniciarEdicion(p)}>Editar</button>
                        <button className="btn btn-outline-danger btn-sm py-0" onClick={() => handleEliminar(p.id)}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="text-secondary text-center">
                    {idModelo ? 'No hay participantes en este modelo.' : 'Selecciona un modelo.'}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
