import { useState } from 'react';
import { getParticipantes, getFeedback } from '../services/api';

export default function ExportarFeedbacks({ modeloActivo }) {
  const [cargando, setCargando] = useState(false);
  const [error, setError]       = useState('');

  async function handleExportar() {
    setCargando(true);
    setError('');
    try {
      const filtros = modeloActivo ? { idModelo: modeloActivo.id } : {};
      const participantes = await getParticipantes(filtros);

      const feedbacks = await Promise.all(
        participantes.map(async p => {
          const res = await getFeedback(p.id).catch(() => null);
          return { participante: p, comentario: res?.comentario ?? null };
        })
      );

      const conFeedback = feedbacks.filter(f => f.comentario);
      if (conFeedback.length === 0) {
        setError('No hay feedbacks registrados para exportar.');
        return;
      }

      const separador = '─'.repeat(60);
      const lineas = conFeedback.map(({ participante: p, comentario }) => {
        const plerd = p.numeracionPLERD ? `[${p.numeracionPLERD}] ` : '';
        return [`${plerd}${p.nombres} ${p.apellidos}`, comentario, separador].join('\n');
      });

      const fecha = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
      const encabezado = modeloActivo
        ? [modeloActivo.distrito, modeloActivo.regional, modeloActivo.anioEdicion].filter(Boolean).join(' · ') || `Modelo #${modeloActivo.id}`
        : 'Todos los modelos';

      const contenido = [
        'FEEDBACKS — SISTEMA DE EVALUACIÓN PLERD',
        encabezado,
        `Generado el ${fecha}`,
        separador, '',
        ...lineas,
      ].join('\n');

      const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      const partes = modeloActivo
        ? [modeloActivo.distrito, modeloActivo.regional, modeloActivo.anioEdicion].filter(Boolean)
        : [];
      a.href     = url;
      a.download = `feedbacks_${partes.join('_') || 'PLERD'}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al exportar: ' + err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card bg-dark border-secondary shadow" style={{ maxWidth: 480 }}>
      <div className="card-body p-4">
        <h5 className="card-title text-light mb-1">Exportar Feedbacks</h5>
        <p className="text-secondary small mb-4">
          {modeloActivo
            ? <>Modelo: <span className="text-light">{[modeloActivo.distrito, modeloActivo.regional, modeloActivo.anioEdicion].filter(Boolean).join(' · ') || `#${modeloActivo.id}`}</span></>
            : 'Se exportarán feedbacks de todos los modelos.'
          }
        </p>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        <button className="btn btn-info w-100 text-dark fw-semibold" onClick={handleExportar} disabled={cargando}>
          {cargando
            ? <><span className="spinner-border spinner-border-sm me-2" />Generando...</>
            : 'Descargar TXT'}
        </button>
      </div>
    </div>
  );
}
