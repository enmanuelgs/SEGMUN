import { useState } from 'react';
import * as XLSX from 'xlsx';
import { getParticipantes, getCalificaciones, getParticipaciones } from '../services/api';

const CRITERIOS = [
  { key: 'investigacionAcademica', label: 'Inv. Académica' },
  { key: 'pensamientoCritico',     label: 'Pens. Crítico'  },
  { key: 'oratoria',               label: 'Oratoria'       },
  { key: 'argumentacion',          label: 'Argumentación'  },
  { key: 'redaccion',              label: 'Redacción'      },
  { key: 'negociacion',            label: 'Negociación'    },
  { key: 'resolucionConflictos',   label: 'Res. Conflictos'},
  { key: 'liderazgo',              label: 'Liderazgo'      },
  { key: 'colaboracion',           label: 'Colaboración'   },
];

export default function ExportarCalificaciones({ modeloActivo }) {
  const [formato, setFormato]   = useState('excel');
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');

  async function obtenerDatos() {
    const filtros = modeloActivo ? { idModelo: modeloActivo.id } : {};
    const participantes = await getParticipantes(filtros);
    return Promise.all(
      participantes.map(async p => {
        const [calRes, partRes] = await Promise.allSettled([
          getCalificaciones(p.id),
          getParticipaciones(p.id),
        ]);
        const cal  = calRes.status  === 'fulfilled' ? calRes.value  : null;
        const part = partRes.status === 'fulfilled' ? partRes.value : null;
        return {
          'Numeración':      p.numeracion ?? '',
          'Nombres':         p.nombres,
          'Apellidos':       p.apellidos,
          ...Object.fromEntries(CRITERIOS.map(c => [c.label, cal?.[c.key] ?? ''])),
          'Total':           cal?.total ?? '',
          'Participaciones': part?.numParticipaciones ?? 0,
        };
      })
    );
  }

  function nombreArchivo(ext) {
    if (!modeloActivo) return `calificaciones.${ext}`;
    const partes = [modeloActivo.distrito, modeloActivo.regional, modeloActivo.anioEdicion].filter(Boolean);
    return `calificaciones_${partes.join('_') || `modelo${modeloActivo.id}`}.${ext}`;
  }

  async function handleExportar() {
    setCargando(true);
    setError('');
    try {
      const filas = await obtenerDatos();
      if (filas.length === 0) { setError('No hay participantes para exportar.'); return; }

      if (formato === 'excel') {
        const ws = XLSX.utils.json_to_sheet(filas);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Calificaciones');
        XLSX.writeFile(wb, nombreArchivo('xlsx'));
      } else {
        const encabezados = Object.keys(filas[0]);
        const csvLineas = [
          encabezados.join(','),
          ...filas.map(f =>
            encabezados.map(h => {
              const val = String(f[h] ?? '').replace(/"/g, '""');
              return val.includes(',') ? `"${val}"` : val;
            }).join(',')
          ),
        ];
        const blob = new Blob([csvLineas.join('\n')], { type: 'text/csv;charset=utf-8;' });
        descargar(blob, nombreArchivo('csv'));
      }
    } catch (err) {
      setError('Error al exportar: ' + err.message);
    } finally {
      setCargando(false);
    }
  }

  function descargar(blob, nombre) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nombre; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card bg-dark border-secondary shadow" style={{ maxWidth: 480 }}>
      <div className="card-body p-4">
        <h5 className="card-title text-light mb-1">Exportar Calificaciones</h5>
        <p className="text-secondary small mb-3">
          {modeloActivo
            ? <>Modelo: <span className="text-light">{[modeloActivo.distrito, modeloActivo.regional, modeloActivo.anioEdicion].filter(Boolean).join(' · ') || `#${modeloActivo.id}`}</span></>
            : 'Se exportarán todos los participantes de todos los modelos.'
          }
        </p>

        <div className="mb-4">
          <label className="form-label text-secondary small text-uppercase fw-semibold">Formato</label>
          <div className="d-flex gap-3">
            {['excel', 'csv'].map(f => (
              <div className="form-check" key={f}>
                <input className="form-check-input" type="radio" id={`fmt-${f}`} value={f}
                  checked={formato === f} onChange={() => setFormato(f)} />
                <label className="form-check-label text-light" htmlFor={`fmt-${f}`}>
                  {f === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'}
                </label>
              </div>
            ))}
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        <button className="btn btn-success w-100" onClick={handleExportar} disabled={cargando}>
          {cargando
            ? <><span className="spinner-border spinner-border-sm me-2" />Generando...</>
            : `Descargar ${formato === 'excel' ? 'Excel' : 'CSV'}`}
        </button>
      </div>
    </div>
  );
}
