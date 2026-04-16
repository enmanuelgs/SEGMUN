import { useState, useEffect, useRef } from 'react';

const KEY = 'sistema_timer_v1';

// ── helpers ────────────────────────────────────────────────────────────────
function fmt(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function parseTime(str) {
  const t = str.trim();
  if (t.includes(':')) {
    const [m, s] = t.split(':').map(n => parseInt(n) || 0);
    return (m * 60 + s) * 1000;
  }
  return (parseInt(t) || 0) * 60 * 1000; // número solo = minutos
}

const DEFAULTS = {
  modo: 'discurso',
  durMs: 90000,
  startAt: null,
  consumido: 0,
  caucusDurMs: 600000,
  caucusStartAt: null,
  caucusConsumido: 0,
  intDurMs: 60000,
  intStartAt: null,
  intConsumido: 0,
};

function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return s ? { ...DEFAULTS, ...s } : { ...DEFAULTS };
  } catch { return { ...DEFAULTS }; }
}

// ── audio engine ───────────────────────────────────────────────────────────
function beep(freq, durSec, volume = 1.0, type = 'square') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    // Dos osciladores en paralelo para más cuerpo
    [freq, freq * 1.5].forEach(f => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime + durSec * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durSec);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + durSec);
      osc.onended = () => ctx.close();
    });
  } catch (_) {}
}

function beepN(n, freq, durSec, interval = 0.5, volume = 1.0) {
  for (let i = 0; i < n; i++) {
    setTimeout(() => beep(freq, durSec, volume), i * interval * 1000);
  }
}

const SOUNDS = {
  mitad:    () => beep(880, 0.4,  1.0),             // 1 beep fuerte
  unMinuto: () => beepN(2, 1047, 0.4, 0.5, 1.0),   // 2 beeps agudos
  diezSeg:  () => beepN(3, 1319, 0.3, 0.4, 1.0),   // 3 beeps muy agudos
  fin:      () => beepN(3, 523,  0.6, 0.7, 1.0),   // 3 beeps graves largos
};

// ── sub-components ─────────────────────────────────────────────────────────
function ProgressBar({ rem, dur, color }) {
  return (
    <div style={{ height: 3, background: '#1f2937', borderRadius: 2, margin: '6px 0' }}>
      <div style={{
        height: '100%',
        width: `${Math.max(0, 100 * (1 - rem / dur))}%`,
        background: color,
        borderRadius: 2,
        transition: 'width 0.25s linear',
      }} />
    </div>
  );
}

function PresetBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: '1px solid #3b82f6',
      color: '#60a5fa', borderRadius: 3, padding: '1px 6px',
      fontSize: '0.65rem', cursor: 'pointer', fontFamily: 'monospace',
    }}>
      {label}
    </button>
  );
}

function CustomInput({ value, onChange, onConfirm }) {
  function handleChange(e) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2
      ? digits.slice(0, 2) + ':' + digits.slice(2)
      : digits;
    onChange(formatted);
  }

  return (
    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      <input
        className="form-control form-control-sm bg-dark text-light border-secondary text-center"
        style={{ fontSize: '0.7rem', padding: '1px 4px', height: 24 }}
        placeholder="MM:SS"
        value={value}
        onChange={handleChange}
        onKeyDown={e => e.key === 'Enter' && onConfirm()}
      />
      <button onClick={onConfirm} style={{
        background: 'transparent', border: '1px solid #6b7280',
        color: '#9ca3af', borderRadius: 3, padding: '1px 6px',
        fontSize: '0.65rem', cursor: 'pointer',
      }}>✓</button>
    </div>
  );
}

// ── main component ─────────────────────────────────────────────────────────
export default function Cronometro() {
  const [st, setSt]           = useState(loadState);
  const [tick, setTick]       = useState(0);
  const [cMain, setCMain]     = useState('');
  const [cCaucus, setCCaucus] = useState('');
  const [cInt, setCInt]       = useState('');
  const intervalRef           = useRef(null);
  // Tracks which alerts have already fired for each timer (reset on new timer or reset)
  const alertedMain   = useRef({ mitad: false, unMin: false, diezSeg: false, fin: false });
  const alertedCaucus = useRef({ mitad: false, unMin: false, diezSeg: false, fin: false });
  const alertedInt    = useRef({ mitad: false, unMin: false, diezSeg: false, fin: false });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(st));
  }, [st]);

  useEffect(() => {
    clearInterval(intervalRef.current);
    if (st.startAt || st.caucusStartAt || st.intStartAt) {
      intervalRef.current = setInterval(() => setTick(n => n + 1), 250);
    }
    return () => clearInterval(intervalRef.current);
  }, [st.startAt, st.caucusStartAt, st.intStartAt]);

  // Reset alert flags when a timer is reset or a new duration is set
  useEffect(() => { alertedMain.current   = { mitad: false, unMin: false, diezSeg: false, fin: false }; }, [st.durMs,      st.consumido === 0 && !st.startAt]);
  useEffect(() => { alertedCaucus.current = { mitad: false, unMin: false, diezSeg: false, fin: false }; }, [st.caucusDurMs, st.caucusConsumido === 0 && !st.caucusStartAt]);
  useEffect(() => { alertedInt.current    = { mitad: false, unMin: false, diezSeg: false, fin: false }; }, [st.intDurMs,    st.intConsumido === 0 && !st.intStartAt]);

  function checkAlerts(remMs, durMs, running, alerted) {
    if (!running) return;
    const mitadMs = durMs / 2;
    if (!alerted.current.mitad && remMs <= mitadMs && remMs > mitadMs - 500) {
      alerted.current.mitad = true; SOUNDS.mitad();
    }
    if (!alerted.current.unMin && remMs <= 60000 && remMs > 59500) {
      alerted.current.unMin = true; SOUNDS.unMinuto();
    }
    if (!alerted.current.diezSeg && remMs <= 10000 && remMs > 9500) {
      alerted.current.diezSeg = true; SOUNDS.diezSeg();
    }
    if (!alerted.current.fin && remMs <= 0) {
      alerted.current.fin = true; SOUNDS.fin();
    }
  }

  function upd(patch) { setSt(p => ({ ...p, ...patch })); }

  function elapsed(startAt, consumido) {
    return startAt ? consumido + (Date.now() - startAt) : consumido;
  }
  function rem(durMs, startAt, consumido) {
    return Math.max(0, durMs - elapsed(startAt, consumido));
  }

  const mainRem   = rem(st.durMs,       st.startAt,        st.consumido);
  const caucusRem = rem(st.caucusDurMs, st.caucusStartAt,  st.caucusConsumido);
  const intRem    = rem(st.intDurMs,    st.intStartAt,     st.intConsumido);

  if (st.modo !== 'caucusModerado') {
    // Discurso y Regular/Abierto: todas las alertas en el timer principal
    checkAlerts(mainRem, st.durMs, !!st.startAt, alertedMain);
  } else {
    // Caucus Moderado: sin alertas en el total; solo 15s en la intervención
    if (!!st.intStartAt && !alertedInt.current.diezSeg && intRem <= 15000 && intRem > 14500) {
      alertedInt.current.diezSeg = true;
      SOUNDS.diezSeg();
    }
  }

  function color(remMs, durMs) {
    if (remMs <= 0)      return '#ef4444';
    if (remMs < 10000)   return '#ef4444';
    if (remMs < 30000)   return '#f59e0b';
    return '#4ade80';
  }

  // blink when time is up (uses tick)
  function blinkVisible(remMs) {
    return remMs > 0 || tick % 4 < 2;
  }

  // ── controls ──
  const toggleMain = () => {
    if (st.startAt) upd({ consumido: elapsed(st.startAt, st.consumido), startAt: null });
    else if (mainRem > 0) upd({ startAt: Date.now() });
  };
  const resetMain = () => upd({ startAt: null, consumido: 0 });

  const toggleCaucus = () => {
    if (st.caucusStartAt) upd({ caucusConsumido: elapsed(st.caucusStartAt, st.caucusConsumido), caucusStartAt: null });
    else if (caucusRem > 0) upd({ caucusStartAt: Date.now() });
  };
  const resetCaucus = () => upd({ caucusStartAt: null, caucusConsumido: 0 });

  const toggleInt = () => {
    if (st.intStartAt) upd({ intConsumido: elapsed(st.intStartAt, st.intConsumido), intStartAt: null });
    else if (intRem > 0) upd({ intStartAt: Date.now() });
  };
  const resetInt = () => upd({ intStartAt: null, intConsumido: 0 });

  // ── preset setters ──
  const setMain   = ms => upd({ durMs: ms, startAt: null, consumido: 0 });
  const setCaucus = ms => upd({ caucusDurMs: ms, caucusStartAt: null, caucusConsumido: 0 });
  const setInt    = ms => upd({ intDurMs: ms, intStartAt: null, intConsumido: 0 });

  const applyCustom = (raw, setter, resetFn) => {
    const ms = parseTime(raw);
    if (ms > 0) { setter(ms); resetFn(''); }
  };

  // ── styles ──
  const ctrlBtn = (c = '#6b7280') => ({
    background: 'transparent', border: `1px solid ${c}`, color: c,
    borderRadius: 3, padding: '3px 9px', fontSize: '0.75rem',
    cursor: 'pointer',
  });

  function Display({ remMs, durMs }) {
    const c = color(remMs, durMs);
    const visible = blinkVisible(remMs);
    return (
      <div style={{
        fontFamily: "'Courier New', monospace",
        fontSize: '3.4rem', fontWeight: 'bold', color: c,
        letterSpacing: 3, textShadow: `0 0 10px ${c}55`,
        textAlign: 'center', lineHeight: 1,
        opacity: visible ? 1 : 0, transition: 'opacity 0.1s',
        margin: '4px 0',
      }}>
        {fmt(remMs)}
      </div>
    );
  }

  function SmallDisplay({ remMs, durMs, label }) {
    const c = color(remMs, durMs);
    const visible = blinkVisible(remMs);
    return (
      <div style={{ marginBottom: 2 }}>
        <div style={{ fontSize: '0.58rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {label}
        </div>
        <div style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '2.6rem', fontWeight: 'bold', color: c,
          letterSpacing: 2, textShadow: `0 0 8px ${c}55`,
          lineHeight: 1, opacity: visible ? 1 : 0,
        }}>
          {fmt(remMs)}
        </div>
      </div>
    );
  }

  const MODOS = [
    { id: 'discurso',       label: 'Discurso',  title: 'Discurso'          },
    { id: 'caucusModerado', label: 'C. Mod.',   title: 'Caucus Moderado'   },
    { id: 'regularAbierto', label: 'Reg./Ab.',  title: 'Regular / Abierto' },
  ];

  return (
    <div style={{ width: 240, flexShrink: 0, position: 'sticky', top: 16, alignSelf: 'flex-start' }}>
      <div className="card bg-dark border-secondary" style={{ fontSize: '0.75rem' }}>

        {/* ── header: modo ── */}
        <div className="card-header border-secondary p-1" style={{ background: '#0d1117' }}>
          <div className="d-flex gap-1 justify-content-center">
            {MODOS.map(({ id, label, title }) => (
              <button key={id} title={title} onClick={() => upd({
                modo: id, startAt: null, consumido: 0,
                caucusStartAt: null, caucusConsumido: 0,
                intStartAt: null, intConsumido: 0,
              })} style={{
                background: st.modo === id ? '#1e3a5f' : 'transparent',
                border: `1px solid ${st.modo === id ? '#3b82f6' : '#374151'}`,
                color: st.modo === id ? '#60a5fa' : '#6b7280',
                borderRadius: 3, padding: '2px 7px',
                fontSize: '0.62rem', cursor: 'pointer',
              }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="card-body p-2">

          {/* ══ DISCURSO ══ */}
          {st.modo === 'discurso' && <>
            <Display remMs={mainRem} durMs={st.durMs} />
            <ProgressBar rem={mainRem} dur={st.durMs} color={color(mainRem, st.durMs)} />
            <div className="d-flex gap-1 justify-content-center my-2">
              <button onClick={toggleMain} style={ctrlBtn(st.startAt ? '#f59e0b' : '#4ade80')}>
                {st.startAt ? '⏸' : '▶'}
              </button>
              <button onClick={resetMain} style={ctrlBtn()}>↺</button>
            </div>
            <div className="d-flex gap-1 flex-wrap justify-content-center mb-2">
              {[['1:30', 90000], ['2:00', 120000], ['10:00', 600000]].map(([l, ms]) => (
                <PresetBtn key={l} label={l} onClick={() => setMain(ms)} />
              ))}
            </div>
            <CustomInput value={cMain} onChange={setCMain}
              onConfirm={() => applyCustom(cMain, setMain, setCMain)} />
          </>}

          {/* ══ REGULAR / ABIERTO ══ */}
          {st.modo === 'regularAbierto' && <>
            <Display remMs={mainRem} durMs={st.durMs} />
            <ProgressBar rem={mainRem} dur={st.durMs} color={color(mainRem, st.durMs)} />
            <div className="d-flex gap-1 justify-content-center my-2">
              <button onClick={toggleMain} style={ctrlBtn(st.startAt ? '#f59e0b' : '#4ade80')}>
                {st.startAt ? '⏸' : '▶'}
              </button>
              <button onClick={resetMain} style={ctrlBtn()}>↺</button>
            </div>
            <div className="d-flex gap-1 flex-wrap justify-content-center mb-2">
              {[['20:00', 1200000], ['30:00', 1800000]].map(([l, ms]) => (
                <PresetBtn key={l} label={l} onClick={() => setMain(ms)} />
              ))}
            </div>
            <CustomInput value={cMain} onChange={setCMain}
              onConfirm={() => applyCustom(cMain, setMain, setCMain)} />
          </>}

          {/* ══ CAUCUS MODERADO ══ */}
          {st.modo === 'caucusModerado' && <>
            {/* Caucus total */}
            <SmallDisplay remMs={caucusRem} durMs={st.caucusDurMs} label="Caucus Total" />
            <ProgressBar rem={caucusRem} dur={st.caucusDurMs} color={color(caucusRem, st.caucusDurMs)} />
            <div className="d-flex gap-1 justify-content-center mb-2">
              <button onClick={toggleCaucus} style={ctrlBtn(st.caucusStartAt ? '#f59e0b' : '#4ade80')}>
                {st.caucusStartAt ? '⏸' : '▶'}
              </button>
              <button onClick={resetCaucus} style={ctrlBtn()}>↺</button>
              <PresetBtn label="10:00" onClick={() => setCaucus(600000)} />
            </div>
            <CustomInput value={cCaucus} onChange={setCCaucus}
              onConfirm={() => applyCustom(cCaucus, setCaucus, setCCaucus)} />

            {/* Separador */}
            <div style={{ borderTop: '1px solid #1f2937', margin: '10px 0' }} />

            {/* Intervención */}
            <SmallDisplay remMs={intRem} durMs={st.intDurMs} label="Intervención" />
            <ProgressBar rem={intRem} dur={st.intDurMs} color={color(intRem, st.intDurMs)} />
            <div className="d-flex gap-1 justify-content-center mb-2">
              <button onClick={toggleInt} style={ctrlBtn(st.intStartAt ? '#f59e0b' : '#4ade80')}>
                {st.intStartAt ? '⏸' : '▶'}
              </button>
              <button onClick={resetInt} style={ctrlBtn()} title="Nueva intervención">↺</button>
              <PresetBtn label="1:00" onClick={() => setInt(60000)} />
            </div>
            <CustomInput value={cInt} onChange={setCInt}
              onConfirm={() => applyCustom(cInt, setInt, setCInt)} />
          </>}

        </div>
      </div>
    </div>
  );
}
