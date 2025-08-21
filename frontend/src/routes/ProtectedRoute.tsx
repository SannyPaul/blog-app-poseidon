import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  roles?: ('user' | 'admin')[];
  redirectTo?: string;
  children?: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles = ['user', 'admin'],
  redirectTo = '/auth/login',
  children,
}) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/not-authorized" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export const AdminRoute: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ProtectedRoute roles={['admin']} redirectTo="/auth/login">
    {children}
  </ProtectedRoute>
);
