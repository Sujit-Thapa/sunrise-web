'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';

import { getRoleHomePath, isStaffRole } from '@/lib/auth-routing';
import { auth, setAuthToken } from '@/lib/auth';

// "page" is the standalone /auth/* route; "modal" is the same form opened over the current page.
export type AuthVariant = 'page' | 'modal';

const inputClass = 'h-12 w-full rounded-xl border border-transparent bg-[#f4f1ec] px-4 text-sm text-[#2a2723] outline-none transition placeholder:text-[#a19c95] focus:border-[#cc7654] focus:bg-white';
const submitClass = 'mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#2a2723] text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60';

function Field({ label, id, aside, ...input }: { label: string; id: string; aside?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-[#2a2723]">{label}</label>
        {aside}
      </div>
      <input id={id} className={inputClass} {...input} />
    </div>
  );
}

function PasswordField({ label, id, value, onChange, autoComplete, placeholder, aside }: { label: string; id: string; value: string; onChange: (value: string) => void; autoComplete: string; placeholder: string; aside?: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="text-[13px] font-medium text-[#2a2723]">{label}</label>
        {aside}
      </div>
      <div className="relative">
        <input id={id} data-custom-password-toggle type={visible ? 'text' : 'password'} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} placeholder={placeholder} required className={`${inputClass} pr-11`} />
        <button type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9a958e] hover:text-[#2a2723]">
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function ErrorNote({ message }: { message: string | null }) {
  return message ? <p role="alert" className="rounded-xl bg-[#fbe4e1] px-4 py-3 text-sm text-[#b23b2e]">{message}</p> : null;
}

export function AuthHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <Image src="/images/logo/sunrise1.png" alt="Sunrise" width={44} height={44} className="h-11 w-11 object-contain" priority />
      <h1 className="mt-5 text-[26px] font-bold leading-tight tracking-[-0.01em] text-[#2a2723]">{title}</h1>
      <p className="mt-1.5 text-sm text-[#6b665f]">{subtitle}</p>
    </div>
  );
}

// Links between the auth screens replace history inside the modal so "back" closes it.
function AuthLink({ href, variant, children, className = '' }: { href: string; variant: AuthVariant; children: ReactNode; className?: string }) {
  return <Link href={href} replace={variant === 'modal'} className={`font-semibold text-[#cc7654] hover:underline ${className}`}>{children}</Link>;
}

function useFinishSignIn(variant: AuthVariant) {
  const router = useRouter();
  return (role: string) => {
    const next = new URLSearchParams(window.location.search).get('next');
    if (isStaffRole(role)) router.replace(getRoleHomePath(role));
    else if (next?.startsWith('/') && !next.startsWith('//')) router.replace(next);
    // Customers stay on the page they were browsing when they signed in from the pop-up.
    else if (variant === 'modal') router.back();
    else router.replace(getRoleHomePath(role));
  };
}

export function LoginForm({ variant }: { variant: AuthVariant }) {
  const finish = useFinishSignIn(variant);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await auth.login({ email, password });
      setAuthToken(response.accessToken);
      const user = await auth.me(response.accessToken);
      finish(user.role);
    } catch (reason) {
      setError((reason as Error).message || 'Sign in failed. Check your details and try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <AuthHeader title="Welcome back" subtitle="Sign in to manage your saved homes and reservations." />
      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <ErrorNote message={error} />
        <Field label="Email" id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
        <PasswordField label="Password" id="login-password" value={password} onChange={setPassword} autoComplete="current-password" placeholder="Your password" aside={<AuthLink href="/auth/forgot-password" variant={variant} className="text-xs font-medium">Forgot password?</AuthLink>} />
        <button type="submit" disabled={loading} className={submitClass}>{loading ? 'Signing in…' : <>Sign in<ArrowRight aria-hidden="true" className="h-4 w-4" /></>}</button>
      </form>
      <p className="mt-6 text-center text-sm text-[#6b665f]">New to Sunrise? <AuthLink href="/auth/signup" variant={variant}>Create an account</AuthLink></p>
    </>
  );
}

type EmailCheck = { state: 'idle' | 'checking' | 'ok' | 'invalid'; message?: string; suggestion?: string | null };

async function checkEmail(email: string): Promise<EmailCheck> {
  try {
    const response = await fetch('/api/validate-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const result = (await response.json()) as { valid: boolean; reason?: string; suggestion?: string | null };
    return result.valid ? { state: 'ok', suggestion: result.suggestion } : { state: 'invalid', message: result.reason, suggestion: result.suggestion };
  } catch {
    // If the check itself can't run, let the server decide rather than blocking sign-up.
    return { state: 'ok' };
  }
}

export function SignupForm({ variant }: { variant: AuthVariant }) {
  const finish = useFinishSignIn(variant);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '' });
  const [error, setError] = useState<ReactNode>(null);
  const [loading, setLoading] = useState(false);
  const [emailCheck, setEmailCheck] = useState<EmailCheck>({ state: 'idle' });
  const update = (key: keyof typeof form) => (event: { target: { value: string } }) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const validateEmail = async (email = form.email) => {
    if (!email.trim()) return { state: 'idle' } as EmailCheck;
    setEmailCheck({ state: 'checking' });
    const result = await checkEmail(email);
    setEmailCheck(result);
    return result;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    setLoading(true);
    const check = emailCheck.state === 'ok' ? emailCheck : await validateEmail();
    if (check.state === 'invalid') { setLoading(false); return; }
    try {
      const response = await auth.register({ ...form, email: form.email.trim().toLowerCase() });
      setAuthToken(response.accessToken);
      const user = await auth.me(response.accessToken);
      finish(user.role);
    } catch (reason) {
      const status = reason && typeof reason === 'object' && 'status' in reason ? Number((reason as { status: unknown }).status) : 0;
      setError(status === 409
        ? <>An account with <strong>{form.email.trim()}</strong> already exists. <AuthLink href="/auth/login" variant={variant}>Sign in instead</AuthLink> or <AuthLink href="/auth/forgot-password" variant={variant}>reset your password</AuthLink>.</>
        : (reason as Error).message || 'We couldn’t create your account. Please try again.');
      setLoading(false);
    }
  };

  const emailNote = emailCheck.state === 'checking' ? <p className="mt-1.5 text-xs text-[#9a958e]">Checking this email…</p>
    : emailCheck.state === 'invalid' || emailCheck.suggestion ? (
      <p className={`mt-1.5 text-xs ${emailCheck.state === 'invalid' ? 'text-[#b23b2e]' : 'text-[#6b665f]'}`} role={emailCheck.state === 'invalid' ? 'alert' : undefined}>
        {emailCheck.message ? `${emailCheck.message} ` : null}
        {emailCheck.suggestion ? <>Did you mean <button type="button" onClick={() => { const next = emailCheck.suggestion!; setForm((current) => ({ ...current, email: next })); void validateEmail(next); }} className="font-semibold text-[#cc7654] underline underline-offset-2">{emailCheck.suggestion}</button>?</> : null}
      </p>
    ) : null;

  return (
    <>
      <AuthHeader title="Create your account" subtitle="Save properties, reserve homes and track every step." />
      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {error ? <p role="alert" className="rounded-xl bg-[#fbe4e1] px-4 py-3 text-sm text-[#b23b2e]">{error}</p> : null}
        <Field label="Full name" id="signup-name" value={form.fullName} onChange={update('fullName')} placeholder="Jane Doe" autoComplete="name" required minLength={2} />
        <div>
          <Field label="Email" id="signup-email" type="email" value={form.email} onChange={(event) => { update('email')(event); setEmailCheck({ state: 'idle' }); }} onBlur={() => void validateEmail()} placeholder="you@example.com" autoComplete="email" required aria-invalid={emailCheck.state === 'invalid'} />
          {emailNote}
        </div>
        <Field label="Phone" id="signup-phone" type="tel" inputMode="tel" value={form.phoneNumber} onChange={update('phoneNumber')} placeholder="98XXXXXXXX" autoComplete="tel" required />
        <PasswordField label="Password" id="signup-password" value={form.password} onChange={(value) => setForm((current) => ({ ...current, password: value }))} autoComplete="new-password" placeholder="At least 8 characters" />
        <button type="submit" disabled={loading || emailCheck.state === 'checking'} className={submitClass}>{loading ? 'Creating account…' : <>Create account<ArrowRight aria-hidden="true" className="h-4 w-4" /></>}</button>
      </form>
      <p className="mt-6 text-center text-sm text-[#6b665f]">Already have an account? <AuthLink href="/auth/login" variant={variant}>Sign in</AuthLink></p>
    </>
  );
}

export function ForgotPasswordForm({ variant }: { variant: AuthVariant }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setStatus('sending');
    setError(null);
    try {
      await auth.forgotPassword(email.trim());
      setStatus('sent');
    } catch (reason) {
      setError((reason as Error).message || 'We couldn’t send the reset email. Please try again.');
      setStatus('idle');
    }
  };

  return (
    <>
      <AuthHeader title="Reset your password" subtitle="Enter your email and we’ll send a reset link if the account exists." />
      {status === 'sent' ? (
        <p role="status" className="mt-7 rounded-xl bg-[#e6efe7] px-4 py-3 text-sm text-[#3e6b4a]">If an account with that email exists, a password reset link has been sent.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <ErrorNote message={error} />
          <Field label="Email" id="forgot-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required />
          <button type="submit" disabled={status === 'sending'} className={submitClass}>{status === 'sending' ? 'Sending…' : <>Send reset link<ArrowRight aria-hidden="true" className="h-4 w-4" /></>}</button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-[#6b665f]">Remembered it? <AuthLink href="/auth/login" variant={variant}>Back to sign in</AuthLink></p>
    </>
  );
}

// Landing page for the emailed reset link (?token=…).
export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(token ? null : 'This reset link is missing its token. Request a new link below.');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>('idle');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirm) return setError('The two passwords don’t match.');
    setStatus('saving');
    setError(null);
    try {
      await auth.resetPassword(token, password);
      setStatus('done');
    } catch (reason) {
      setError((reason as Error).message || 'This link may have expired. Request a new one.');
      setStatus('idle');
    }
  };

  return (
    <>
      <AuthHeader title="Set a new password" subtitle="Choose a password with at least 8 characters." />
      {status === 'done' ? (
        <>
          <p role="status" className="mt-7 rounded-xl bg-[#e6efe7] px-4 py-3 text-sm text-[#3e6b4a]">Your password has been updated.</p>
          <button type="button" onClick={() => router.replace('/auth/login')} className={submitClass}>Sign in<ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <ErrorNote message={error} />
          <PasswordField label="New password" id="reset-password" value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 8 characters" />
          <PasswordField label="Confirm password" id="reset-confirm" value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder="Repeat the password" />
          <button type="submit" disabled={!token || status === 'saving'} className={submitClass}>{status === 'saving' ? 'Saving…' : 'Update password'}</button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-[#6b665f]"><AuthLink href="/auth/forgot-password" variant="page">Request a new link</AuthLink></p>
    </>
  );
}
