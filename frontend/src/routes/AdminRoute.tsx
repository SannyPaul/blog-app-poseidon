import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectIsAdmin } from '../features/auth/authSlice';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const isAdmin = useAppSelector(selectIsAdmin);
  const location = useLocation();

  if (!isAdmin) {
    // Redirect to login page if not admin
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
