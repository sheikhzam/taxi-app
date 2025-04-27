import { Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';

// Protected route wrapper
const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }

  if (!['driver', 'rider'].includes(role)) {
    localStorage.removeItem('role');
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Auth route wrapper (redirects to dashboard if already logged in)
const AuthRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (token && role) {
    return <Navigate to={`/${role}/dashboard`} replace />;
  }
  
  if (token && !role) {
    localStorage.removeItem('token');
  }
  return children;
};

const routes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: (
      <AuthRoute>
        <Login />
      </AuthRoute>
    )
  },
  {
    path: '/signup',
    element: (
      <AuthRoute>
        <Signup />
      </AuthRoute>
    )
  },
  {
    path: '/driver/dashboard',
    element: <ProtectedRoute requiredRole="driver"><DriverDashboard /></ProtectedRoute>
  },
  {
    path: '/rider/dashboard',
    element: <ProtectedRoute><RiderDashboard /></ProtectedRoute>
  },
];

export default routes;