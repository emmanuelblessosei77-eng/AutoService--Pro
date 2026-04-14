import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader, CheckCircle, AlertCircle, Mail } from 'lucide-react';
import { auth } from '../../services/api';
import { Header } from './header';
import { useTheme } from '../contexts/ThemeContext';

export function VerifyEmail() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'waiting'>('waiting');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        // No token in URL, show waiting message
        setStatus('waiting');
        return;
      }

      // Token found in URL, try to verify
      setStatus('verifying');
      setMessage('Verifying your email...');

      try {
        const result = await auth.verifyEmail(token);

        if (result.success && result.data?.token) {
          console.log('✅ Email verified successfully');
          
          // Store token and user info
          localStorage.setItem('authToken', result.data.token);
          localStorage.setItem('currentUser', JSON.stringify(result.data.user));

          setStatus('success');
          setMessage('🎉 Email verified successfully! Redirecting to dashboard...');

          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        } else {
          throw new Error(result.error || 'Verification failed');
        }
      } catch (err: any) {
        console.error('❌ Verification error:', err);
        setStatus('error');
        setError(err.message || 'Failed to verify email');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    if (!resendEmail) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await auth.resendVerificationEmail(resendEmail);
      
      if (response.success) {
        setResendSuccess(true);
        setError('');
        console.log('✅ Verification email resent successfully');
        
        // Show success message for 5 seconds
        setTimeout(() => {
          setResendSuccess(false);
        }, 5000);
      } else {
        setError(response.error || 'Failed to resend email');
      }
    } catch (err: any) {
      console.error('❌ Resend error:', err);
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const pageBg = isDark ? 'bg-[#10141c]' : 'bg-gray-50';
  const cardCls = isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-gray-200';

  if (status === 'verifying') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className={`border rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center ${cardCls}`}>
            <Loader className={`h-12 w-12 animate-spin mx-auto mb-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Verifying Email</h2>
            <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>{message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className={`border rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center ${cardCls}`}>
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Email Verified!</h2>
            <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>{message}</p>
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>You'll be redirected shortly...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
        <Header />
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div className={`border rounded-lg shadow-lg p-8 max-w-md w-full mx-4 ${cardCls}`}>
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className={`text-2xl font-semibold mb-2 text-center ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
              Verification Failed
            </h2>
            <p className="text-red-500 mb-6 text-center font-medium">{error}</p>
            <div className="space-y-3">
              <p className={`text-sm text-center ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                Try checking your email again or contact support if the problem persists.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2 rounded-lg transition font-medium bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // status === 'waiting' - Show instruction to check email
  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageBg}`}>
      <Header />
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className={`border rounded-lg shadow-xl p-8 max-w-md w-full mx-4 ${cardCls}`}>
          <div className="flex justify-center mb-6">
            <Mail className={`h-16 w-16 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
          </div>
          <h2 className={`text-3xl font-bold mb-2 text-center ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
            Verify Your Email
          </h2>
          <p className={`text-center mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            We've sent you a verification email. Please check your inbox and click the link to verify your account.
          </p>

          <div className={`border-l-4 border-blue-400 p-4 rounded-r mb-6 ${isDark ? 'bg-cyan-500/10' : 'bg-blue-50'}`}>
            <p className={`text-sm ${isDark ? 'text-cyan-200' : 'text-blue-700'}`}>
              <span className="font-semibold">💡 Tip:</span> If you don't see the email, check your spam or junk folder.
            </p>
          </div>

          <div className="text-center mb-4">
            <p className={`text-xs mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Verification link expires in 1 hour</p>
          </div>

          {/* Resend Email Section */}
          <div className={`border p-4 rounded-lg mb-6 ${isDark ? 'bg-amber-500/10 border-amber-400/30' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>Didn't receive the email?</p>
            {resendSuccess && (
              <p className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded mb-3 border border-emerald-200">
                ✅ Verification email resent! Check your inbox.
              </p>
            )}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                disabled={isResending}
                className={`flex-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 ${isDark ? 'border-amber-400/40 bg-slate-800 text-slate-100 disabled:bg-slate-800/60' : 'border-amber-300 bg-white text-gray-900 disabled:bg-gray-100'}`}
              />
              <button
                onClick={handleResendEmail}
                disabled={isResending || !resendEmail}
                className="px-4 py-2 bg-amber-500 text-white rounded text-sm hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isResending ? 'Sending...' : 'Resend'}
              </button>
            </div>
            {error && resendEmail && (
              <p className="text-sm text-red-500 mt-2">{error}</p>
            )}
          </div>

          <button
            onClick={() => navigate('/login')}
            className={`w-full py-2 rounded-lg transition font-medium ${isDark ? 'bg-slate-700 text-slate-100 hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
