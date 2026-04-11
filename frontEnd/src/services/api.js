const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Modelos
export const getModelos      = () => request('/modelos');
export const getModelo       = (id) => request(`/modelos/${id}`);
export const crearModelo     = (data) => request('/modelos', { method: 'POST', body: JSON.stringify(data) });
export const eliminarModelo  = (id) => request(`/modelos/${id}`, { method: 'DELETE' });

// Participantes
export const getParticipantes = (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.idModelo)         params.append('idModelo', filtros.idModelo);
  if (filtros.nombres)          params.append('nombres', filtros.nombres);
  if (filtros.apellidos)        params.append('apellidos', filtros.apellidos);
  if (filtros.numeracionPLERD)  params.append('numeracionPLERD', filtros.numeracionPLERD);
  const query = params.toString() ? `?${params}` : '';
  return request(`/participantes${query}`);
};
export const crearParticipante    = (data) => request('/participantes', { method: 'POST', body: JSON.stringify(data) });
export const editarParticipante   = (id, data) => request(`/participantes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarParticipante = (id) => request(`/participantes/${id}`, { method: 'DELETE' });

// Calificaciones
export const getCalificaciones    = (id) => request(`/participantes/${id}/calificaciones`);
export const editarCalificaciones = (id, data) => request(`/participantes/${id}/calificaciones`, { method: 'PUT', body: JSON.stringify(data) });

// Feedback
export const getFeedback    = (id) => request(`/participantes/${id}/feedback`);
export const editarFeedback = (id, data) => request(`/participantes/${id}/feedback`, { method: 'PUT', body: JSON.stringify(data) });

// Participaciones
export const getParticipaciones  = (id) => request(`/participantes/${id}/participaciones`);
export const sumarParticipacion  = (id) => request(`/participantes/${id}/participaciones/sumar`, { method: 'POST' });
export const restarParticipacion = (id) => request(`/participantes/${id}/participaciones/restar`, { method: 'POST' });

// Sesiones de Trabajo
export const getSesiones    = (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.idModelo) params.append('idModelo', filtros.idModelo);
  const query = params.toString() ? `?${params}` : '';
  return request(`/sesionestrabajo${query}`);
};
export const getSesion      = (id) => request(`/sesionestrabajo/${id}`);
export const crearSesion    = (data) => request('/sesionestrabajo', { method: 'POST', body: JSON.stringify(data) });
export const eliminarSesion = (id) => request(`/sesionestrabajo/${id}`, { method: 'DELETE' });

// Pase de Lista
export const getPaseLista        = (idSesion) => request(`/paselista?idSesionTrabajo=${idSesion}`);
export const actualizarPresencia = (idSesion, idParticipante, data) =>
  request(`/paselista/${idSesion}/${idParticipante}`, { method: 'PUT', body: JSON.stringify(data) });
