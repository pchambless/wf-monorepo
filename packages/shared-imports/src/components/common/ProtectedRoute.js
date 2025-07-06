import { Navigate, useLocation } from 'react-router-dom';
import accountStore from '../stores/accountStore';
import createLogger from '../utils/logger';

const log = createLogger('ProtectedRoute');

export const ProtectedRoute = ({ children, path }) => {
  const location = useLocation();
  const isAuthenticated = accountStore.isAuthenticated;

  log.debug('ProtectedRoute check', {
    path,
    currentPath: location.pathname,
    isAuthenticated
  });

  if (!isAuthenticated) {
    log.debug('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};
