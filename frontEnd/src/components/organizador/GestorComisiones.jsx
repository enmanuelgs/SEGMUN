import { useState, useEffect } from 'react';
import { getModelos, getComisiones, crearComision, editarComision, eliminarComision,
         getVoluntarios, getMesaDirectiva, asignarMesaDirectiva,
         getParticipantes, asignarDelegado, removerDelegado, getDelegadosComision } from '../../services/api';

function TabMesaDirectiva({ comision }) {
  const [mesa, setMesa]           = useState(null);
  const [voluntarios, setVols]    = useState([]);
  const [form, setForm]           = useState({ idDirector: '', idAdjunto1: '', idAdjunto2: '', idEyC: '' });
  const [error, setError]         = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    getVoluntarios().then(setVols).catch(() => {});
    getMesaDirectiva(comision.id).then(m => {
      if (m) {
        setMesa(m);
        setForm({ idDirector: m.idDirector ?? '', idAdjunto1: m.idAdjunto1 ?? '',
                  idAdjunto2: m.idAdjunto2 ?? '', idEyC: m.idEyC ?? '' });
      }
    }).catch(() => {});
  }, [comision.id]);

  async function handleGuardar(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await asignarMesaDirectiva(comision.id, {
        idDirector: form.idDirector  || null,
        idAdjunto1: form.idAdjunto1  || null,
        idAdjunto2: form.idAdjunto2  || null,
        idEyC:      form.idEyC       || null,
      });
      const actualizada = await getMesaDirectiva(comision.id);
      setMesa(actualizada);
    } catch (err) { setError(err.message); }
    finally { setGuardando(false); }
  }

  const selectVol = (campo, label) => (
    <div className="col-md-6">
      <label className="form-label text-secondary small">{label}</label>
      <select className="form-select form-select-sm bg-dark text-light border-secondary"
        value={form[campo]} onChange={e => setForm(f => ({ ...f, [campo]: e.target.value }))}>
        <option value="">— Sin asignar —</option>
        {voluntarios.map(v => <option key={v.id} value={v.id}>{v.nombreCompleto}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleGuardar}>
      <div className="row g-2 mb-3">
        {selectVol('idDirector', 'Director')}
        {selectVol('idAdjunto1', 'Adjunto 1')}
        {selectVol('idAdjunto2', 'Adjunto 2')}
        {selectVol('idEyC',      'Educación y Capacitación (EyC)')}
      </div>
      {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}
      <button type="submit" className="btn btn-primary btn-sm" disabled={guardando}>Guardar mesa directiva</button>
      {mesa && (
        <div className="mt-3 text-secondary small">
          <strong className="text-light">Actual:</strong>{' '}
          Director: {mesa.nombreDirector ?? '—'} | Adj1: {mesa.nombreAdjunto1 ?? '—'} |
          Adj2: {mesa.nombreAdjunto2 ?? '—'} | EyC: {mesa.nombreEyC ?? '—'}
        </div>
      )}
    </form>
  );
}

function TabDelegados({ comision, idModelo, todasComisiones, onRefrescar }) {
  const [delegados, setDelegados]         = useState([]);
  const [participantes, setParticipantes] = useState([]);
  const [todosAsignados, setTodosAsignados] = useState(new Set());
  const [idSel, setIdSel]                 = useState('');
  const [repSel, setRepSel]               = useState('');
  const [error, setError]                 = useState('');

  async function cargar() {
    // Carga delegados de esta comisión y todos los participantes del modelo en paralelo
    const [d, p] = await Promise.all([
      getDelegadosComision(comision.id).catch(() => []),
      getParticipantes({ idModelo }).catch(() => []),
    ]);

    // También obtener delegados de todas las demás comisiones del modelo
    const otrasComisiones = (todasComisiones ?? []).filter(c => c.id !== comision.id);
    const delegadosOtras = await Promise.all(
      otrasComisiones.map(c => getDelegadosComision(c.id).catch(() => []))
    );
    const idsOtras = new Set(delegadosOtras.flat().map(d => d.idParticipante));

    setDelegados(d);
    setParticipantes(p);
    setTodosAsignados(idsOtras);
  }

  useEffect(() => { cargar(); }, [comision.id]);

  async function handleAsignar() {
    if (!idSel) return;
    setError('');
    try {
      await asignarDelegado(comision.id, {
        idParticipante: Number(idSel),
        representacion: repSel.trim() || undefined,
      });
      setIdSel('');
      setRepSel('');
      await cargar();
      onRefrescar?.();
    }
    catch (err) { setError(err.message); }
  }

  async function handleRemover(idP) {
    try {
      await removerDelegado(comision.id, idP);
      await cargar();
      onRefrescar?.();
    }
    catch (err) { setError(err.message); }
  }

  const asignadosIds = new Set(delegados.map(d => d.idParticipante));
  // Excluir: ya en esta comisión O ya en otra comisión del modelo
  const disponibles  = participantes.filter(p => !asignadosIds.has(p.id) && !todosAsignados.has(p.id));

  return (
    <div>
      <div className="row g-2 mb-3">
        <div className="col-md-5">
          <select className="form-select form-select-sm bg-dark text-light border-secondary"
            value={idSel} onChange={e => setIdSel(e.target.value)}>
            <option value="">— Seleccionar participante —</option>
            {disponibles.map(p => (
              <option key={p.id} value={p.id}>{p.apellidos}, {p.nombres}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <input className="form-control form-control-sm bg-dark text-light border-secondary"
            placeholder="Representación (país/delegación)"
            value={repSel} onChange={e => setRepSel(e.target.value)} />
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary btn-sm w-100" onClick={handleAsignar}>Asignar</button>
        </div>
      </div>
      {error && <div className="alert alert-danger py-1 small mb-2">{error}</div>}

      <div className="table-responsive">
        <table className="table table-dark table-sm table-hover">
          <thead><tr><th>#</th><th>Participante</th><th>Representación</th><th>Estado</th><th></th></tr></thead>
          <tbody>
            {delegados.map(d => (
              <tr key={d.id} className={d.excedeCupo ? 'table-danger' : ''}>
                <td className="text-secondary">{d.ordenIngreso}</td>
                <td>{d.apellidos}, {d.nombres}</td>
                <td>{d.representacion ?? '—'}</td>
                <td>
                  {d.excedeCupo
                    ? <span className="badge bg-danger">Excede cupo</span>
                    : <span className="badge bg-success">En cupo</span>}
                </td>
                <td>
                  <button className="btn btn-outline-danger btn-sm py-0"
                    onClick={() => handleRemover(d.idParticipante)}>Quitar</button>
                </td>
              </tr>
            ))}
            {delegados.length === 0 && (
              <tr><td colSpan={5} className="text-secondary text-center">Sin participantes asignados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-secondary small">
        {delegados.filter(d => !d.excedeCupo).length}/{comision.maxParticipantes} cupos ocupados
        {delegados.some(d => d.excedeCupo) && <span className="text-danger ms-2">— {delegados.filter(d => d.excedeCupo).length} en lista de espera (FIFO)</span>}
      </p>
    </div>
  );
}

export default function GestorComisiones() {
  const [modelos, setModelos]         = useState([]);
  const [idModelo, setIdModelo]       = useState('');
  const [comisiones, setComisiones]   = useState([]);
  const [comisionSel, setComisionSel] = useState(null);
  const [subTab, setSubTab]           = useState('mesa');
  const [form, setForm]               = useState({ nombreComision: '', maxParticipantes: '' });
  const [error, setError]             = useState('');
  const [cargando, setCargando]       = useState(false);

  useEffect(() => { getModelos().then(setModelos).catch(() => {}); }, []);

  async function cargarComisiones(id) {
    try {
      const lista = await getComisiones(id);
      setComisiones(lista);
      // Sincronizar comisionSel con datos frescos
      setComisionSel(sel => sel ? (lista.find(c => c.id === sel.id) ?? sel) : null);
    }
    catch { setError('Error al cargar comisiones.'); }
  }

  function handleModeloChange(id) {
    setIdModelo(id);
    setComisionSel(null);
    if (id) cargarComisiones(id);
    else setComisiones([]);
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await crearComision(idModelo, { nombreComision: form.nombreComision, maxParticipantes: Number(form.maxParticipantes) });
      setForm({ nombreComision: '', maxParticipantes: '' });
      cargarComisiones(idModelo);
    } catch (err) { setError(err.message); }
    finally { setCargando(false); }
  }

  async function handleEliminar(id) {
    if (!confirm('¿Eliminar esta comisión y todos sus datos?')) return;
    try {
      await eliminarComision(idModelo, id);
      if (comisionSel?.id === id) setComisionSel(null);
      cargarComisiones(idModelo);
    } catch (err) { setError(err.message); }
  }

  return (
    <div>
      <h5 className="text-light mb-3">Comisiones</h5>

      <div className="mb-3">
        <select className="form-select bg-dark text-light border-secondary"
          value={idModelo} onChange={e => handleModeloChange(e.target.value)}>
          <option value="">— Seleccionar modelo —</option>
          {modelos.map(m => {
            const fecha = m.fechaCelebracion
              ? ` · ${m.fechaCelebracion.split('-').reverse().join('/')}`
              : '';
            return (
              <option key={m.id} value={m.id}>
                Regional {m.regional ?? '?'} — {m.distrito ?? '?'} ({m.anioEdicion ?? '?'}){fecha}
              </option>
            );
          })}
        </select>
      </div>

      {idModelo && (
        <>
          <form onSubmit={handleCrear} className="row g-2 mb-3">
            <div className="col-md-5">
              <input className="form-control bg-dark text-light border-secondary" placeholder="Nombre de la comisión"
                value={form.nombreComision} onChange={e => setForm(f => ({ ...f, nombreComision: e.target.value }))} required />
            </div>
            <div className="col-md-3">
              <input type="number" min="1" className="form-control bg-dark text-light border-secondary" placeholder="Máx. participantes"
                value={form.maxParticipantes} onChange={e => setForm(f => ({ ...f, maxParticipantes: e.target.value }))} required />
            </div>
            <div className="col-md-4">
              <button className="btn btn-primary w-100" disabled={cargando}>+ Crear Comisión</button>
            </div>
          </form>

          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          <div className="row g-2 mb-4">
            {comisiones.map(c => (
              <div key={c.id} className="col-md-4">
                <div
                  className={`card border-secondary h-100 ${comisionSel?.id === c.id ? 'border-primary' : ''}`}
                  style={{ cursor: 'pointer', background: comisionSel?.id === c.id ? 'rgba(13,110,253,0.1)' : '#1a1a2e' }}
                  onClick={() => { setComisionSel(c); setSubTab('mesa'); }}
                >
                  <div className="card-body py-2 px-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong className="text-light small">{c.nombreComision}</strong>
                        <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                          {c.nosRegistros}/{c.maxParticipantes} participantes
                        </div>
                      </div>
                      <button className="btn btn-outline-danger btn-sm py-0 ms-2"
                        onClick={e => { e.stopPropagation(); handleEliminar(c.id); }}>✕</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {comisiones.length === 0 && <p className="text-secondary fst-italic">No hay comisiones en este modelo.</p>}
          </div>

          {comisionSel && (
            <div className="card bg-dark border-secondary">
              <div className="card-header border-secondary d-flex gap-3">
                <strong className="text-light">{comisionSel.nombreComision}</strong>
                <div className="ms-auto d-flex gap-2">
                  {['mesa', 'delegados'].map(t => (
                    <button key={t} className={`btn btn-sm ${subTab === t ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setSubTab(t)}>
                      {t === 'mesa' ? 'Mesa Directiva' : 'Participantes'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-body">
                {subTab === 'mesa'      && <TabMesaDirectiva comision={comisionSel} />}
                {subTab === 'delegados' && (
                  <TabDelegados
                    comision={comisionSel}
                    idModelo={idModelo}
                    todasComisiones={comisiones}
                    onRefrescar={() => cargarComisiones(idModelo)}
                  />
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
