import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Lazy load route components for code splitting
const HomePage = lazy(() => import('./components/homepage').then(m => ({ default: m.Homepage })) as any);
const AboutPage = lazy(() => import('./components/about-page').then(m => ({ default: m.AboutPage })) as any);
const ServicesPage = lazy(() => import('./components/services-page').then(m => ({ default: m.ServicesPage })) as any);
const CarPartsMarketPage = lazy(() => import('./components/car-parts-market-clean').then(m => ({ default: m.CarPartsMarketPage })) as any);
const ShopPage = lazy(() => import('./components/shop-page').then(m => ({ default: m.ShopPage })) as any);
const ContactPage = lazy(() => import('./components/contact-page').then(m => ({ default: m.ContactPage })) as any);
const LoginScreen = lazy(() => import('./components/login-screen').then(m => ({ default: m.LoginScreen })) as any);
const RegisterPage = lazy(() => import('./components/register-page').then(m => ({ default: m.RegisterPage })) as any);
const Dashboard = lazy(() => import('./components/dashboard').then(m => ({ default: m.Dashboard })) as any);
const PaymentSuccess = lazy(() => import('./components/payment-success').then(m => ({ default: m.PaymentSuccess })) as any);
const VerifyEmail = lazy(() => import('./components/verify-email').then(m => ({ default: m.VerifyEmail })) as any);

import { ProtectedRoute } from './components/protected-route';
import { DashboardProvider } from './contexts/DashboardContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Loading fallback component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Define roles clearly
export type UserRole = 'customer' | 'mechanic' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Try to load user from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    return null;
  });

  // Ensure currentUser matches the active auth token (prevents stale user state)
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const decodeJwt = (jwt: string) => {
      try {
        const payload = jwt.split('.')[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
      } catch (e) {
        return null;
      }
    };

    const parsed = decodeJwt(token);
    if (!parsed || !parsed.id) return;

    const tokenUserId = String(parsed.id);
    if (!currentUser || currentUser.id !== tokenUserId) {
      console.log('🔄 Detected mismatch between stored user and auth token; updating currentUser');
      const normalized = {
        id: tokenUserId,
        name: parsed.name || `${parsed.first_name || ''} ${parsed.last_name || ''}`.trim(),
        email: parsed.email || '',
        role: parsed.role || 'customer',
      };
      localStorage.setItem('currentUser', JSON.stringify(normalized));
      setCurrentUser(normalized);
    }
  }, []);

  const handleLogin = (user: User) => {
    console.log('✅ User logged in:', user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    console.log('🔓 Logging out...');
    // Clear all auth and dashboard data
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    if (currentUser?.id) {
      localStorage.removeItem(`dashboard_${currentUser.id}`);
      localStorage.removeItem('vehicles_' + currentUser.id);
    }
    setCurrentUser(null);
    // Redirect to login page
    window.location.href = '/login';
  };

  // If no user is logged in, show public pages
  if (!currentUser) {
    return (
      <ThemeProvider defaultTheme="light">
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/parts" element={<CarPartsMarketPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/login" element={<LoginScreen onLogin={handleLogin} />} />
              <Route path="/register" element={<RegisterPage onRegister={handleLogin} />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/dashboard" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  // User is logged in, show protected dashboard
  return (
    <ThemeProvider defaultTheme="light">
      <DashboardProvider userId={currentUser.id} initialData={undefined}>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/parts" element={<CarPartsMarketPage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/login" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<Navigate to="/dashboard" replace />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute user={currentUser}>
                    <Dashboard user={currentUser} onLogout={handleLogout} />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </DashboardProvider>
    </ThemeProvider>
  );
}