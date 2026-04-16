import { useAuth } from './context/AuthContext';
import LoginPage       from './components/LoginPage';
import OrganizadorApp  from './components/organizador/OrganizadorApp';
import VoluntarioApp   from './components/voluntario/VoluntarioApp';

export default function App() {
  const { auth } = useAuth();

  if (!auth) return <LoginPage />;
  if (auth.rol === 'Organizador') return <OrganizadorApp />;
  if (auth.rol === 'Voluntario')  return <VoluntarioApp />;

  return <LoginPage />;
}
