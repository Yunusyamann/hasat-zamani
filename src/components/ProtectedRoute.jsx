import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-center">Yükleniyor...</div>;
  }

  if (!user) {
    return <Navigate to="/giris" replace />;
  }

  return children;
}
