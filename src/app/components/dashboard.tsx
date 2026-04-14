import { User } from '../App';
import { CustomerPortal } from './customer-portal';
import { MechanicPortal } from './mechanic-portal';
import { AdminPortal } from './admin-portal';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export function Dashboard({ user, onLogout }: DashboardProps) {
  console.log('🎯 Dashboard - User role:', user.role, 'User:', user);
  switch (user.role) {
    case 'customer':
      console.log('✅ Loading CUSTOMER portal');
      return <CustomerPortal user={user} onLogout={onLogout} />;
    case 'mechanic':
      console.log('✅ Loading MECHANIC portal');
      return <MechanicPortal user={user} onLogout={onLogout} />;
    case 'admin':
      console.log('✅ Loading ADMIN portal');
      return <AdminPortal user={user} onLogout={onLogout} />;
    default:
      console.warn('⚠️ Unknown role:', user.role);
      return null;
  }
}





