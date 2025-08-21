import { Outlet, Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { selectIsAuthenticated } from '../features/auth/authSlice';

const AuthLayout = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Blog App
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to your account or create a new one
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
