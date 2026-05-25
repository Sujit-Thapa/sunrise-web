'use client';

import { useState, useEffect, useRef } from 'react';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset after brief confirmation
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setForm({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
    }, 1800);
  };

  const switchMode = (m: AuthMode) => {
    setMode(m);
    setForm({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
    setSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Sans:wght@300;400&display=swap');

        .auth-overlay {
          position: fixed;
          inset: 0;
          background: rgba(20, 17, 12, 0.6);
          backdrop-filter: blur(3px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: auth-fade-in 0.2s ease;
        }

        @keyframes auth-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes auth-slide-up {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .auth-modal {
          background: #F7F5F0;
          width: 100%;
          max-width: 460px;
          position: relative;
          animation: auth-slide-up 0.28s ease;
        }

        /* Top band */
        .auth-band {
          background: #1A1814;
          padding: 2rem 2.5rem 1.75rem;
        }

        .auth-brand {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.1rem;
          letter-spacing: 0.06em;
          color: #C8C0B0;
          margin-bottom: 1.25rem;
        }

        .auth-tabs {
          display: flex;
          gap: 0;
          border-bottom: 1px solid #2C2820;
        }

        .auth-tab {
          background: none;
          border: none;
          padding: 0.5rem 0;
          margin-right: 1.75rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.72rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #5A5448;
          cursor: pointer;
          border-bottom: 1.5px solid transparent;
          margin-bottom: -1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .auth-tab.active {
          color: #F0EBE0;
          border-bottom-color: #C8B898;
        }
        .auth-tab:hover:not(.active) { color: #9A9080; }

        /* Body */
        .auth-body {
          padding: 2.25rem 2.5rem 2.5rem;
        }

        .auth-headline {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.65rem;
          line-height: 1.15;
          color: #1A1814;
          margin: 0 0 0.4rem;
        }

        .auth-headline em {
          font-style: italic;
          color: #5C5040;
        }

        .auth-sub {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.82rem;
          color: #9A9080;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        /* Form */
        .auth-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
          margin-bottom: 0.85rem;
        }

        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          margin-bottom: 0.85rem;
        }

        .auth-label {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.6rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8A8070;
        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input {
          width: 100%;
          background: #fff;
          border: 1px solid #E0DAD0;
          padding: 0.8rem 0.9rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.88rem;
          color: #1A1814;
          outline: none;
          transition: border-color 0.2s;
          box-sizing: border-box;
        }

        .auth-input:focus { border-color: #8A8070; }
        .auth-input::placeholder { color: #C8C0B0; }

        .auth-input.has-toggle { padding-right: 2.8rem; }

        .auth-toggle-pass {
          position: absolute;
          right: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #B0A890;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .auth-toggle-pass:hover { color: #6E6455; }

        .auth-forgot {
          text-align: right;
          margin-top: -0.4rem;
          margin-bottom: 1.5rem;
        }
        .auth-forgot a {
          font-size: 0.72rem;
          color: #B0A890;
          text-decoration: none;
          letter-spacing: 0.04em;
          transition: color 0.2s;
        }
        .auth-forgot a:hover { color: #5C5040; }

        /* Submit */
        .auth-submit {
          width: 100%;
          background: #1A1814;
          color: #F7F5F0;
          border: none;
          padding: 1rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .auth-submit:hover { background: #3A3428; }
        .auth-submit.success { background: #3A5830; }

        /* Divider */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }
        .auth-divider-line { flex: 1; height: 1px; background: #E0DAD0; }
        .auth-divider-text { font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; color: #C0B8A8; white-space: nowrap; }

        /* Social buttons */
        .auth-socials { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .auth-social-btn {
          background: #fff;
          border: 1px solid #E0DAD0;
          padding: 0.75rem;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: 0.75rem;
          color: #5C5040;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          transition: background 0.2s, border-color 0.2s;
          letter-spacing: 0.04em;
        }
        .auth-social-btn:hover { background: #EFECE5; border-color: #C8C0B0; }

        /* Switch */
        .auth-switch {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.78rem;
          color: #9A9080;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
        }
        .auth-switch button {
          background: none;
          border: none;
          color: #1A1814;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
          padding: 0;
        }

        /* Close button */
        .auth-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: none;
          border: none;
          color: #5A5448;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .auth-close:hover { color: #C8C0B0; }

        /* Terms */
        .auth-terms {
          font-size: 0.68rem;
          color: #C0B8A8;
          text-align: center;
          margin-top: 1rem;
          line-height: 1.6;
        }
        .auth-terms a { color: #8A8070; text-decoration: none; }
        .auth-terms a:hover { text-decoration: underline; }

        @media (max-width: 500px) {
          .auth-modal { max-width: 100%; }
          .auth-band, .auth-body { padding-left: 1.5rem; padding-right: 1.5rem; }
          .auth-form-row { grid-template-columns: 1fr; }
          .auth-socials { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="auth-overlay"
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Sign in' : 'Create account'}
      >
        <div className="auth-modal">

          {/* Close */}
          <button className="auth-close" onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Top band */}
          <div className="auth-band">
            <p className="auth-brand">Sunrise Realty</p>
            <div className="auth-tabs">
              <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => switchMode('login')}>Sign In</button>
              <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => switchMode('signup')}>Create Account</button>
            </div>
          </div>

          {/* Body */}
          <div className="auth-body">
            {mode === 'login' ? (
              <>
                <h2 className="auth-headline">Welcome <em>back.</em></h2>
                <p className="auth-sub">Sign in to access your saved properties and bookings.</p>
              </>
            ) : (
              <>
                <h2 className="auth-headline">Join <em>Sunrise Realty.</em></h2>
                <p className="auth-sub">Create a free account to list, book, and save properties.</p>
              </>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="auth-form-row">
                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">First Name</label>
                    <input className="auth-input" name="firstName" placeholder="Jane" value={form.firstName} onChange={handleChange} required />
                  </div>
                  <div className="auth-field" style={{ marginBottom: 0 }}>
                    <label className="auth-label">Last Name</label>
                    <input className="auth-input" name="lastName" placeholder="Smith" value={form.lastName} onChange={handleChange} required />
                  </div>
                </div>
              )}
              {mode === 'signup' && <div style={{ marginBottom: '0.85rem' }} />}

              <div className="auth-field">
                <label className="auth-label">Email Address</label>
                <input className="auth-input" name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange} required />
              </div>

              <div className="auth-field" style={{ marginBottom: mode === 'login' ? 0 : '0.85rem' }}>
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <input
                    className="auth-input has-toggle"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" className="auth-toggle-pass" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Hide password' : 'Show password'}>
                    {showPass ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              {mode === 'login' && (
                <div className="auth-forgot">
                  <a href="#">Forgot password?</a>
                </div>
              )}

              {mode === 'signup' && (
                <div className="auth-field">
                  <label className="auth-label">Confirm Password</label>
                  <input className="auth-input" name="confirm" type="password" placeholder="••••••••" value={form.confirm} onChange={handleChange} required />
                </div>
              )}

              <button type="submit" className={`auth-submit ${submitted ? 'success' : ''}`}>
                {submitted ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {mode === 'login' ? 'Signed In' : 'Account Created'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In →' : 'Create Account →'
                )}
              </button>

              {mode === 'signup' && (
                <p className="auth-terms">
                  By creating an account you agree to our{' '}
                  <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
                </p>
              )}
            </form>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">or continue with</span>
              <div className="auth-divider-line" />
            </div>

            <div className="auth-socials">
              <button className="auth-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Google
              </button>
              <button className="auth-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </button>
            </div>

            <p className="auth-switch">
              {mode === 'login' ? (
                <>Don't have an account? <button onClick={() => switchMode('signup')}>Create one</button></>
              ) : (
                <>Already have an account? <button onClick={() => switchMode('login')}>Sign in</button></>
              )}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}