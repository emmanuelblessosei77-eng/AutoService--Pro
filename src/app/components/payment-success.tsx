import { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader } from 'lucide-react';
import { clearCache } from '../../services/api';
import { payments as apiPayments } from '../../services/api';
import { Header } from './header';
import { useTheme } from '../contexts/ThemeContext';

// Hard redirect that always works regardless of React Router state
const redirectToDashboard = (forceRefresh = false) => {
  const url = forceRefresh ? '/dashboard?forceRefresh=1' : '/dashboard';
  console.log(`🚀 Hard redirect to ${url}`);
  window.location.replace(url);
};

export function PaymentSuccess() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Safety net: always redirect within 12 seconds no matter what
    const safetyTimer = setTimeout(() => {
      console.warn('⚠️ Safety timeout reached — forcing redirect to dashboard');
      redirectToDashboard(false);
    }, 12000);

    const verifyAndRedirect = async () => {
      try {
        const reference = searchParams.get('reference');

        if (!reference) {
          console.error('❌ No payment reference in URL');
          clearTimeout(safetyTimer);
          redirectToDashboard(false);
          return;
        }

        // Prevent processing the same payment twice (handles React strict mode double render)
        const processedKey = `processed_payment_${reference}`;
        if (sessionStorage.getItem(processedKey)) {
          console.log(`⏭️  Payment ${reference} already processed, redirecting to dashboard`);
          clearTimeout(safetyTimer);
          redirectToDashboard(true);
          return;
        }

        if (hasProcessedRef.current) {
          console.log(`⏭️  Payment processing already in progress, skipping...`);
          return;
        }

        hasProcessedRef.current = true;
        sessionStorage.setItem(processedKey, 'true');

        console.log(`🔍 Verifying payment: ${reference}`);

        // Verify payment with backend via POST /payments/verify (10s timeout)
        // Backend handles confirmation email — no frontend email sending needed
        const verification = await Promise.race([
          apiPayments.verify(reference),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Verify request timed out after 10s')), 10000)
          ),
        ]);

        if (!verification || (!verification.success && !verification.verified && !verification.booking_id)) {
          console.error('❌ Payment not verified:', verification);
          clearTimeout(safetyTimer);
          redirectToDashboard(false);
          return;
        }

        console.log('✅ Payment verified:', verification);

        // Clear caches so dashboard shows updated booking
        const currentUserStr = localStorage.getItem('currentUser');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
        if (currentUser?.id) {
          clearCache(`/bookings/user/${currentUser.id}`);
          localStorage.removeItem(`dashboard_${currentUser.id}`);
        }

        // Clean up session storage
        sessionStorage.removeItem('pendingBookingId');
        sessionStorage.removeItem('paymentReference');
        sessionStorage.removeItem('bookingDetails');

        clearTimeout(safetyTimer);
        redirectToDashboard(true);
      } catch (error) {
        console.error('❌ Payment verification failed:', error);
        clearTimeout(safetyTimer);
        redirectToDashboard(false);
      }
    };

    verifyAndRedirect();

    return () => clearTimeout(safetyTimer);
  }, [searchParams, navigate]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-gray-50'}`}>
      <Header />
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center space-y-4">
          <Loader className={`h-12 w-12 animate-spin mx-auto ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Processing Payment</h2>
          <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>Please wait while we verify your payment...</p>
        </div>
      </div>
    </div>
  );
}
