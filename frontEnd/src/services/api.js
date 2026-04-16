const BASE_URL = 'http://localhost:5000/api';

function getToken() {
  try {
    const auth = JSON.parse(localStorage.getItem('sistema_auth_v1'));
    return auth?.token ?? null;
  } catch { return null; }
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) throw new Error('NO_AUTORIZADO');
  if (res.status === 403) throw new Error('SIN_PERMISO');
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginOrganizador = (data) => request('/auth/organizador/login',  { method: 'POST', body: JSON.stringify(data) });
export const loginVoluntario  = (data) => request('/auth/voluntario/login',   { method: 'POST', body: JSON.stringify(data) });

// ── Modelos ───────────────────────────────────────────────────────────────────
export const getModelos     = () => request('/modelos');
export const getModelo      = (id) => request(`/modelos/${id}`);
export const crearModelo    = (data) => request('/modelos', { method: 'POST', body: JSON.stringify(data) });
export const editarModelo   = (id, data) => request(`/modelos/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarModelo = (id) => request(`/modelos/${id}`, { method: 'DELETE' });

// ── Voluntarios ───────────────────────────────────────────────────────────────
export const getVoluntarios     = () => request('/voluntarios');
export const getVoluntario      = (id) => request(`/voluntarios/${id}`);
export const getModelosPorVoluntario = (id) => request(`/voluntarios/${id}/modelos`);
export const crearVoluntario    = (data) => request('/voluntarios', { method: 'POST', body: JSON.stringify(data) });
export const editarVoluntario   = (id, data) => request(`/voluntarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarVoluntario = (id) => request(`/voluntarios/${id}`, { method: 'DELETE' });

// ── Organizadores ─────────────────────────────────────────────────────────────
export const getOrganizadores    = () => request('/organizadores');
export const crearOrganizador    = (data) => request('/organizadores', { method: 'POST', body: JSON.stringify(data) });
export const editarOrganizador   = (id, data) => request(`/organizadores/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarOrganizador = (id) => request(`/organizadores/${id}`, { method: 'DELETE' });

// ── Comisiones ────────────────────────────────────────────────────────────────
export const getComisiones    = (idModelo) => request(`/modelos/${idModelo}/comisiones`);
export const crearComision    = (idModelo, data) => request(`/modelos/${idModelo}/comisiones`, { method: 'POST', body: JSON.stringify(data) });
export const editarComision   = (idModelo, id, data) => request(`/modelos/${idModelo}/comisiones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarComision = (idModelo, id) => request(`/modelos/${idModelo}/comisiones/${id}`, { method: 'DELETE' });

// ── Mesa Directiva ────────────────────────────────────────────────────────────
export const getMesaDirectiva     = (idComision) => request(`/comisiones/${idComision}/mesa-directiva`);
export const asignarMesaDirectiva = (idComision, data) => request(`/comisiones/${idComision}/mesa-directiva`, { method: 'PUT', body: JSON.stringify(data) });

// ── Delegados de Comisión ─────────────────────────────────────────────────────
export const getDelegadosComision = (idComision) => request(`/comisiones/${idComision}/delegados`);
export const asignarDelegado      = (idComision, data) => request(`/comisiones/${idComision}/delegados`, { method: 'POST', body: JSON.stringify(data) });
export const removerDelegado      = (idComision, idParticipante) => request(`/comisiones/${idComision}/delegados/${idParticipante}`, { method: 'DELETE' });

// ── Participantes ─────────────────────────────────────────────────────────────
export const getParticipantes = (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.idModelo)    params.append('idModelo',   filtros.idModelo);
  if (filtros.idComision)  params.append('idComision', filtros.idComision);
  if (filtros.nombres)     params.append('nombres',    filtros.nombres);
  if (filtros.apellidos)   params.append('apellidos',  filtros.apellidos);
  if (filtros.numeracion)  params.append('numeracion', filtros.numeracion);
  const query = params.toString() ? `?${params}` : '';
  return request(`/participantes${query}`);
};
export const crearParticipante    = (data) => request('/participantes', { method: 'POST', body: JSON.stringify(data) });
export const editarParticipante   = (id, data) => request(`/participantes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const eliminarParticipante = (id) => request(`/participantes/${id}`, { method: 'DELETE' });

// ── Calificaciones ────────────────────────────────────────────────────────────
export const getCalificaciones    = (id) => request(`/participantes/${id}/calificaciones`);
export const editarCalificaciones = (id, data) => request(`/participantes/${id}/calificaciones`, { method: 'PUT', body: JSON.stringify(data) });

// ── Calificaciones Finales (delegados) ────────────────────────────────────────
export const getCalificacionesFinales    = (idComision) => request(`/comisiones/${idComision}/calificaciones-finales`);
export const actualizarCalificacionFinal = (idComision, idParticipante, data) =>
  request(`/comisiones/${idComision}/calificaciones-finales/participante/${idParticipante}`, { method: 'PUT', body: JSON.stringify(data) });

// ── Feedback ──────────────────────────────────────────────────────────────────
export const getFeedback    = (id) => request(`/participantes/${id}/feedback`);
export const editarFeedback = (id, data) => request(`/participantes/${id}/feedback`, { method: 'PUT', body: JSON.stringify(data) });

// ── Participaciones ───────────────────────────────────────────────────────────
export const getParticipaciones  = (id) => request(`/participantes/${id}/participaciones`);
export const sumarParticipacion  = (id) => request(`/participantes/${id}/participaciones/sumar`, { method: 'POST' });
export const restarParticipacion = (id) => request(`/participantes/${id}/participaciones/restar`, { method: 'POST' });

// ── Sesiones de Trabajo ───────────────────────────────────────────────────────
export const getSesiones = (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.idModelo) params.append('idModelo', filtros.idModelo);
  const query = params.toString() ? `?${params}` : '';
  return request(`/sesionestrabajo${query}`);
};
export const getSesion      = (id) => request(`/sesionestrabajo/${id}`);
export const crearSesion    = (data) => request('/sesionestrabajo', { method: 'POST', body: JSON.stringify(data) });
export const eliminarSesion = (id) => request(`/sesionestrabajo/${id}`, { method: 'DELETE' });

// ── Pase de Lista ─────────────────────────────────────────────────────────────
export const getPaseLista        = (idSesion) => request(`/paselista?idSesionTrabajo=${idSesion}`);
export const actualizarPresencia = (idSesion, idParticipante, data) =>
  request(`/paselista/${idSesion}/${idParticipante}`, { method: 'PUT', body: JSON.stringify(data) });
