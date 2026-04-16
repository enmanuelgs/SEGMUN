import { useState, useEffect } from 'react';
import Cronometro from './Cronometro';
import ListaOradores from './ListaOradores';

const KEY = 'sistema_panel_v1';

function loadCfg() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) }; }
  catch { return { ...DEFAULTS }; }
}

const DEFAULTS = {
  calN: 5, calAsc: false,
  masN: 5,
  menosN: 5,
};

// ── Ranking widget ──────────────────────────────────────────────────────────
function RankingWidget({ titulo, filas, n, onN, orden, onOrden, vacio }) {
  const [editando, setEditando] = useState(false);
  const [draft, setDraft]       = useState(String(n));

  function confirmar() {
    const v = parseInt(draft);
    if (v > 0) onN(v);
    setEditando(false);
  }

  return (
    <div style={{ borderTop: '1px solid #1f2937', paddingTop: 10, marginTop: 6 }}>
      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span style={{ fontSize: '0.65rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
          {titulo}
        </span>
        <div className="d-flex align-items-center gap-1">
          {onOrden && (
            <button onClick={() => onOrden(!orden)}
              title={orden ? 'Mostrando menor primero — click para mayor primero' : 'Mostrando mayor primero — click para menor primero'}
              style={iconBtn('#4b5563')}>
              {orden ? '↑ Menor' : '↓ Mayor'}
            </button>
          )}
          {editando ? (
            <div className="d-flex gap-1">
              <input
                type="number" min={1} max={50}
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && confirmar()}
                style={{ width: 36, fontSize: '0.65rem', background: '#111827', border: '1px solid #374151', color: '#e5e7eb', borderRadius: 3, textAlign: 'center', padding: '0 2px' }}
                autoFocus
              />
              <button onClick={confirmar} style={iconBtn('#4ade80')}>✓</button>
            </div>
          ) : (
            <button onClick={() => { setDraft(String(n)); setEditando(true); }}
              style={iconBtn('#4b5563')} title="Cambiar cantidad">
              top {n}
            </button>
          )}
        </div>
      </div>

      {/* lista */}
      {filas.length === 0
        ? <p style={{ color: '#4b5563', fontSize: '0.65rem', fontStyle: 'italic', margin: 0 }}>{vacio}</p>
        : filas.map((f, i) => (
          <div key={f.id} className="d-flex justify-content-between align-items-center"
               style={{ padding: '2px 0', borderBottom: '1px solid #111827' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
              <span style={{ fontSize: '0.6rem', color: '#6b7280', width: 14, textAlign: 'right', flexShrink: 0 }}>
                {i + 1}.
              </span>
              {f.plerd && (
                <span style={{ fontSize: '0.58rem', color: '#60a5fa', flexShrink: 0 }}>[{f.plerd}]</span>
              )}
              <span style={{ fontSize: '0.68rem', color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.nombre}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: f.color ?? '#9ca3af', fontFamily: 'monospace', fontWeight: 600, flexShrink: 0, marginLeft: 4 }}>
              {f.valor}
            </span>
          </div>
        ))
      }
    </div>
  );
}

function iconBtn(color) {
  return {
    background: 'transparent', border: `1px solid ${color}`, color,
    borderRadius: 3, padding: '1px 5px', fontSize: '0.6rem', cursor: 'pointer',
  };
}

// ── main ────────────────────────────────────────────────────────────────────
export default function PanelDerecho({ participantes, extras }) {
  const [cfg, setCfg] = useState(loadCfg);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(cfg));
  }, [cfg]);

  function upd(patch) { setCfg(p => ({ ...p, ...patch })); }

  // Construir filas
  const conDatos = participantes.map(p => ({
    id:   p.id,
    nombre: p.representacion
      ? `${p.representacion} (${p.nombres} ${p.apellidos})`
      : `${p.nombres} ${p.apellidos}`,
    plerd: p.numeracion ?? '',
    total: extras[p.id]?.total ?? 0,
    part:  extras[p.id]?.participaciones ?? 0,
  }));

  // Top calificaciones
  const filasCalAsc = [...conDatos]
    .sort((a, b) => cfg.calAsc ? a.total - b.total : b.total - a.total)
    .slice(0, cfg.calN)
    .map(f => ({ ...f, valor: `${f.total}/100`, color: colorTotal(f.total) }));

  // Más participaciones
  const filasMas = [...conDatos]
    .sort((a, b) => b.part - a.part)
    .slice(0, cfg.masN)
    .map(f => ({ ...f, valor: String(f.part), color: '#60a5fa' }));

  // Menos participaciones
  const filasMenos = [...conDatos]
    .sort((a, b) => a.part - b.part)
    .slice(0, cfg.menosN)
    .map(f => ({ ...f, valor: String(f.part), color: '#f59e0b' }));

  return (
    <div style={{ flexShrink: 0, position: 'sticky', top: 16, alignSelf: 'flex-start', display: 'flex', flexDirection: 'row', gap: 8 }}>

      {/* Columna izquierda: Lista de Oradores */}
      <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="card bg-dark border-secondary" style={{ fontSize: '0.75rem' }}>
          <div className="card-body p-2">
            <ListaOradores participantes={participantes} />
          </div>
        </div>
      </div>

      {/* Columna derecha: Cronometro + Rankings */}
      <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Cronometro />

        <div className="card bg-dark border-secondary" style={{ fontSize: '0.75rem' }}>
          <div className="card-body p-2">

            <RankingWidget
              titulo="Calificaciones"
              filas={filasCalAsc}
              n={cfg.calN}
              onN={v => upd({ calN: v })}
              orden={cfg.calAsc}
              onOrden={v => upd({ calAsc: v })}
              vacio="Sin datos aún"
            />

            <RankingWidget
              titulo="+ Participaciones"
              filas={filasMas}
              n={cfg.masN}
              onN={v => upd({ masN: v })}
              vacio="Sin datos aún"
            />

            <RankingWidget
              titulo="− Participaciones (priorizar)"
              filas={filasMenos}
              n={cfg.menosN}
              onN={v => upd({ menosN: v })}
              vacio="Sin datos aún"
            />

          </div>
        </div>
      </div>

    </div>
  );
}

function colorTotal(total) {
  if (total >= 80) return '#4ade80';
  if (total >= 60) return '#facc15';
  if (total >= 40) return '#f97316';
  return '#ef4444';
}
