import { useAuthStore } from '../store/auth';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
