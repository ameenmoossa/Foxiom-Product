import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (adminOnly && user?.role !== 'admin') return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;