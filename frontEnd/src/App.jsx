import { useAuth } from './context/AuthContext';
import LoginPage       from './components/LoginPage';
import OrganizadorApp  from './components/organizador/OrganizadorApp';
import VoluntarioApp   from './components/voluntario/VoluntarioApp';
import Footer          from './components/Footer';

export default function App() {
  const { auth } = useAuth();

  const renderContent = () => {
    if (!auth) return <LoginPage />;
    if (auth.rol === 'Organizador') return <OrganizadorApp />;
    if (auth.rol === 'Voluntario')  return <VoluntarioApp />;
    return <LoginPage />;
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-dark">
      {renderContent()}
      <Footer />
    </div>
  );
}
