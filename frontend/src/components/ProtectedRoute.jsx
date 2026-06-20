import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../utils/auth';
import AccessDenied from './AccessDenied';

function ProtectedRoute({ allowedRoles, children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const permitted = allowedRoles.some((role) => hasRole(role));
    if (!permitted) {
      return <AccessDenied />;
    }
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;
