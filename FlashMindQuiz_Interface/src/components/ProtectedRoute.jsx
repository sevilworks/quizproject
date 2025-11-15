import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export default function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getUserRole();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole?.toLowerCase())) {
    // Rediriger vers le dashboard approprié si l'utilisateur n'a pas le bon rôle
    authService.redirectToDashboard(userRole);
    return null; // Prevent immediate Navigate while window.location.href takes effect
  }

  return children;
}