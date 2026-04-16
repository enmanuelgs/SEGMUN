import { useState, useEffect, useCallback } from 'react';
import { getParticipantes, getCalificaciones, getParticipaciones, getPaseLista } from '../services/api';
import FilaParticipante from './FilaParticipante';
import FeedbackModal from './FeedbackModal';
import AgregarParticipante from './AgregarParticipante';
import PanelDerecho from './PanelDerecho';

const ORDEN_OPCIONES = [
  { value: 'ninguno',              label: 'Sin ordenar' },
  { value: 'calificacion-desc',    label: 'Mayor calificación primero' },
  { value: 'calificacion-asc',     label: 'Menor calificación primero' },
  { value: 'participaciones-desc', label: 'Más participaciones primero' },
  { value: 'participaciones-asc',  label: 'Menos participaciones primero' },
];

export default function TablaParticipantes({ modeloActivo, sesionActiva }) {
  const [participantes, setParticipantes] = useState([]);
  const [extras, setExtras]               = useState({});
  const [cargando, setCargando]           = useState(false);
  const [orden, setOrden]                 = useState('ninguno');
  const [busqueda, setBusqueda]           = useState('');
  const [modalFeedback, setModalFeedback] = useState(null);
  const [modalAgregar, setModalAgregar]   = useState(false);
  const [version, setVersion]             = useState(0);
  const [idsPresentes, setIdsPresentes]   = useState(null); // null = sin filtro

  const cargarParticipantes = useCallback(async () => {
    if (!modeloActivo) { setParticipantes([]); setExtras({}); return; }
    setCargando(true);
    try {
      const filtros = { idModelo: modeloActivo.id };
      if (modeloActivo.idComision) filtros.idComision = modeloActivo.idComision;
      const lista = await getParticipantes(filtros);
      setParticipantes(lista);
      const extrasData = await Promise.all(
        lista.map(async p => {
          const [calRes, partRes] = await Promise.allSettled([
            getCalificaciones(p.id),
            getParticipaciones(p.id),
          ]);
          return {
            id: p.id,
            total:           calRes.status  === 'fulfilled' ? (calRes.value?.total ?? 0) : 0,
            participaciones: partRes.status === 'fulfilled' ? (partRes.value?.numParticipaciones ?? 0) : 0,
          };
        })
      );
      setExtras(Object.fromEntries(extrasData.map(e => [e.id, e])));
    } finally {
      setCargando(false);
    }
  }, [modeloActivo, version]);

  useEffect(() => { cargarParticipantes(); }, [cargarParticipantes]);

  // Cargar pase de lista cuando cambia la sesión activa
  useEffect(() => {
    if (!sesionActiva) { setIdsPresentes(null); return; }
    getPaseLista(sesionActiva.id)
      .then(pases => {
        const presentes = new Set(
          pases
            .filter(p => p.estadoPresencia === 'Presente' || p.estadoPresencia === 'Tardanza')
            .map(p => p.idParticipante)
        );
        setIdsPresentes(presentes);
      })
      .catch(() => setIdsPresentes(null));
  }, [sesionActiva]);

  const listadoFiltrado = participantes
    .filter(p => {
      // Filtro de sesión activa: solo Presente/Tardanza
      if (idsPresentes !== null && !idsPresentes.has(p.id)) return false;
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return (
        p.nombres.toLowerCase().includes(q) ||
        p.apellidos.toLowerCase().includes(q) ||
        (p.numeracion ?? '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      switch (orden) {
        case 'calificacion-desc':    return (extras[b.id]?.total ?? 0) - (extras[a.id]?.total ?? 0);
        case 'calificacion-asc':     return (extras[a.id]?.total ?? 0) - (extras[b.id]?.total ?? 0);
        case 'participaciones-desc': return (extras[b.id]?.participaciones ?? 0) - (extras[a.id]?.participaciones ?? 0);
        case 'participaciones-asc':  return (extras[a.id]?.participaciones ?? 0) - (extras[b.id]?.participaciones ?? 0);
        default: return 0;
      }
    });

  if (!modeloActivo) {
    return (
      <div className="d-flex gap-3 align-items-start">
        <div className="card bg-dark border-secondary shadow flex-grow-1">
          <div className="card-body p-5 text-center">
            <p className="text-secondary fs-5 mb-0">
              Selecciona un modelo desde la barra superior para ver sus participantes.
            </p>
          </div>
        </div>
        <PanelDerecho participantes={[]} extras={{}} />
      </div>
    );
  }

  return (
    <div className="d-flex gap-3 align-items-start">
    <div className="card bg-dark border-secondary shadow flex-grow-1">
      <div className="card-body p-4">

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="card-title text-light mb-0">Participantes</h5>
            {sesionActiva && (
              <span className="badge bg-primary bg-opacity-25 text-primary mt-1" style={{ fontSize: '0.75rem' }}>
                Filtrando por: {sesionActiva.numSesionTrabajo} — presentes y tardanzas
              </span>
            )}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setModalAgregar(true)}>
            + Agregar Participante
          </button>
        </div>

        <div className="row g-2 mb-4">
          <div className="col-md-7">
            <input
              type="text"
              className="form-control bg-dark text-light border-secondary"
              placeholder="Buscar por nombre, apellido o numeración..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="col-md-5">
            <select
              className="form-select bg-dark text-light border-secondary"
              value={orden}
              onChange={e => setOrden(e.target.value)}
            >
              {ORDEN_OPCIONES.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {cargando ? (
          <div className="d-flex align-items-center gap-2 text-secondary">
            <div className="spinner-border spinner-border-sm" role="status" />
            <span>Cargando participantes...</span>
          </div>
        ) : listadoFiltrado.length === 0 ? (
          <p className="text-secondary fst-italic">
            No hay participantes{busqueda ? ' que coincidan con la búsqueda' : ' en este modelo'}.
          </p>
        ) : (
          listadoFiltrado.map(p => (
            <FilaParticipante
              key={p.id}
              participante={p}
              onAbrirFeedback={setModalFeedback}
              onDatosActualizados={() => setVersion(v => v + 1)}
              onEliminado={() => setVersion(v => v + 1)}
            />
          ))
        )}
      </div>

      {modalFeedback && (
        <FeedbackModal
          participante={modalFeedback}
          onCerrar={() => setModalFeedback(null)}
        />
      )}

      {modalAgregar && (
        <AgregarParticipante
          modeloActivo={modeloActivo}
          onCerrar={() => setModalAgregar(false)}
          onAgregado={() => setVersion(v => v + 1)}
        />
      )}
    </div>
    <PanelDerecho participantes={participantes} extras={extras} />
    </div>
  );
}
