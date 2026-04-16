import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const AUTH_KEY = 'sistema_auth_v1';

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)) ?? null; }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(loadAuth);

  const login = useCallback((data) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    setAuth(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem('sistema_app_state_v1');
    setAuth(null);
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
