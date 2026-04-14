import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { User } from '../App';

interface ProtectedRouteProps {
  user: User | null;
  children: ReactNode;
}

export function ProtectedRoute({ user, children }: ProtectedRouteProps): ReactNode {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}





