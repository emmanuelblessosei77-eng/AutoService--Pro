import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth as apiAuth } from '../../services/api';
import BrandLogo from './BrandLogo';

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

  const mapUserRole = (email: string, user: any) => {
    const roleMap: { [key: string]: string } = {
      'admin@example.com': 'admin',
      'john@example.com': 'mechanic',
      'mmn@gmail.com': 'customer',
    };
    return { ...user, role: roleMap[email] || user.role };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await apiAuth.login(email, password);
      if (response.requiresEmailVerification) {
        setError('Please verify your email before logging in. Check your inbox.');
        setTimeout(() => navigate('/verify-email'), 2000);
      } else if (response.error || response.success === false) {
        setError(response.error || 'Login failed. Please check your credentials.');
      } else if (response.token && response.user) {
        localStorage.setItem('authToken', response.token);
        const finalUser = mapUserRole(email, response.user);
        localStorage.setItem('currentUser', JSON.stringify(finalUser));
        onLogin(finalUser);
        navigate('/dashboard');
      } else {
        setError('Login failed. Invalid response from server.');
      }
    } catch (error: any) {
      setError(`Login failed: ${error.message || error.toString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    try {
      setForgotMessage(`Password reset link sent to ${forgotEmail}. Check your email.`);
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail('');
        setForgotMessage('');
      }, 3000);
    } catch {
      setForgotMessage('Error sending reset link. Please try again.');
    }
  };

  if (showForgotPassword) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 0.75rem', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: '18px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', padding: 'clamp(1rem, 4vw, 2rem)', width: '100%', maxWidth: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <BrandLogo size={58} darkMode className="drop-shadow-[0_0_10px_rgba(0,174,239,0.2)]" />
            </div>
            <button
              onClick={() => setShowForgotPassword(false)}
              style={{ background: 'none', border: 'none', color: '#22d3ee', cursor: 'pointer', marginBottom: '1rem', fontSize: '14px', fontWeight: 600 }}
            >
              ← Back to Login
            </button>
            <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', color: '#22d3ee', fontWeight: 600, letterSpacing: '-1px', marginBottom: '0.5rem' }}>
              Reset Password
            </h2>
            <p style={{ color: 'rgba(148,163,184,0.9)', fontSize: '14px', marginBottom: '1.5rem' }}>
              Enter your email to receive a reset link
            </p>
            <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ position: 'relative', display: 'block' }}>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder=" "
                  required
                  style={{ width: '100%', padding: '14px 10px 6px 10px', outline: 'none', border: '1.5px solid rgba(100,116,139,0.55)', background: 'rgba(15,23,42,0.7)', color: '#f1f5f9', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9em', pointerEvents: 'none', transition: '0.3s ease' }}>
                  Email address
                </span>
              </label>
              {forgotMessage && (
                <p style={{ fontSize: '13px', padding: '10px', borderRadius: '8px', background: forgotMessage.includes('Error') ? '#fee2e2' : '#dcfce7', color: forgotMessage.includes('Error') ? '#991b1b' : '#166534' }}>
                  {forgotMessage}
                </p>
              )}
              <button
                type="submit"
                style={{ background: '#22d3ee', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.3s' }}
                onMouseOver={e => (e.currentTarget.style.background = '#67e8f9')}
                onMouseOut={e => (e.currentTarget.style.background = '#22d3ee')}
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 0.75rem', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: '18px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', padding: 'clamp(1rem, 4vw, 2rem)', width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.9rem' }}>
          <BrandLogo size={62} darkMode className="drop-shadow-[0_0_10px_rgba(0,174,239,0.2)]" />
        </div>

        {/* Animated title */}
        <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.75rem)', color: '#22d3ee', fontWeight: 600, letterSpacing: '-1px', position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: '30px', marginBottom: '6px' }}>
          <span style={{ position: 'absolute', left: 0, width: '18px', height: '18px', borderRadius: '50%', background: '#22d3ee' }} />
          <span style={{ position: 'absolute', left: 0, width: '18px', height: '18px', borderRadius: '50%', background: '#22d3ee', animation: 'pulse 1s linear infinite' }} />
          Welcome back
        </h2>
        <p style={{ color: 'rgba(148,163,184,0.9)', fontSize: '14px', marginBottom: '1.5rem' }}>
          Sign in to access your account
        </p>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Email */}
          <label style={{ position: 'relative', display: 'block' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              style={{ width: '100%', padding: '14px 10px 6px 10px', outline: 'none', border: '1.5px solid rgba(100,116,139,0.55)', background: 'rgba(15,23,42,0.7)', color: '#f1f5f9', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
            />
            <span className="float-label">Email address</span>
          </label>

          {/* Password */}
          <label style={{ position: 'relative', display: 'block' }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              required
              style={{ width: '100%', padding: '14px 10px 6px 10px', outline: 'none', border: '1.5px solid rgba(100,116,139,0.55)', background: 'rgba(15,23,42,0.7)', color: '#f1f5f9', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
            />
            <span className="float-label">Password</span>
          </label>

          <div style={{ textAlign: 'right', marginTop: '-4px' }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{ background: 'none', border: 'none', color: '#22d3ee', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
            >
              Forgot password?
            </button>
          </div>

          {error && (
            <div style={{ padding: '10px 12px', background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', borderRadius: '8px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{ background: isLoading ? '#155e75' : '#22d3ee', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '16px', fontWeight: 700, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '6px', transition: 'background 0.3s' }}
            onMouseOver={e => { if (!isLoading) e.currentTarget.style.background = '#67e8f9'; }}
            onMouseOut={e => { if (!isLoading) e.currentTarget.style.background = '#22d3ee'; }}
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ color: 'rgba(148,163,184,0.9)', fontSize: '14px', textAlign: 'center', marginTop: '1rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#22d3ee', fontWeight: 600, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>

        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ marginTop: '10px', width: '100%', background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}
          onMouseOver={e => (e.currentTarget.style.background = '#334155')}
          onMouseOut={e => (e.currentTarget.style.background = '#1e293b')}
        >
          Back to Home
        </button>
      </div>
      </main>

      <style>{`
        @keyframes pulse {
          from { transform: scale(0.9); opacity: 1; }
          to   { transform: scale(1.8); opacity: 0; }
        }
        .float-label {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.9em;
          cursor: text;
          transition: 0.3s ease;
          pointer-events: none;
        }
        input:focus + .float-label,
        input:not(:placeholder-shown) + .float-label {
          top: 8px;
          transform: none;
          font-size: 0.7em;
          font-weight: 600;
          color: #22d3ee;
        }
        input:not(:focus):not(:placeholder-shown) + .float-label {
          color: #22c55e;
        }
        @media (max-width: 480px) {
          input { font-size: 16px !important; }
        }
      `}</style>
    </div>
  );
}

export default LoginScreen;
