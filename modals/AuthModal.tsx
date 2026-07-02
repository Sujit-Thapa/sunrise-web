'use client';

import { useState, useEffect, useRef } from 'react';

type AuthMode = 'login' | 'signup';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setMode(initialMode);
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setForm({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
    }, 1600);
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
        @keyframes auth-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes auth-slide-up { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'login' ? 'Sign in' : 'Create account'}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm p-5 [animation:auth-fade-in_0.15s_ease]"
      >
        {/* Card */}
        <div className="relative w-full max-w-[360px] rounded-2xl bg-white/90 backdrop-blur-xl border border-black/[0.06] shadow-[0_10px_40px_rgba(0,0,0,0.12)] [animation:auth-slide-up_0.2s_ease]">

          {/* Close */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 flex items-center justify-center p-1 text-gray-400 hover:text-gray-700 transition-colors duration-200"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="px-6 pt-7 pb-6">
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-5 p-0.5 bg-gray-100/80 rounded-full w-fit">
              <button
                onClick={() => switchMode('login')}
                className={`px-3.5 py-1.5 rounded-full font-['DM_Sans'] text-[0.72rem] font-medium tracking-wide transition-colors duration-200 ${
                  mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => switchMode('signup')}
                className={`px-3.5 py-1.5 rounded-full font-['DM_Sans'] text-[0.72rem] font-medium tracking-wide transition-colors duration-200 ${
                  mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {mode === 'login' ? (
              <>
                <h2 className="font-['DM_Sans'] font-semibold text-[1.15rem] text-gray-900 mb-0.5">
                  Welcome back
                </h2>
                <p className="font-['DM_Sans'] text-[0.78rem] text-gray-500 mb-5">
                  Sign in to your Sunrise Real Estate.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-['DM_Sans'] font-semibold text-[1.15rem] text-gray-900 mb-0.5">
                  Create your account
                </h2>
                <p className="font-['DM_Sans'] text-[0.78rem] text-gray-500 mb-5">
                  List, book, and save properties in seconds.
                </p>
              </>
            )}

            <form onSubmit={handleSubmit}>
              {mode === 'signup' && (
                <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 font-['DM_Sans'] text-[0.82rem] text-gray-900 outline-none transition-colors duration-200 focus:border-[#D4920A] focus:bg-white placeholder:text-gray-400"
                    name="firstName"
                    placeholder="First name"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                  <input
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 font-['DM_Sans'] text-[0.82rem] text-gray-900 outline-none transition-colors duration-200 focus:border-[#D4920A] focus:bg-white placeholder:text-gray-400"
                    name="lastName"
                    placeholder="Last name"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}

              <input
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mb-2.5 font-['DM_Sans'] text-[0.82rem] text-gray-900 outline-none transition-colors duration-200 focus:border-[#D4920A] focus:bg-white placeholder:text-gray-400"
                name="email"
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
              />

              <div className={`relative ${mode === 'login' ? 'mb-1.5' : 'mb-2.5'}`}>
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 pr-10 font-['DM_Sans'] text-[0.82rem] text-gray-900 outline-none transition-colors duration-200 focus:border-[#D4920A] focus:bg-white placeholder:text-gray-400"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center bg-transparent border-none p-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPass ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </div>

              {mode === 'login' && (
                <div className="text-right mb-4">
                  <a href="#" className="text-[0.7rem] text-gray-400 no-underline hover:text-[#D4920A] transition-colors duration-200">
                    Forgot password?
                  </a>
                </div>
              )}

              {mode === 'signup' && (
                <input
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 mb-4 font-['DM_Sans'] text-[0.82rem] text-gray-900 outline-none transition-colors duration-200 focus:border-[#D4920A] focus:bg-white placeholder:text-gray-400"
                  name="confirm"
                  type="password"
                  placeholder="Confirm password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                />
              )}

              <button
                type="submit"
                className={`w-full rounded-lg py-2.5 font-['DM_Sans'] text-[0.8rem] font-medium cursor-pointer flex items-center justify-center gap-1.5 transition-colors duration-200 ${
                  submitted ? 'bg-[#3A5830] text-white' : 'bg-[#D4920A] text-white hover:bg-[#B87F1E]'
                }`}
              >
                {submitted ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {mode === 'login' ? 'Signed in' : 'Account created'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>

              {mode === 'signup' && (
                <p className="text-[0.65rem] text-gray-400 text-center mt-3 leading-relaxed">
                  By continuing you agree to our{' '}
                  <a href="#" className="text-gray-500 no-underline hover:underline">Terms</a> and{' '}
                  <a href="#" className="text-gray-500 no-underline hover:underline">Privacy Policy</a>.
                </p>
              )}
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[0.62rem] tracking-wide uppercase text-gray-400 whitespace-nowrap">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="bg-gray-50 border border-gray-200 rounded-lg py-2 font-['DM_Sans'] text-[0.75rem] text-gray-700 cursor-pointer flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-gray-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Google
              </button>
              <button className="bg-gray-50 border border-gray-200 rounded-lg py-2 font-['DM_Sans'] text-[0.75rem] text-gray-700 cursor-pointer flex items-center justify-center gap-2 transition-colors duration-200 hover:bg-gray-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                Facebook
              </button>
            </div>

            <p className="text-center mt-4 text-[0.75rem] text-gray-500 font-['DM_Sans']">
              {mode === 'login' ? (
                <>New here?{' '}
                  <button onClick={() => switchMode('signup')} className="bg-transparent border-none text-gray-900 font-['DM_Sans'] font-medium text-[0.75rem] cursor-pointer p-0 hover:text-[#D4920A]">
                    Create an account
                  </button>
                </>
              ) : (
                <>Already a member?{' '}
                  <button onClick={() => switchMode('login')} className="bg-transparent border-none text-gray-900 font-['DM_Sans'] font-medium text-[0.75rem] cursor-pointer p-0 hover:text-[#D4920A]">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}