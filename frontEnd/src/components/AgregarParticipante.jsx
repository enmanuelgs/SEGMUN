import { useState } from 'react';
import { crearParticipante } from '../services/api';

export default function AgregarParticipante({ modeloActivo, onCerrar, onAgregado }) {
  const [form, setForm] = useState({ numeracion: '', representacion: '', nombres: '', apellidos: '', centroEducativo: '' });
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setExito(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombres.trim() || !form.apellidos.trim()) {
      setError('Nombres y apellidos son obligatorios.');
      return;
    }
    if (!modeloActivo) {
      setError('Debes seleccionar un modelo antes de agregar participantes.');
      return;
    }
    setCargando(true);
    try {
      await crearParticipante({
        idModelo:        modeloActivo.id,
        numeracion:      form.numeracion.trim() || null,
        representacion:  form.representacion.trim() || null,
        nombres:         form.nombres.trim(),
        apellidos:       form.apellidos.trim(),
        centroEducativo: form.centroEducativo.trim() || null,
      });
      setForm({ numeracion: '', representacion: '', nombres: '', apellidos: '', centroEducativo: '' });
      setExito(true);
      onAgregado?.();
    } catch (err) {
      setError('Error al agregar participante: ' + err.message);
    } finally {
      setCargando(false);
    }
  }

  function etiquetaModelo(m) {
    const partes = [m.distrito, m.regional, m.anioEdicion].filter(Boolean);
    return partes.length ? partes.join(' · ') : `Modelo #${m.id}`;
  }

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onCerrar}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
        <div className="modal-content bg-dark border-secondary text-light">
          <div className="modal-header border-secondary">
            <div>
              <h5 className="modal-title mb-0">Agregar Participante</h5>
              {modeloActivo && (
                <span className="badge bg-primary bg-opacity-25 text-primary mt-1" style={{ fontSize: '0.75rem' }}>
                  {etiquetaModelo(modeloActivo)}
                </span>
              )}
            </div>
            <button className="btn-close btn-close-white" onClick={onCerrar} />
          </div>
          <div className="modal-body">
            {!modeloActivo && (
              <div className="alert alert-warning py-2 small">
                No hay modelo seleccionado. Selecciona uno desde la barra superior.
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">
                  Numeración
                </label>
                <input
                  name="numeracion"
                  value={form.numeracion}
                  onChange={handleChange}
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="Ej: DEL-001"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">
                  Representación
                </label>
                <input
                  name="representacion"
                  value={form.representacion}
                  onChange={handleChange}
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="Ej: Colombia"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">
                  Centro Educativo
                </label>
                <input
                  name="centroEducativo"
                  value={form.centroEducativo}
                  onChange={handleChange}
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="Ej: Colegio Nacional Lima"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">
                  Nombres <span className="text-danger">*</span>
                </label>
                <input
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="Nombres del participante"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">
                  Apellidos <span className="text-danger">*</span>
                </label>
                <input
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  className="form-control bg-dark text-light border-secondary"
                  placeholder="Apellidos del participante"
                />
              </div>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              {exito && <div className="alert alert-success py-2 small">Participante agregado. Puedes continuar añadiendo.</div>}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cerrar</button>
                <button className="btn btn-primary" type="submit" disabled={cargando || !modeloActivo}>
                  {cargando ? 'Guardando...' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
