import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getCalificaciones, editarCalificaciones,
  getParticipaciones, sumarParticipacion, restarParticipacion,
  eliminarParticipante,
} from '../services/api';
import EditarParticipanteModal from './EditarParticipanteModal';

const CRITERIOS = [
  { key: 'investigacionAcademica', label: 'Inv. Académica',  max: 15, tooltip: 'Investigación Académica'   },
  { key: 'pensamientoCritico',     label: 'Pens. Crítico',   max: 15, tooltip: 'Pensamiento Crítico'       },
  { key: 'oratoria',               label: 'Oratoria',        max: 10, tooltip: 'Oratoria'                  },
  { key: 'argumentacion',          label: 'Argumentación',   max: 10, tooltip: 'Argumentación'             },
  { key: 'redaccion',              label: 'Redacción',       max: 10, tooltip: 'Redacción'                 },
  { key: 'negociacion',            label: 'Negociación',     max: 10, tooltip: 'Negociación'               },
  { key: 'resolucionConflictos',   label: 'Res. Conflictos', max: 10, tooltip: 'Resolución de Conflictos'  },
  { key: 'liderazgo',              label: 'Liderazgo',       max: 10, tooltip: 'Liderazgo'                 },
  { key: 'colaboracion',           label: 'Colaboración',    max: 10, tooltip: 'Colaboración'              },
];

// Key de ponderada por criterio (camelCase del DTO)
const POND_KEY = {
  investigacionAcademica: 'ponderadaInvestigacionAcademica',
  pensamientoCritico:     'ponderadaPensamientoCritico',
  oratoria:               'ponderadaOratoria',
  argumentacion:          'ponderadaArgumentacion',
  redaccion:              'ponderadaRedaccion',
  negociacion:            'ponderadaNegociacion',
  resolucionConflictos:   'ponderadaResolucionConflictos',
  liderazgo:              'ponderadaLiderazgo',
  colaboracion:           'ponderadaColaboracion',
};

const CAL_VACIA = Object.fromEntries(CRITERIOS.map(c => [c.key, '']));

function calToPayload(cal) {
  return Object.fromEntries(
    CRITERIOS.map(c => [c.key, cal[c.key] === '' ? null : Number(cal[c.key])])
  );
}

function calKey(cal) {
  return CRITERIOS.map(c => cal[c.key] ?? '').join(',');
}

// Formatea un valor ponderado para mostrar (1 decimal si no es entero)
function fmtPond(val) {
  if (val === null || val === undefined) return '—';
  const n = Number(val);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export default function FilaParticipante({ participante, onAbrirFeedback, onDatosActualizados, onEliminado }) {
  const [cal, setCal]                         = useState(CAL_VACIA);
  const [ponderada, setPonderada]             = useState({});   // ponderada por criterio + ponderadaTotal
  const [total, setTotal]                     = useState(0);
  const [rolEnComision, setRolEnComision]     = useState(null); // "Director"|"Adjunto1"|"Adjunto2"|"EyC"|null
  const [esEvaluador, setEsEvaluador]         = useState(true); // puede ingresar calificaciones
  const [participaciones, setParticipaciones] = useState(0);
  const [guardandoCal, setGuardandoCal]       = useState(false);
  const [errorCal, setErrorCal]               = useState('');
  const [errorPart, setErrorPart]             = useState('');
  const [errorEliminar, setErrorEliminar]     = useState('');
  const [ultimoGuardado, setUltimoGuardado]   = useState(null);
  const [cargando, setCargando]               = useState(true);
  const [modalEditar, setModalEditar]         = useState(false);

  const calRef       = useRef(CAL_VACIA);
  const guardadoRef  = useRef(null);
  const cargandoRef  = useRef(true);

  const cargarDatos = useCallback(async () => {
    const [calData, partData] = await Promise.allSettled([
      getCalificaciones(participante.id),
      getParticipaciones(participante.id),
    ]);
    if (calData.status === 'fulfilled' && calData.value) {
      const d = calData.value;
      const inicial = Object.fromEntries(CRITERIOS.map(c => [c.key, d[c.key] ?? '']));
      setCal(inicial);
      calRef.current = inicial;
      guardadoRef.current = calKey(inicial);
      setTotal(d.total ?? 0);
      // Ponderadas
      const pond = {};
      CRITERIOS.forEach(c => { pond[POND_KEY[c.key]] = d[POND_KEY[c.key]] ?? null; });
      pond.ponderadaTotal = d.ponderadaTotal ?? 0;
      setPonderada(pond);
      setRolEnComision(d.rolEnComision ?? null);
      setEsEvaluador(d.esEvaluador !== false); // default true para compatibilidad
    }
    if (partData.status === 'fulfilled' && partData.value) {
      setParticipaciones(partData.value.numParticipaciones ?? 0);
    }
    setCargando(false);
    cargandoRef.current = false;
  }, [participante.id]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const guardar = useCallback(async (calActual) => {
    if (cargandoRef.current) return;
    if (!esEvaluador) return;  // EyC no guarda
    if (calKey(calActual) === guardadoRef.current) return;
    setGuardandoCal(true);
    setErrorCal('');
    try {
      const resultado = await editarCalificaciones(participante.id, calToPayload(calActual));
      guardadoRef.current = calKey(calActual);
      setTotal(resultado.total ?? 0);
      // Actualizar ponderadas con la respuesta fresca
      const pond = {};
      CRITERIOS.forEach(c => { pond[POND_KEY[c.key]] = resultado[POND_KEY[c.key]] ?? null; });
      pond.ponderadaTotal = resultado.ponderadaTotal ?? 0;
      setPonderada(pond);
      setUltimoGuardado(new Date());
    } catch (err) {
      setErrorCal('Error: ' + err.message);
    } finally {
      setGuardandoCal(false);
    }
  }, [participante.id, esEvaluador]);

  // Autoguardado cada 5 segundos
  useEffect(() => {
    const intervalo = setInterval(() => { guardar(calRef.current); }, 5000);
    return () => clearInterval(intervalo);
  }, [guardar]);

  function handleCalChange(key, value, max) {
    if (!esEvaluador) return;
    const num = value === '' ? '' : Math.min(Math.max(0, Math.floor(Number(value))), max);
    if (num !== '' && isNaN(num)) return;
    const nueva = { ...calRef.current, [key]: num };
    calRef.current = nueva;
    setCal(nueva);
    setErrorCal('');
  }

  async function handleEliminar() {
    if (!confirm(
      `¿Eliminar a ${participante.nombres} ${participante.apellidos}?\n\n` +
      `El participante quedará desactivado.`
    )) return;
    setErrorEliminar('');
    try {
      await eliminarParticipante(participante.id);
      onEliminado?.();
    } catch (err) {
      setErrorEliminar('No se pudo eliminar: ' + err.message);
    }
  }

  async function handleSumar() {
    setErrorPart('');
    try {
      const data = await sumarParticipacion(participante.id);
      setParticipaciones(data.numParticipaciones);
      onDatosActualizados?.();
    } catch (err) {
      setErrorPart('Error al sumar participación');
      setTimeout(() => setErrorPart(''), 3000);
    }
  }

  async function handleRestar() {
    setErrorPart('');
    try {
      const data = await restarParticipacion(participante.id);
      setParticipaciones(data.numParticipaciones);
      onDatosActualizados?.();
    } catch (err) {
      setErrorPart('Error al restar participación');
      setTimeout(() => setErrorPart(''), 3000);
    }
  }

  function formatHora(fecha) {
    return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  const rolLabel = {
    Director:  { text: 'Director',   color: '#60a5fa' },
    Adjunto1:  { text: 'Adjunto 1',  color: '#34d399' },
    Adjunto2:  { text: 'Adjunto 2',  color: '#a78bfa' },
    EyC:       { text: 'EyC',        color: '#fbbf24' },
  }[rolEnComision] ?? null;

  return (
    <>
    <div className="card bg-dark border-secondary mb-3">
      <div className="card-body p-3">

        {/* Encabezado */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            {participante.numeracion && (
              <span className="badge bg-primary bg-opacity-25 text-primary border border-primary">
                {participante.numeracion}
              </span>
            )}
            <span className="fw-semibold text-light fs-6">
              {participante.representacion
                ? `${participante.representacion} (${participante.nombres} ${participante.apellidos})`
                : `${participante.nombres} ${participante.apellidos}`}
            </span>
            {rolLabel && (
              <span className="badge" style={{ background: rolLabel.color + '22', color: rolLabel.color, border: `1px solid ${rolLabel.color}` }}>
                {rolLabel.text}
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="d-flex align-items-center gap-1">
              <span className="text-secondary small me-1">Participaciones:</span>
              <button className="btn btn-sm btn-outline-secondary px-2 py-0" onClick={handleRestar}
                      disabled={participaciones === 0}>−</button>
              <span className="fw-bold text-light px-2">{participaciones}</span>
              <button className="btn btn-sm btn-outline-secondary px-2 py-0" onClick={handleSumar}>+</button>
              {errorPart && <span className="text-danger small ms-1">{errorPart}</span>}
            </div>

            <div className="d-flex flex-column align-items-end" style={{ gap: 1 }}>
              {esEvaluador && (
                <span className="badge bg-secondary text-light" style={{ fontSize: '0.7rem' }}>
                  Propio: {total}/100
                </span>
              )}
              <span className="badge text-light" style={{ background: '#1e3a5f', fontSize: '0.7rem' }}>
                Cal. Ponderada: {fmtPond(ponderada.ponderadaTotal)}/100
              </span>
            </div>

            <button
              className="btn btn-sm btn-purple"
              style={{ background: '#7c3aed', color: '#fff', border: 'none' }}
              onClick={() => onAbrirFeedback(participante)}
            >
              Feedback
            </button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setModalEditar(true)} title="Editar participante">
              ✏️
            </button>
            <button className="btn btn-sm btn-outline-danger" onClick={handleEliminar} title="Eliminar participante">
              🗑
            </button>
            {errorEliminar && <span className="text-danger small">{errorEliminar}</span>}
          </div>
        </div>

        {/* EyC: solo ve ponderada */}
        {rolEnComision === 'EyC' ? (
          <div className="alert alert-warning py-2 small mb-2">
            Como <strong>Evaluación y Control (EyC)</strong> puedes ver las calificaciones ponderadas pero no colocarlas.
          </div>
        ) : null}

        {/* Grid calificaciones */}
        <div className="row row-cols-3 row-cols-md-5 row-cols-lg-9 g-2 mb-3">
          {CRITERIOS.map(({ key, label, max, tooltip }) => {
            const pondVal = ponderada[POND_KEY[key]];
            return (
              <div className="col" key={key}>
                <label className="form-label text-secondary mb-1" title={tooltip}
                  style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.03em', cursor: 'help' }}>
                  {label}<br />
                  <span style={{ fontSize: '0.68rem' }}>/{max}</span>
                </label>
                <input
                  type="number"
                  className="form-control form-control-sm bg-dark text-light border-secondary text-center"
                  min={0} max={max} step={1}
                  value={cal[key]}
                  onChange={e => handleCalChange(key, e.target.value, max)}
                  placeholder="—"
                  title={`${tooltip} (0–${max})`}
                  style={{ MozAppearance: 'textfield' }}
                  disabled={cargando || !esEvaluador}
                />
                {/* Cal. Ponderada por criterio */}
                <div style={{ fontSize: '0.62rem', color: '#60a5fa', marginTop: 2, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  Cal. Pond.: {fmtPond(pondVal)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {esEvaluador && (
          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
            <span className="text-secondary small fst-italic">
              {guardandoCal
                ? 'Guardando...'
                : ultimoGuardado
                  ? `Guardado a las ${formatHora(ultimoGuardado)}`
                  : 'Los cambios se guardan automáticamente cada 5 s'}
            </span>
            <div className="d-flex align-items-center gap-2">
              {errorCal && <span className="text-danger small">{errorCal}</span>}
              <button
                className="btn btn-sm btn-primary"
                onClick={() => guardar(calRef.current)}
                disabled={guardandoCal || cargando}
              >
                {guardandoCal ? 'Guardando...' : 'Guardar ahora'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    {modalEditar && (
      <EditarParticipanteModal
        participante={participante}
        onCerrar={() => setModalEditar(false)}
        onEditado={() => { setModalEditar(false); onDatosActualizados?.(); }}
      />
    )}
    </>
  );
}
