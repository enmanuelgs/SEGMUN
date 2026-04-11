import { useState, useEffect } from 'react';
import { getModelos, crearModelo, eliminarModelo } from '../services/api';

// Deriva la regional del prefijo del distrito (ej: "15-03" → "15")
function derivarRegional(distrito) {
  if (!distrito) return '';
  const match = distrito.trim().match(/^(\d+)-/);
  return match ? match[1] : '';
}

export default function ModeloSelector({ modeloActivo, onCambiarModelo }) {
  const [modelos, setModelos]       = useState([]);
  const [abierto, setAbierto]       = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  const [form, setForm]             = useState({ distrito: '', regional: '', anioEdicion: '' });
  const [guardando, setGuardando]   = useState(false);
  const [errorCrear, setErrorCrear] = useState('');

  async function cargar() {
    try { setModelos(await getModelos()); } catch (_) {}
  }

  useEffect(() => { cargar(); }, []);

  function handleDistritoChange(valor) {
    const regional = derivarRegional(valor);
    setForm(f => ({ ...f, distrito: valor, regional }));
  }

  function validarDuplicado(distrito, anioEdicion) {
    if (!distrito.trim() || !anioEdicion) return null;
    const d = distrito.trim().toLowerCase();
    const anio = Number(anioEdicion);
    const existe = modelos.find(
      m => (m.distrito ?? '').toLowerCase() === d && m.anioEdicion === anio
    );
    return existe
      ? `Ya existe el modelo "${existe.distrito} · ${existe.regional} · ${existe.anioEdicion}".`
      : null;
  }

  async function handleCrear(e) {
    e.preventDefault();
    const errDup = validarDuplicado(form.distrito, form.anioEdicion);
    if (errDup) { setErrorCrear(errDup); return; }

    setGuardando(true);
    setErrorCrear('');
    try {
      const nuevo = await crearModelo({
        distrito:    form.distrito.trim() || null,
        regional:    form.regional.trim() || null,
        anioEdicion: form.anioEdicion ? Number(form.anioEdicion) : null,
      });
      await cargar();
      onCambiarModelo(nuevo);
      setModalCrear(false);
      setForm({ distrito: '', regional: '', anioEdicion: '' });
    } catch (err) {
      setErrorCrear(err.message.includes('409') || err.message.toLowerCase().includes('ya existe')
        ? err.message
        : 'Error: ' + err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function handleEliminar(e, modelo) {
    e.stopPropagation();
    if (!confirm(`¿Eliminar el modelo "${etiquetaModelo(modelo)}"?\nSe eliminarán todos sus participantes, sesiones y datos asociados.`))
      return;
    try {
      await eliminarModelo(modelo.id);
      if (modeloActivo?.id === modelo.id) onCambiarModelo(null);
      await cargar();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  }

  function etiquetaModelo(m) {
    const partes = [m.distrito, m.regional, m.anioEdicion].filter(Boolean);
    return partes.length ? partes.join(' · ') : `Modelo #${m.id}`;
  }

  const errorDuplicadoLive = validarDuplicado(form.distrito, form.anioEdicion);

  return (
    <>
      <div className="position-relative">
        <button
          className="btn btn-outline-light btn-sm d-flex align-items-center gap-2"
          onClick={() => setAbierto(o => !o)}
        >
          <span>{modeloActivo ? etiquetaModelo(modeloActivo) : 'Seleccionar modelo'}</span>
          <span style={{ fontSize: '0.7rem' }}>{abierto ? '▲' : '▼'}</span>
        </button>

        {abierto && (
          <div
            className="position-absolute bg-dark border border-secondary rounded shadow mt-1"
            style={{ minWidth: 280, zIndex: 200, right: 0 }}
          >
            <div className="p-2">
              {modelos.length === 0 ? (
                <p className="text-secondary small px-2 py-1 mb-0">No hay modelos creados.</p>
              ) : (
                modelos.map(m => (
                  <div key={m.id} className="d-flex align-items-center gap-1 mb-1">
                    <button
                      className={`flex-grow-1 text-start btn btn-sm px-3 py-2 ${modeloActivo?.id === m.id ? 'btn-primary' : 'btn-dark border border-secondary'}`}
                      onClick={() => { onCambiarModelo(m); setAbierto(false); }}
                    >
                      <div className="fw-semibold">{etiquetaModelo(m)}</div>
                      <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        {m.totalParticipantes} participante{m.totalParticipantes !== 1 ? 's' : ''}
                      </div>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger px-2"
                      title="Eliminar modelo"
                      onClick={e => handleEliminar(e, m)}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="border-top border-secondary p-2">
              <button
                className="btn btn-sm btn-outline-success w-100"
                onClick={() => { setAbierto(false); setModalCrear(true); }}
              >
                + Nuevo modelo
              </button>
            </div>
          </div>
        )}
      </div>

      {modalCrear && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={() => setModalCrear(false)}
        >
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content bg-dark border-secondary text-light">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Nuevo Modelo</h5>
                <button className="btn-close btn-close-white" onClick={() => setModalCrear(false)} />
              </div>
              <div className="modal-body">
                <form onSubmit={handleCrear}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small text-uppercase fw-semibold">Distrito</label>
                    <input
                      className="form-control bg-dark text-light border-secondary"
                      value={form.distrito}
                      onChange={e => handleDistritoChange(e.target.value)}
                      placeholder="Ej: 15-03"
                    />
                    <div className="form-text text-secondary" style={{ fontSize: '0.75rem' }}>
                      Si el formato es XX-YY, la regional se derivará automáticamente.
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small text-uppercase fw-semibold">Regional</label>
                    <input
                      className="form-control bg-dark text-light border-secondary"
                      value={form.regional}
                      onChange={e => setForm(f => ({ ...f, regional: e.target.value }))}
                      placeholder="Ej: 15"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-secondary small text-uppercase fw-semibold">Año de Edición</label>
                    <input
                      type="number"
                      className="form-control bg-dark text-light border-secondary"
                      value={form.anioEdicion}
                      onChange={e => setForm(f => ({ ...f, anioEdicion: e.target.value }))}
                      placeholder="Ej: 2026"
                      min={1900} max={2100}
                    />
                  </div>

                  {/* Alerta de duplicado en tiempo real */}
                  {errorDuplicadoLive && !errorCrear && (
                    <div className="alert alert-warning py-2 small">{errorDuplicadoLive}</div>
                  )}
                  {errorCrear && <div className="alert alert-danger py-2 small">{errorCrear}</div>}

                  <div className="d-flex justify-content-end gap-2 mt-3">
                    <button type="button" className="btn btn-secondary" onClick={() => setModalCrear(false)}>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={guardando || !!errorDuplicadoLive}
                    >
                      {guardando ? 'Creando...' : 'Crear Modelo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
