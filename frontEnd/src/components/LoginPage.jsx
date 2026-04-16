import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginOrganizador, loginVoluntario } from '../services/api';

export default function LoginPage() {
  const { login } = useAuth();
  const [rol, setRol]           = useState('voluntario'); // 'voluntario' | 'organizador'
  const [nombre, setNombre]     = useState('');
  const [contrasena, setContra] = useState('');
  const [error, setError]       = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const fn   = rol === 'organizador' ? loginOrganizador : loginVoluntario;
      const data = await fn({ nombreCompleto: nombre, contrasena });
      login(data);
    } catch (err) {
      setError(err.message === 'NO_AUTORIZADO' || err.message.includes('Credenciales')
        ? 'Nombre o contraseña incorrectos.'
        : err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-vh-100 bg-dark d-flex align-items-center justify-content-center">
      <div className="card bg-dark border-secondary shadow" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-body p-5">
          <h4 className="text-light fw-bold text-center mb-1">Sistema de Evaluación</h4>
          <p className="text-secondary text-center mb-4 small">Plataforma de Evaluación</p>

          {/* Selector de rol */}
          <div className="d-flex gap-2 mb-4">
            {['voluntario', 'organizador'].map(r => (
              <button
                key={r}
                type="button"
                className={`btn flex-fill ${rol === r ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => { setRol(r); setError(''); }}
              >
                {r === 'organizador' ? 'Organizador' : 'Voluntario'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label text-secondary small">Nombre completo</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                placeholder="Ej: Juan Pérez López"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="form-label text-secondary small">Contraseña</label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                value={contrasena}
                onChange={e => setContra(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={cargando}
            >
              {cargando
                ? <><span className="spinner-border spinner-border-sm me-2" />Ingresando...</>
                : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
