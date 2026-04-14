import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, UserRole } from '../App';
import { auth as apiAuth } from '../../services/api';
import Swal from 'sweetalert2';
import { Eye, EyeOff } from 'lucide-react';
import BrandLogo from './BrandLogo';


interface RegisterPageProps {
  onRegister: (user: User) => void;
}

export function RegisterPage({ onRegister }: RegisterPageProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as UserRole,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Split full name into first and last name
      const nameParts = formData.name.trim().split(' ');
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || '';

      const response = await apiAuth.register({
        first_name: first_name,
        last_name: last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      if (response.success === false) {
        setError(response.error || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Check if email verification is required
      if (response.data?.requiresEmailVerification) {
        // For new customers, redirect to email verification page
        await Swal.fire({
          icon: 'success',
          title: 'Account Created!',
          html: '<p style="color: #666; font-size: 16px; line-height: 1.6;">Your account has been created successfully.</p><p style="color: #666; font-size: 16px; line-height: 1.6;"><strong>Check your email inbox</strong> for the verification link.</p><p style="color: #999; font-size: 14px; margin-top: 10px;">Click the link in the email to verify your account.</p>',
          confirmButtonText: 'Got it!',
          confirmButtonColor: '#3085d6',
          allowOutsideClick: false,
          allowEscapeKey: false
        });
        navigate('/verify-email');
      } else if (response.data?.token && response.data?.user) {
        // For other roles (mechanics, admins), auto-login
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        onRegister?.(response.data.user);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please check your information and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1.5rem 0.75rem', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ background: 'rgba(15,23,42,0.9)', border: '1px solid rgba(148,163,184,0.18)', borderRadius: '18px', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', padding: 'clamp(1rem, 4vw, 2rem)', width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.9rem' }}>
          <BrandLogo size={62} darkMode className="drop-shadow-[0_0_10px_rgba(0,174,239,0.2)]" />
        </div>

        <h2 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.75rem)', color: '#22d3ee', fontWeight: 600, letterSpacing: '-1px', position: 'relative', display: 'flex', alignItems: 'center', paddingLeft: '30px', marginBottom: '6px' }}>
          <span style={{ position: 'absolute', left: 0, width: '18px', height: '18px', borderRadius: '50%', background: '#22d3ee' }} />
          <span style={{ position: 'absolute', left: 0, width: '18px', height: '18px', borderRadius: '50%', background: '#22d3ee', animation: 'pulse 1s linear infinite' }} />
          Create account
        </h2>
        <p style={{ color: 'rgba(148,163,184,0.9)', fontSize: '14px', marginBottom: '1.5rem' }}>
          Sign up to access your dashboard and services
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ position: 'relative', display: 'block' }}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder=" "
              required
              style={{ width: '100%', padding: '14px 10px 6px 10px', outline: 'none', border: '1.5px solid rgba(100,116,139,0.55)', background: 'rgba(15,23,42,0.7)', color: '#f1f5f9', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
            />
            <span className="float-label">Full name</span>
          </label>

          <label style={{ position: 'relative', display: 'block' }}>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder=" "
              required
              style={{ width: '100%', padding: '14px 10px 6px 10px', outline: 'none', border: '1.5px solid rgba(100,116,139,0.55)', background: 'rgba(15,23,42,0.7)', color: '#f1f5f9', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
            />
            <span className="float-label">Email address</span>
          </label>

          <label style={{ position: 'relative', display: 'block' }}>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder=" "
              required
              style={{ width: '100%', padding: '14px 10px 6px 10px', outline: 'none', border: '1.5px solid rgba(100,116,139,0.55)', background: 'rgba(15,23,42,0.7)', color: '#f1f5f9', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
            />
            <span className="float-label">Phone number</span>
          </label>

          <label style={{ position: 'relative', display: 'block' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder=" "
              required
              style={{ width: '100%', padding: '14px 38px 6px 10px', outline: 'none', border: '1.5px solid rgba(100,116,139,0.55)', background: 'rgba(15,23,42,0.7)', color: '#f1f5f9', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
            />
            <span className="float-label">Password</span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </label>

          <label style={{ position: 'relative', display: 'block' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder=" "
              required
              style={{ width: '100%', padding: '14px 38px 6px 10px', outline: 'none', border: '1.5px solid rgba(100,116,139,0.55)', background: 'rgba(15,23,42,0.7)', color: '#f1f5f9', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', transition: 'border-color 0.3s' }}
              onFocus={e => (e.currentTarget.style.borderColor = '#22d3ee')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
            />
            <span className="float-label">Confirm password</span>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              aria-label="Toggle confirm password visibility"
            >
              {showConfirmPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
            </button>
          </label>

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
            {isLoading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ color: 'rgba(148,163,184,0.9)', fontSize: '14px', textAlign: 'center', marginTop: '1rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#22d3ee', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
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

// Legacy styled-components CSS (kept for reference only)
const _unusedStyledWrapper = `_placeholder
  .page-container {
    min-height: 100vh;
    background: linear-gradient(135deg, rgb(219, 234, 254) 0%, rgb(224, 242, 254) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 450px;
    width: 100%;
    background-color: #fff;
    padding: 30px 20px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  }

  .title {
    font-size: 28px;
    color: royalblue;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
    margin-bottom: 5px;
  }

  .title::before,
  .title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background-color: royalblue;
  }

  .title::before {
    width: 18px;
    height: 18px;
    background-color: royalblue;
  }

  .title::after {
    width: 18px;
    height: 18px;
    animation: pulse 1s linear infinite;
  }

  .message {
    color: rgba(88, 87, 87, 0.822);
    font-size: 14px;
    margin-bottom: 10px;
  }

  .signin {
    color: rgba(88, 87, 87, 0.822);
    font-size: 14px;
    text-align: center;
    margin-top: 15px;
  }

  .link {
    color: royalblue;
    text-decoration: none;
    font-weight: 600;
  }

  .link:hover {
    text-decoration: underline;
  }

  .error-message {
    padding: 12px;
    background-color: #fee2e2;
    border: 1px solid #fca5a5;
    color: #991b1b;
    border-radius: 8px;
    font-size: 14px;
    margin: 5px 0;
  }

  .form label {
    position: relative;
  }

  .form label .input {
    width: 100%;
    padding: 14px 10px 20px 10px;
    outline: 0;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
    font-size: 14px;
    transition: border-color 0.3s ease;
  }

  .form label .input:hover {
    border-color: #bfdbfe;
    background-color: #fff;
  }

  .form label .input:focus {
    border-color: royalblue;
    border-width: 2px;
  }

  .form label .input + span {
    position: absolute;
    left: 10px;
    top: 17px;
    color: grey;
    font-size: 0.9em;
    cursor: text;
    transition: 0.3s ease;
    pointer-events: none;
  }

  .form label .input:placeholder-shown + span {
    top: 17px;
    font-size: 0.9em;
  }

  .form label .input:focus + span,
  .form label .input:valid + span {
    top: 0px;
    font-size: 0.7em;
    font-weight: 600;
    color: royalblue;
  }

  .form label .input:valid + span {
    color: green;
  }

  .toggle-password {
    position: absolute;
    right: 10px;
    top: 15px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
    opacity: 0.6;
    transition: opacity 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toggle-password:hover {
    opacity: 1;
  }

  .submit {
    border: none;
    outline: none;
    background-color: royalblue;
    padding: 12px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 10px;
  }

  .submit:hover:not(:disabled) {
    background-color: rgb(56, 90, 194);
  }

  .submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .back-to-home {
    background-color: #f0f0f0;
    color: #333;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 8px;
    width: 100%;

    &:hover {
      background-color: #e0e0e0;
      transform: translateX(-5px);
    }

    &:active {
      transform: translateX(-3px);
    }
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
      opacity: 1;
    }

    to {
      transform: scale(1.8);
      opacity: 0;
    }
  }
`;

export default RegisterPage;





