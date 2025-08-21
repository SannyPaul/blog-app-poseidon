import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { authApi } from './services/auth';
import { useAppSelector } from './hooks/useAppSelector';
import { useAppDispatch } from './hooks/useAppDispatch';
import { setCredentials, selectIsAuthenticated } from './features/auth/authSlice';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { Toaster } from 'react-hot-toast';

// Layout Components
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import PostDetailPage from './pages/PostDetailPage';
import Dashboard from './pages/admin/Dashboard';
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
    <p className="text-xl text-gray-600">Page not found</p>
  </div>
);

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: user } = authApi.endpoints.getMe.useQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If we have a token but no user data yet, validate it
      if (!user) {
        const validateToken = async () => {
          try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (response.ok) {
              const userData = await response.json();
              dispatch(setCredentials({ user: userData, token }));
            } else {
              // Token is invalid, clear it
              localStorage.removeItem('token');
            }
          } catch (err) {
            console.error('Error validating token:', err);
            localStorage.removeItem('token');
          }
        };
        validateToken();
      } else if (user) {
        // We have both token and user, make sure they're in sync
        dispatch(setCredentials({ user, token }));
      }
    }
  }, [dispatch, user]);


  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="post/:slug" element={<PostDetailPage />} />
            
            {/* Auth Routes */}
            <Route path="/auth" element={!isAuthenticated ? <AuthLayout /> : <Navigate to="/" />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="create-post" element={<CreatePostPage />} />
              <Route path="edit-post/:id" element={<EditPostPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              }
            />

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
