'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, KeyRound, LogOut, Mail, ShieldCheck, UserRound, X } from 'lucide-react';
import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { auth } from '@/lib/auth';

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Administrator', AGENT: 'Agent', USER: 'Customer' };

// Profile chip for the staff top bars. Opens an account menu instead of leaving the workspace.
export default function StaffAccountMenu() {
  const { user, signOut } = useAuthSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  const initials = user?.fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'S';
  const role = ROLE_LABELS[user?.role ?? ''] ?? 'Staff';

  return (
    <div ref={ref} className="relative">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex items-center gap-2.5 rounded-full border border-[#ebe7e0] bg-white py-1.5 pl-1.5 pr-3 text-left shadow-[0_2px_8px_rgba(42,39,35,0.06)] transition hover:border-[#d9d3c9]">
        {user?.avatarUrl ? (
          // The avatar host is deployment-dependent, so this cannot use Next's image allow-list.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt="" className="size-8 rounded-full object-cover" />
        ) : <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-[#2a2723] text-[11px] font-bold text-white">{initials}</span>}
        <span className="hidden sm:block"><strong className="block text-[13px] font-semibold leading-tight text-[#2a2723]">{user?.fullName ?? 'Staff'}</strong><span className="block text-[11px] text-stone-500">{role}</span></span>
        <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-[calc(100%+8px)] z-[60] w-60 rounded-2xl bg-white p-1.5 shadow-[0_0_25px_rgba(0,0,0,0.15)]">
          <div className="px-3 py-2.5"><p className="truncate text-sm font-semibold text-[#2a2723]">{user?.fullName}</p><p className="truncate text-xs text-stone-500">{user?.email}</p></div>
          <div className="my-1 h-px bg-[#ebe7e0]" />
          <button type="button" role="menuitem" onClick={() => { setOpen(false); setDetailsOpen(true); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#2a2723] hover:bg-[#f4f1ec]"><UserRound aria-hidden="true" className="h-4 w-4" />Account details</button>
          <button type="button" role="menuitem" onClick={() => { setOpen(false); signOut(); router.push('/'); }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[#e5484d] hover:bg-[#fdf1f0]"><LogOut aria-hidden="true" className="h-4 w-4" />Sign out</button>
        </div>
      ) : null}
      {detailsOpen && user ? <AccountDetailsDialog name={user.fullName} email={user.email} role={role} initials={initials} onClose={() => setDetailsOpen(false)} /> : null}
    </div>
  );
}

function AccountDetailsDialog({ name, email, role, initials, onClose }: { name: string; email: string; role: string; initials: string; onClose: () => void }) {
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sendReset = async () => {
    setSending(true);
    try {
      const result = await auth.forgotPassword(email);
      setStatus({ kind: 'success', text: result?.message || `We’ve sent a password reset link to ${email}.` });
    } catch (error) {
      setStatus({ kind: 'error', text: (error as Error).message || 'We couldn’t send the reset email.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 px-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="account-details-title" onClick={(event) => event.stopPropagation()} className="relative w-full max-w-md rounded-[24px] bg-white p-7 text-[#2a2723] shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-[#f4f1ec] text-[#6b665f] hover:bg-[#ebe6de]"><X className="h-4 w-4" /></button>
        <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-[#2a2723] text-xl font-bold text-white">{initials}</span>
        <h2 id="account-details-title" className="mt-4 text-[22px] font-bold">{name}</h2>
        <dl className="mt-5 divide-y divide-[#ebe7e0] border-y border-[#ebe7e0] text-sm">
          <div className="flex items-center gap-3 py-3"><Mail aria-hidden="true" className="h-4 w-4 text-[#9a958e]" /><dt className="w-20 text-[#6b665f]">Email</dt><dd className="min-w-0 break-words font-medium">{email}</dd></div>
          <div className="flex items-center gap-3 py-3"><ShieldCheck aria-hidden="true" className="h-4 w-4 text-[#9a958e]" /><dt className="w-20 text-[#6b665f]">Role</dt><dd className="font-medium">{role}</dd></div>
        </dl>
        {status ? <p role="status" className={`mt-4 rounded-xl px-4 py-3 text-sm ${status.kind === 'success' ? 'bg-[#e6efe7] text-[#3e6b4a]' : 'bg-[#fbe4e1] text-[#b23b2e]'}`}>{status.text}</p> : null}
        <button type="button" onClick={() => void sendReset()} disabled={sending} className="mt-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#e3ded6] px-4 text-sm font-semibold hover:border-[#cc7654] disabled:opacity-60"><KeyRound aria-hidden="true" className="h-4 w-4" />{sending ? 'Sending…' : 'Email me a password reset link'}</button>
      </div>
    </div>
  );
}
