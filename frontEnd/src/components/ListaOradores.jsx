import { useState, useEffect, useRef } from 'react';

const KEY = 'sistema_oradores_v1';

const DEFAULTS = {
  cola:      [],    // [{ id, nombre, plerd }] — todos, en orden
  actualIdx: -1,    // índice del orador actual (-1 = sin empezar)
  discursados: [],  // ids de quienes ya hablaron
  tiempoMs:  90000,
  startAt:   null,
  consumido: 0,
};

function load() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }; }
  catch { return { ...DEFAULTS }; }
}

function fmt(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function parseTime(str) {
  const t = str.trim();
  if (t.includes(':')) {
    const [m, s] = t.split(':').map(n => parseInt(n) || 0);
    return (m * 60 + s) * 1000;
  }
  return (parseInt(t) || 0) * 60 * 1000;
}

function beep(freq, dur, vol = 1.0) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [freq, freq * 1.5].forEach(f => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.start(); osc.stop(ctx.currentTime + dur);
      osc.onended = () => ctx.close();
    });
  } catch (_) {}
}

function iconBtn(color) {
  return {
    background: 'transparent', border: `1px solid ${color}`, color,
    borderRadius: 3, padding: '1px 6px', fontSize: '0.65rem', cursor: 'pointer',
  };
}

function CustomInput({ value, onChange, onConfirm }) {
  function handleChange(e) {
    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange(d.length > 2 ? d.slice(0, 2) + ':' + d.slice(2) : d);
  }
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <input
        className="form-control form-control-sm bg-dark text-light border-secondary text-center"
        style={{ fontSize: '0.7rem', padding: '1px 4px', height: 24 }}
        placeholder="MM:SS"
        value={value}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Enter' && onConfirm()}
      />
      <button onClick={onConfirm} style={iconBtn('#6b7280')}>✓</button>
    </div>
  );
}

export default function ListaOradores({ participantes }) {
  const [st, setSt]       = useState(load);
  const [, setTick]       = useState(0);
  const [custom, setCustom] = useState('');
  const intervalRef       = useRef(null);
  const alertedRef        = useRef({ quince: false, fin: false });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(st));
  }, [st]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (st.startAt) intervalRef.current = setInterval(() => setTick(n => n + 1), 250);
    return () => clearInterval(intervalRef.current);
  }, [st.startAt]);

  function upd(patch) { setSt(p => ({ ...p, ...patch })); }

  function elapsed() {
    return st.startAt ? st.consumido + (Date.now() - st.startAt) : st.consumido;
  }

  const remMs  = Math.max(0, st.tiempoMs - elapsed());
  const running = !!st.startAt;
  const orador  = st.actualIdx >= 0 ? st.cola[st.actualIdx] : null;

  // Alertas
  if (running) {
    if (!alertedRef.current.quince && remMs <= 15000 && remMs > 14500) {
      alertedRef.current.quince = true;
      beep(1319, 0.3); setTimeout(() => beep(1319, 0.3), 400); setTimeout(() => beep(1319, 0.3), 800);
    }
    if (!alertedRef.current.fin && remMs <= 0) {
      alertedRef.current.fin = true;
      beep(523, 0.6); setTimeout(() => beep(523, 0.6), 700); setTimeout(() => beep(523, 0.6), 1400);
    }
  }

  const colorTime = remMs <= 0 ? '#ef4444' : remMs < 15000 ? '#f59e0b' : '#4ade80';

  function estadoOrador(o, i) {
    if (st.discursados.includes(o.id)) return 'discursado';
    if (i === st.actualIdx) return 'actual';
    return 'pendiente';
  }

  const COLOR_ESTADO = { discursado: '#4ade80', actual: '#facc15', pendiente: '#6b7280' };

  function toggle() {
    if (!orador) return;
    if (running) upd({ consumido: elapsed(), startAt: null });
    else if (remMs > 0) upd({ startAt: Date.now() });
  }

  function resetTimer() {
    alertedRef.current = { quince: false, fin: false };
    upd({ consumido: 0, startAt: null });
  }

  function siguiente() {
    if (!orador) return;
    const nuevosDisc = st.discursados.includes(orador.id)
      ? st.discursados
      : [...st.discursados, orador.id];

    // Buscar el próximo no discursado
    let nextIdx = -1;
    for (let i = st.actualIdx + 1; i < st.cola.length; i++) {
      if (!nuevosDisc.includes(st.cola[i].id)) { nextIdx = i; break; }
    }

    alertedRef.current = { quince: false, fin: false };
    upd({
      discursados: nuevosDisc,
      actualIdx:   nextIdx,
      consumido:   0,
      startAt:     nextIdx >= 0 ? Date.now() : null,
    });
  }

  function iniciar(idx) {
    alertedRef.current = { quince: false, fin: false };
    upd({ actualIdx: idx, consumido: 0, startAt: Date.now() });
  }

  function mover(idx, dir) {
    const c = [...st.cola];
    const swap = idx + dir;
    if (swap < 0 || swap >= c.length) return;
    [c[idx], c[swap]] = [c[swap], c[idx]];
    upd({ cola: c, actualIdx: st.actualIdx === idx ? swap : st.actualIdx === swap ? idx : st.actualIdx });
  }

  function quitar(idx) {
    const c = [...st.cola];
    const removedId = c[idx].id;
    c.splice(idx, 1);
    const nuevosDisc = st.discursados.filter(id => id !== removedId);
    if (idx === st.actualIdx) {
      alertedRef.current = { quince: false, fin: false };
      upd({ cola: c, discursados: nuevosDisc, actualIdx: -1, consumido: 0, startAt: null });
    } else {
      const newIdx = idx < st.actualIdx ? st.actualIdx - 1 : st.actualIdx;
      upd({ cola: c, discursados: nuevosDisc, actualIdx: newIdx });
    }
  }

  function agregar(p) {
    if (st.cola.find(o => o.id === p.id)) return;
    const nombre = p.representacion
      ? `${p.representacion} (${p.nombres} ${p.apellidos})`
      : `${p.nombres} ${p.apellidos}`;
    upd({ cola: [...st.cola, { id: p.id, nombre, plerd: p.numeracion ?? '' }] });
  }

  function reiniciarTodo() {
    alertedRef.current = { quince: false, fin: false };
    upd({ discursados: [], actualIdx: -1, consumido: 0, startAt: null });
  }

  function setTiempo(ms) {
    alertedRef.current = { quince: false, fin: false };
    upd({ tiempoMs: ms, consumido: 0, startAt: null });
  }

  // Participantes fuera de la lista
  const idsEnLista = new Set(st.cola.map(o => o.id));
  const fuera = participantes.filter(p => !idsEnLista.has(p.id));

  return (
    <div style={{ borderTop: '1px solid #1f2937', paddingTop: 10, marginTop: 4 }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
          Lista de Oradores
        </span>
        {st.cola.length > 0 && (
          <button onClick={reiniciarTodo} style={iconBtn('#4b5563')} title="Reiniciar estados">↺ Reiniciar</button>
        )}
      </div>

      {/* Timer del orador actual */}
      {orador && (
        <div style={{ background: '#0f172a', borderRadius: 6, padding: '6px 8px', marginBottom: 6, border: '1px solid #1e3a5f' }}>
          <div style={{ fontSize: '0.62rem', color: '#facc15', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {orador.plerd && <span style={{ marginRight: 4 }}>[{orador.plerd}]</span>}
            {orador.nombre}
          </div>
          <div style={{
            fontFamily: "'Courier New', monospace", fontSize: '2.4rem', fontWeight: 'bold',
            color: colorTime, letterSpacing: 2, textShadow: `0 0 8px ${colorTime}44`,
            lineHeight: 1, textAlign: 'center', margin: '2px 0',
          }}>
            {fmt(remMs)}
          </div>
          <div style={{ height: 3, background: '#1f2937', borderRadius: 2, margin: '4px 0' }}>
            <div style={{ height: '100%', width: `${Math.max(0, 100 * (1 - remMs / st.tiempoMs))}%`, background: colorTime, borderRadius: 2, transition: 'width 0.25s' }} />
          </div>
          <div className="d-flex gap-1 justify-content-center mt-1">
            <button onClick={toggle} style={iconBtn(running ? '#f59e0b' : '#4ade80')}>
              {running ? '⏸' : '▶'}
            </button>
            <button onClick={resetTimer} style={iconBtn('#6b7280')}>↺</button>
            <button onClick={siguiente} style={iconBtn('#60a5fa')}>Siguiente →</button>
          </div>
        </div>
      )}

      {/* Config tiempo */}
      <div className="d-flex gap-1 flex-wrap align-items-center mb-2">
        <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>Tiempo:</span>
        {[['1:30', 90000], ['2:00', 120000]].map(([l, ms]) => (
          <button key={l} onClick={() => setTiempo(ms)} style={{
            ...iconBtn(st.tiempoMs === ms ? '#3b82f6' : '#374151'),
            background: st.tiempoMs === ms ? '#1e3a5f' : 'transparent',
          }}>{l}</button>
        ))}
        <CustomInput value={custom} onChange={setCustom}
          onConfirm={() => { const ms = parseTime(custom); if (ms > 0) { setTiempo(ms); setCustom(''); }}} />
      </div>

      {/* Lista completa */}
      {st.cola.length === 0
        ? <p style={{ color: '#4b5563', fontSize: '0.65rem', fontStyle: 'italic', margin: '0 0 6px' }}>Sin oradores en la lista.</p>
        : (
          <div style={{ marginBottom: 6 }}>
            {st.cola.map((o, i) => {
              const estado = estadoOrador(o, i);
              const color  = COLOR_ESTADO[estado];
              const esActual = i === st.actualIdx;
              return (
                <div key={o.id} className="d-flex align-items-center justify-content-between"
                     style={{ padding: '3px 0', borderBottom: '1px solid #111827' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: '0.58rem', color: '#4b5563', width: 14, textAlign: 'right', flexShrink: 0 }}>{i + 1}.</span>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: color, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.65rem', color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {o.plerd && <span style={{ color: '#60a5fa', marginRight: 3, fontSize: '0.58rem' }}>[{o.plerd}]</span>}
                      {o.nombre}
                    </span>
                  </div>
                  <div className="d-flex gap-1" style={{ flexShrink: 0, marginLeft: 4 }}>
                    {estado === 'pendiente' && !esActual && (
                      <button onClick={() => iniciar(i)} style={iconBtn('#facc15')} title="Iniciar este orador">▶</button>
                    )}
                    {i > 0 && <button onClick={() => mover(i, -1)} style={iconBtn('#4b5563')} title="Subir en la lista">↑</button>}
                    <button onClick={() => quitar(i)} style={iconBtn('#ef4444')} title="Quitar de la lista">✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }

      {/* Participantes fuera de la lista */}
      {fuera.length > 0 && (
        <div style={{ borderTop: '1px solid #1f2937', paddingTop: 8, marginTop: 4 }}>
          <div style={{ fontSize: '0.58rem', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
            Sin incluir
          </div>
          {fuera.map(p => (
            <button key={p.id} onClick={() => agregar(p)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                background: 'transparent', border: 'none',
                color: '#ef4444', padding: '2px 0',
                fontSize: '0.65rem', cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#fca5a5'}
              onMouseLeave={e => e.currentTarget.style.color = '#ef4444'}
            >
              <span style={{ marginRight: 4 }}>+</span>
              {p.numeracion && <span style={{ color: '#374151', marginRight: 3 }}>[{p.numeracion}]</span>}
              {p.representacion
                ? `${p.representacion} (${p.nombres} ${p.apellidos})`
                : `${p.nombres} ${p.apellidos}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
