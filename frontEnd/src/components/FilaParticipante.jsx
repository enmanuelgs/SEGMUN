import { useState, useEffect, useCallback } from 'react';
import {
  getCalificaciones, editarCalificaciones,
  getParticipaciones, sumarParticipacion, restarParticipacion,
} from '../services/api';

const CRITERIOS = [
  { key: 'investigacionAcademica', label: 'Inv. Académica', max: 15 },
  { key: 'pensamientoCritico',     label: 'Pens. Crítico',  max: 15 },
  { key: 'oratoria',               label: 'Oratoria',       max: 10 },
  { key: 'argumentacion',          label: 'Argumentación',  max: 10 },
  { key: 'redaccion',              label: 'Redacción',      max: 10 },
  { key: 'negociacion',            label: 'Negociación',    max: 10 },
  { key: 'resolucionConflictos',   label: 'Res. Conflictos',max: 10 },
  { key: 'liderazgo',              label: 'Liderazgo',      max: 10 },
  { key: 'colaboracion',           label: 'Colaboración',   max: 10 },
];

const CAL_VACIA = Object.fromEntries(CRITERIOS.map(c => [c.key, '']));

export default function FilaParticipante({ participante, onAbrirFeedback, onDatosActualizados }) {
  const [cal, setCal]           = useState(CAL_VACIA);
  const [total, setTotal]       = useState(0);
  const [participaciones, setParticipaciones] = useState(0);
  const [guardandoCal, setGuardandoCal]       = useState(false);
  const [errorCal, setErrorCal]               = useState('');
  const [exitoCal, setExitoCal]               = useState(false);

  const cargarDatos = useCallback(async () => {
    const [calData, partData] = await Promise.allSettled([
      getCalificaciones(participante.id),
      getParticipaciones(participante.id),
    ]);
    if (calData.status === 'fulfilled' && calData.value) {
      const d = calData.value;
      setCal(Object.fromEntries(CRITERIOS.map(c => [c.key, d[c.key] ?? ''])));
      setTotal(d.total ?? 0);
    }
    if (partData.status === 'fulfilled' && partData.value) {
      setParticipaciones(partData.value.numParticipaciones ?? 0);
    }
  }, [participante.id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  function handleCalChange(key, value, max) {
    const num = value === '' ? '' : Math.min(Number(value), max);
    if (num !== '' && num < 0) return;
    setCal(prev => ({ ...prev, [key]: num }));
    setExitoCal(false);
    setErrorCal('');
  }

  async function handleGuardarCal() {
    setGuardandoCal(true);
    setErrorCal('');
    setExitoCal(false);
    try {
      const payload = Object.fromEntries(
        CRITERIOS.map(c => [c.key, cal[c.key] === '' ? null : Number(cal[c.key])])
      );
      const resultado = await editarCalificaciones(participante.id, payload);
      setTotal(resultado.total ?? 0);
      setExitoCal(true);
      onDatosActualizados?.();
    } catch (err) {
      setErrorCal('Error: ' + err.message);
    } finally {
      setGuardandoCal(false);
    }
  }

  async function handleSumar() {
    try {
      const data = await sumarParticipacion(participante.id);
      setParticipaciones(data.numParticipaciones);
      onDatosActualizados?.();
    } catch (_) {}
  }

  async function handleRestar() {
    try {
      const data = await restarParticipacion(participante.id);
      setParticipaciones(data.numParticipaciones);
      onDatosActualizados?.();
    } catch (_) {}
  }

  return (
    <div className="card bg-dark border-secondary mb-3">
      <div className="card-body p-3">

        {/* Encabezado */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            {participante.numeracionPLERD && (
              <span className="badge bg-primary bg-opacity-25 text-primary border border-primary">
                {participante.numeracionPLERD}
              </span>
            )}
            <span className="fw-semibold text-light fs-6">
              {participante.nombres} {participante.apellidos}
            </span>
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            {/* Conteo de participaciones */}
            <div className="d-flex align-items-center gap-1">
              <span className="text-secondary small me-1">Participaciones:</span>
              <button className="btn btn-sm btn-outline-secondary px-2 py-0" onClick={handleRestar}>−</button>
              <span className="fw-bold text-light px-2">{participaciones}</span>
              <button className="btn btn-sm btn-outline-secondary px-2 py-0" onClick={handleSumar}>+</button>
            </div>

            <span className="badge bg-secondary text-light">
              Total: {total}/100
            </span>

            <button
              className="btn btn-sm btn-purple"
              style={{ background: '#7c3aed', color: '#fff', border: 'none' }}
              onClick={() => onAbrirFeedback(participante)}
            >
              Feedback
            </button>
          </div>
        </div>

        {/* Grid calificaciones */}
        <div className="row row-cols-3 row-cols-md-5 row-cols-lg-9 g-2 mb-3">
          {CRITERIOS.map(({ key, label, max }) => (
            <div className="col" key={key}>
              <label className="form-label text-secondary mb-1" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {label}<br />
                <span style={{ fontSize: '0.68rem' }}>/{max}</span>
              </label>
              <input
                type="number"
                className="form-control form-control-sm bg-dark text-light border-secondary text-center"
                min={0}
                max={max}
                value={cal[key]}
                onChange={e => handleCalChange(key, e.target.value, max)}
                placeholder="—"
                style={{ MozAppearance: 'textfield' }}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="d-flex align-items-center justify-content-end gap-2 flex-wrap">
          {errorCal && <span className="text-danger small">{errorCal}</span>}
          {exitoCal && <span className="text-success small">Calificaciones guardadas.</span>}
          <button
            className="btn btn-sm btn-primary"
            onClick={handleGuardarCal}
            disabled={guardandoCal}
          >
            {guardandoCal ? 'Guardando...' : 'Guardar calificaciones'}
          </button>
        </div>
      </div>
    </div>
  );
}
