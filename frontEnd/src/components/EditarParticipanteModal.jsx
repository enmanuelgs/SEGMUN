import { useState } from 'react';
import { editarParticipante } from '../services/api';

export default function EditarParticipanteModal({ participante, onCerrar, onEditado }) {
  const [form, setForm] = useState({
    nombres:         participante.nombres,
    apellidos:       participante.apellidos,
    numeracion:      participante.numeracion ?? '',
    representacion:  participante.representacion ?? '',
    centroEducativo: participante.centroEducativo ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError]         = useState('');

  async function handleGuardar(e) {
    e.preventDefault();
    if (!form.nombres.trim() || !form.apellidos.trim()) {
      setError('Nombres y apellidos son obligatorios.');
      return;
    }
    setGuardando(true);
    setError('');
    try {
      await editarParticipante(participante.id, {
        nombres:         form.nombres.trim(),
        apellidos:       form.apellidos.trim(),
        numeracion:      form.numeracion.trim() || null,
        representacion:  form.representacion.trim() || null,
        centroEducativo: form.centroEducativo.trim() || null,
      });
      onEditado();
      onCerrar();
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setGuardando(false);
    }
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
            <h5 className="modal-title">Editar Participante</h5>
            <button className="btn-close btn-close-white" onClick={onCerrar} />
          </div>
          <div className="modal-body">
            <form onSubmit={handleGuardar}>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">Numeración</label>
                <input
                  className="form-control bg-dark text-light border-secondary"
                  value={form.numeracion}
                  onChange={e => setForm(f => ({ ...f, numeracion: e.target.value }))}
                  placeholder="Opcional"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">Representación</label>
                <input
                  className="form-control bg-dark text-light border-secondary"
                  value={form.representacion}
                  onChange={e => setForm(f => ({ ...f, representacion: e.target.value }))}
                  placeholder="Ej: Colombia"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">Centro Educativo</label>
                <input
                  className="form-control bg-dark text-light border-secondary"
                  value={form.centroEducativo}
                  onChange={e => setForm(f => ({ ...f, centroEducativo: e.target.value }))}
                  placeholder="Opcional"
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">Nombres</label>
                <input
                  className="form-control bg-dark text-light border-secondary"
                  value={form.nombres}
                  onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-secondary small text-uppercase fw-semibold">Apellidos</label>
                <input
                  className="form-control bg-dark text-light border-secondary"
                  value={form.apellidos}
                  onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))}
                  required
                />
              </div>
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-secondary" onClick={onCerrar}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
