import React, { useState } from 'react';
import { 
  Code2, Mail, Lock, User, ArrowRight, Eye, EyeOff, 
  CheckCircle2, AlertCircle, ArrowLeft, Shield 
} from 'lucide-react';
import api from '../api';
import DnaTechBackground from './DnaTechBackground';

export default function AuthPage({ initialMode = 'login', onAuthSuccess, onBackHome }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'register') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password: password
        });
        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 800);
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Failed to create account.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login
      if (!email.trim() || !password) {
        setError('Please enter both email and password.');
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.login({
          email: email.trim(),
          password: password
        });
        setSuccessMsg('Welcome back! Logging you in...');
        setTimeout(() => {
          onAuthSuccess(res.user);
        }, 800);
      } catch (err) {
        const msg = err.response?.data?.detail || err.message || 'Invalid email or password.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: 'calc(100vh - 58px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(24px, 4vw, 40px) 16px',
      overflow: 'hidden'
    }}>
      {/* Live 3D Multicolor DNA Tech Background Animation */}
      <DnaTechBackground opacity={0.88} diagonal={false} glow={true} />

      {/* Main Centered Auth Card */}
      <div className="card-solid" style={{
        width: '100%',
        maxWidth: 440,
        padding: 'clamp(28px, 5vw, 40px) clamp(20px, 4vw, 34px)',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}>
        {/* Back navigation */}
        <button
          onClick={onBackHome}
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        {/* Brand Icon & Heading */}
        <div style={{ textAlign: 'center', marginTop: 12, marginBottom: 28 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Code2 size={24} />
          </div>

          <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>
            {mode === 'login' 
              ? 'Sign in to access your saved audits and career metrics' 
              : 'Join Devlyzer AI to save profile evaluations and track progress'}
          </p>
        </div>

        {/* Tab Toggle: Sign In vs Register */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: 'var(--bg-subtle)',
          padding: 4,
          borderRadius: 10,
          border: '1px solid var(--border-subtle)',
          marginBottom: 24
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: 7,
              border: mode === 'login' ? '1px solid var(--border-medium)' : '1px solid transparent',
              background: mode === 'login' ? 'var(--card-bg)' : 'transparent',
              color: mode === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: mode === 'login' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: mode === 'login' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
            style={{
              padding: '8px 12px',
              borderRadius: 7,
              border: mode === 'register' ? '1px solid var(--border-medium)' : '1px solid transparent',
              background: mode === 'register' ? 'var(--card-bg)' : 'transparent',
              color: mode === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: mode === 'register' ? 700 : 500,
              fontSize: '0.84rem',
              cursor: 'pointer',
              boxShadow: mode === 'register' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Register
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div style={{
            background: 'var(--rose-subtle)',
            border: '1px solid var(--rose-border)',
            color: 'var(--rose)',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18
          }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'var(--emerald-subtle)',
            border: '1px solid var(--emerald-border)',
            color: 'var(--emerald)',
            padding: '10px 14px',
            borderRadius: 8,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 18
          }}>
            <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="e.g. Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 8,
                    border: '1px solid var(--border-medium)',
                    background: 'var(--card-bg)',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: 8,
                  border: '1px solid var(--border-medium)',
                  background: 'var(--card-bg)',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 38px 10px 36px',
                  borderRadius: 8,
                  border: '1px solid var(--border-medium)',
                  background: 'var(--card-bg)',
                  fontSize: '0.88rem',
                  color: 'var(--text-main)',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 10,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 36px',
                    borderRadius: 8,
                    border: '1px solid var(--border-medium)',
                    background: 'var(--card-bg)',
                    fontSize: '0.88rem',
                    color: 'var(--text-main)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '0.92rem',
              fontWeight: 700,
              marginTop: 6
            }}
          >
            <span>{isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer switch */}
        <div style={{ textAlign: 'center', marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Create one here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Sign in here
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
