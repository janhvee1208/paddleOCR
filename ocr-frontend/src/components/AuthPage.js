import React, { useState } from 'react';
import './AuthPage.css';

const API = 'http://127.0.0.1:5000';
export const SESSION_KEY = 'mediscan_session';

/* ─────────────────────────────────────────────
   Floating background pills (decorative)
───────────────────────────────────────────── */
function FloatingPills() {
  const pills = [
    { icon: '💊', style: { top: '8%',    left: '6%',   animationDelay: '0s',   animationDuration: '7s'   } },
    { icon: '🩺', style: { top: '18%',   right: '8%',  animationDelay: '1.5s', animationDuration: '9s'   } },
    { icon: '🔬', style: { bottom: '20%',left: '4%',   animationDelay: '3s',   animationDuration: '8s'   } },
    { icon: '📋', style: { bottom: '10%',right: '6%',  animationDelay: '0.8s', animationDuration: '6s'   } },
    { icon: '🧬', style: { top: '42%',   left: '2%',   animationDelay: '2s',   animationDuration: '10s'  } },
    { icon: '💉', style: { top: '55%',   right: '3%',  animationDelay: '4s',   animationDuration: '7.5s' } },
  ];
  return (
    <>
      {pills.map((p, i) => (
        <div key={i} className="auth-pill" style={p.style}>{p.icon}</div>
      ))}
    </>
  );
}

/* ─────────────────────────────────────────────
   Input Field
───────────────────────────────────────────── */
function InputField({ label, type, value, onChange, placeholder, icon, error }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className={`auth-field ${error ? 'has-error' : ''}`}>
      <label className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        <span className="auth-input-icon">{icon}</span>
        <input
          className="auth-input"
          type={isPassword && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="off"
        />
        {isPassword && (
          <button type="button" className="auth-eye" onClick={() => setShow(!show)} tabIndex={-1}>
            {show ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {error && <p className="auth-field-error">⚠ {error}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Login Form  →  POST /login
───────────────────────────────────────────── */
function LoginForm({ onLogin, onSwitch }) {
  const [form, setForm]             = useState({ email: '', password: '' });
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [globalError, setGlobalError] = useState('');

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: '' });
    setGlobalError('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())              e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)                  e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setGlobalError('');

    try {
      const res  = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.email.trim().toLowerCase(), password: form.password }),
      });
      const data = await res.json();

      if (data.success) {
        // Persist session to localStorage
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        // Map backend error to the right field
        if (data.error?.toLowerCase().includes('email') || data.error?.toLowerCase().includes('account')) {
          setGlobalError(data.error);
        } else if (data.error?.toLowerCase().includes('password') || data.error?.toLowerCase().includes('incorrect')) {
          setErrors({ password: data.error });
        } else {
          setGlobalError(data.error || 'Login failed. Please try again.');
        }
      }
    } catch {
      setGlobalError('Cannot reach server. Make sure Flask is running on port 5000.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-header">
        <div className="auth-brand">
          <div className="auth-brand-icon">💊</div>
          <span className="auth-brand-name">Medi<span>Scan</span> Pro</span>
        </div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to access your prescription history</p>
      </div>

      {globalError && (
        <div className="auth-global-error"><span>⚠</span> {globalError}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <InputField label="Email Address" type="email"    value={form.email}    onChange={set('email')}    placeholder="you@example.com"      icon="✉️" error={errors.email}    />
        <InputField label="Password"      type="password" value={form.password} onChange={set('password')} placeholder="Enter your password"   icon="🔑" error={errors.password} />

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Signing in…</> : <>Sign In <span className="auth-arrow">→</span></>}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>
      <p className="auth-switch">
        Don't have an account?{' '}
        <button className="auth-switch-btn" onClick={onSwitch}>Create one free</button>
      </p>
      <div className="auth-trust-row">
        <span className="auth-trust-item"><span>🔒</span> PostgreSQL Backed</span>
        <span className="auth-trust-dot" />
        <span className="auth-trust-item"><span>🛡️</span> Passwords Hashed</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Signup Form  →  POST /register
───────────────────────────────────────────── */
function SignupForm({ onLogin, onSwitch }) {
  const [form, setForm]             = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]         = useState({});
  const [loading, setLoading]       = useState(false);
  const [globalError, setGlobalError] = useState('');

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setErrors({ ...errors, [key]: '' });
    setGlobalError('');
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                            e.name     = 'Full name is required';
    if (!form.email.trim())                           e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))       e.email    = 'Enter a valid email';
    if (!form.password)                               e.password = 'Password is required';
    else if (form.password.length < 6)                e.password = 'Password must be at least 6 characters';
    if (!form.confirm)                                e.confirm  = 'Please confirm your password';
    else if (form.confirm !== form.password)          e.confirm  = 'Passwords do not match';
    return e;
  };

  const getStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)                                          return { level: 1, label: 'Weak',   color: '#e05555' };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { level: 2, label: 'Fair',   color: '#ffb347' };
    return                                                            { level: 3, label: 'Strong', color: '#00cec9' };
  };
  const strength = getStrength();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setGlobalError('');

    try {
      const res  = await fetch(`${API}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();

      if (data.success) {
        // Auto-login after signup
        localStorage.setItem(SESSION_KEY, JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        if (data.error?.toLowerCase().includes('already exists') || res.status === 409) {
          setGlobalError('An account with this email already exists. Please sign in.');
        } else {
          setGlobalError(data.error || 'Registration failed. Please try again.');
        }
      }
    } catch {
      setGlobalError('Cannot reach server. Make sure Flask is running on port 5000.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-form-wrap">
      <div className="auth-form-header">
        <div className="auth-brand">
          <div className="auth-brand-icon">💊</div>
          <span className="auth-brand-name">Medi<span>Scan</span> Pro</span>
        </div>
        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">Start scanning with your personal history saved to database</p>
      </div>

      {globalError && (
        <div className="auth-global-error"><span>⚠</span> {globalError}</div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <InputField label="Full Name"        type="text"     value={form.name}     onChange={set('name')}     placeholder="Dr. / Patient Name"    error={errors.name}     />
        <InputField label="Email Address"    type="email"    value={form.email}    onChange={set('email')}    placeholder="you@example.com"       error={errors.email}    />
        <InputField label="Password"         type="password" value={form.password} onChange={set('password')} placeholder="Min. 6 characters"     error={errors.password} />

        {strength && (
          <div className="pwd-strength">
            <div className="pwd-bars">
              {[1, 2, 3].map((n) => (
                <div key={n} className="pwd-bar"
                  style={{ background: n <= strength.level ? strength.color : 'var(--surface-2)' }} />
              ))}
            </div>
            <span className="pwd-label" style={{ color: strength.color }}>{strength.label}</span>
          </div>
        )}

        <InputField label="Confirm Password" type="password" value={form.confirm}  onChange={set('confirm')}  placeholder="Re-enter your password" icon="🔐" error={errors.confirm}  />

        <button className="auth-submit-btn" type="submit" disabled={loading}>
          {loading ? <><span className="auth-spinner" /> Creating account…</> : <>Create Account <span className="auth-arrow">→</span></>}
        </button>
      </form>

      <div className="auth-divider"><span>or</span></div>
      <p className="auth-switch">
        Already have an account?{' '}
        <button className="auth-switch-btn" onClick={onSwitch}>Sign in instead</button>
      </p>
      <div className="auth-trust-row">
        <span className="auth-trust-item"><span>🔒</span> PostgreSQL Backed</span>
        <span className="auth-trust-dot" />
        <span className="auth-trust-item"><span>🛡️</span> Passwords Hashed</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main AuthPage Export
───────────────────────────────────────────── */
export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');

  return (
    <div className="auth-page">
      <FloatingPills />

      {/* Left branding panel */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <div className="auth-left-brand">
            <div className="auth-left-icon">💊</div>
            <span className="auth-left-name">Medi<span>Scan</span> Pro</span>
          </div>
          <h2 className="auth-left-heading">
            Your personal<br />prescription<br />
            <span className="auth-left-accent">intelligence</span>
          </h2>
          <p className="auth-left-sub">
            Decode handwritten prescriptions, track your medication history,
            and understand exactly what you've been prescribed — stored securely in PostgreSQL.
          </p>
          <div className="auth-left-features">
            {[
              { text: 'AI-powered OCR scanning'       },
              {  text: '300+ verified medications'      },
              {  text: 'Per-user history in PostgreSQL' },
              {  text: 'Salted & hashed passwords'      },
            ].map((f) => (
              <div key={f.text} className="auth-left-feature">
                <span className="alf-icon">{f.icon}</span>
                <span className="alf-text">{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
      </div>

      {/* Right form panel */}
      <div className="auth-right">
        <div className="auth-right-inner">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login'  ? 'active' : ''}`} onClick={() => setMode('login')}>Sign In</button>
            <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>
            <div className={`auth-tab-slider ${mode === 'signup' ? 'right' : 'left'}`} />
          </div>

          <div className="auth-form-container" key={mode}>
            {mode === 'login'
              ? <LoginForm  onLogin={onLogin} onSwitch={() => setMode('signup')} />
              : <SignupForm onLogin={onLogin} onSwitch={() => setMode('login')}  />
            }
          </div>
        </div>
      </div>
    </div>
  );
}