// src/components/auth/ProtectedRoute.jsx
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Loading from '../common/Loading';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Loading />
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;