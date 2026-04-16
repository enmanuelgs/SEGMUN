import { useState, useEffect, useRef, useCallback } from 'react';
import { getFeedback, editarFeedback } from '../services/api';

export default function FeedbackModal({ participante, onCerrar }) {
  const [comentario, setComentario] = useState('');
  const [cargando, setCargando]     = useState(true);
  const [guardando, setGuardando]   = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState(null);
  const [error, setError]           = useState('');

  const comentarioRef   = useRef('');
  const guardadoRef     = useRef('');
  const cargandoRef     = useRef(true);

  useEffect(() => {
    getFeedback(participante.id)
      .then(data => {
        const texto = data?.comentario ?? '';
        setComentario(texto);
        comentarioRef.current = texto;
        guardadoRef.current   = texto;
      })
      .catch(() => {
        comentarioRef.current = '';
        guardadoRef.current   = '';
      })
      .finally(() => {
        setCargando(false);
        cargandoRef.current = false;
      });
  }, [participante.id]);

  const guardar = useCallback(async (texto) => {
    if (cargandoRef.current) return;
    if (texto === guardadoRef.current) return;
    setGuardando(true);
    setError('');
    try {
      await editarFeedback(participante.id, { comentario: texto || null });
      guardadoRef.current = texto;
      setUltimoGuardado(new Date());
    } catch (err) {
      setError('Error al guardar: ' + err.message);
    } finally {
      setGuardando(false);
    }
  }, [participante.id]);

  // Autoguardado cada 5 segundos si hubo cambios
  useEffect(() => {
    const intervalo = setInterval(() => {
      guardar(comentarioRef.current);
    }, 5000);
    return () => clearInterval(intervalo);
  }, [guardar]);

  function handleChange(e) {
    comentarioRef.current = e.target.value;
    setComentario(e.target.value);
  }

  function formatHora(fecha) {
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onCerrar}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-content bg-dark border-secondary text-light">
          <div className="modal-header border-secondary">
            <h5 className="modal-title">
              Feedback — {participante.nombres} {participante.apellidos}
            </h5>
            <button className="btn-close btn-close-white" onClick={onCerrar} />
          </div>
          <div className="modal-body">
            {cargando ? (
              <p className="text-secondary fst-italic">Cargando...</p>
            ) : (
              <>
                <textarea
                  className="form-control bg-dark text-light border-secondary"
                  rows={6}
                  value={comentario}
                  onChange={handleChange}
                  placeholder="Escribe el feedback del participante..."
                  onKeyDown={e => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                      e.preventDefault();
                      guardar(comentarioRef.current);
                    }
                  }}
                />
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <span className="text-secondary small fst-italic">
                    {guardando
                      ? 'Guardando...'
                      : ultimoGuardado
                        ? `Guardado automáticamente a las ${formatHora(ultimoGuardado)}`
                        : 'Los cambios se guardan automáticamente cada 5 s'}
                  </span>
                </div>
                {error && <div className="alert alert-danger py-2 small mt-2">{error}</div>}
              </>
            )}
          </div>
          <div className="modal-footer border-secondary">
            <button className="btn btn-secondary" onClick={onCerrar}>Cerrar</button>
            <button
              className="btn btn-primary"
              onClick={() => guardar(comentarioRef.current)}
              disabled={guardando || cargando}
            >
              {guardando ? 'Guardando...' : 'Guardar ahora'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
