'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Camera, KeyRound, Mail, Pencil, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { auth } from '@/lib/auth';
import { Skeleton, SkeletonStatus } from '@/components/ui/Skeleton';

const ROLE_LABELS: Record<string, string> = { USER: 'Customer', AGENT: 'Agent', ADMIN: 'Administrator' };
const inputClass = 'h-12 w-full rounded-xl border border-transparent bg-[#f4f1ec] px-4 text-sm text-[#2a2723] outline-none transition placeholder:text-[#a19c95] focus:border-[#cc7654] focus:bg-white';

export default function ProfilePage() {
  const { user, loading } = useAuthSession();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [notice, setNotice] = useState<{ kind: 'info' | 'success' | 'error'; text: string } | null>(null);
  const [resetSending, setResetSending] = useState(false);

  if (loading) return <ProfileSkeleton />;
  if (!user) {
    return (
      <main className="grid min-h-[70vh] place-items-center px-5 py-16">
        <div className="max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_24px_60px_rgba(42,39,35,0.08)]">
          <h1 className="text-2xl font-bold text-[#2a2723]">Sign in to view your profile</h1>
          <Link href="/auth/login" className="mt-5 inline-flex h-11 items-center rounded-full bg-[#2a2723] px-6 text-sm font-semibold text-white hover:bg-black">Sign in</Link>
        </div>
      </main>
    );
  }

  const initials = user.fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';

  const startEditing = () => {
    setForm({ fullName: user.fullName, email: user.email });
    setNotice(null);
    setEditing(true);
  };

  // The backend has no profile-update endpoint yet (see /api/docs), so changes can't be saved.
  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    setEditing(false);
    setNotice({ kind: 'info', text: 'Profile changes can’t be saved yet — the Sunrise server doesn’t support updating account details. Your details are unchanged.' });
  };

  const sendReset = async () => {
    setResetSending(true);
    try {
      const result = await auth.forgotPassword(user.email);
      setNotice({ kind: 'success', text: result?.message || `We’ve sent a password reset link to ${user.email}.` });
    } catch (error) {
      setNotice({ kind: 'error', text: (error as Error).message || 'We couldn’t send the reset email. Please try again.' });
    } finally {
      setResetSending(false);
    }
  };

  return (
    <main className="px-4 pb-20 pt-4 text-[#2a2723] sm:px-6 sm:pt-8">
      <div className="mx-auto w-full max-w-[720px]">
        <section className="rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(42,39,35,0.06)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative w-fit">
              <span aria-hidden="true" className="grid size-20 place-items-center rounded-full bg-[#2a2723] text-2xl font-bold text-white">{initials}</span>
              <span title="Profile photos can’t be uploaded yet" className="absolute -bottom-1 -right-1 grid size-8 cursor-not-allowed place-items-center rounded-full border-2 border-white bg-[#d9d3c9] text-white"><Camera aria-hidden="true" className="h-3.5 w-3.5" /></span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-[26px] font-bold leading-tight">{user.fullName}</h1>
              <p className="mt-1 text-sm text-[#6b665f]">{user.email}</p>
              <span className="mt-2 inline-flex rounded-full bg-[#e6efe7] px-2.5 py-1 text-[11px] font-semibold text-[#3e6b4a]">{ROLE_LABELS[user.role] ?? user.role} account</span>
            </div>
            {!editing ? <button type="button" onClick={startEditing} className="inline-flex h-10 items-center gap-2 self-start rounded-full bg-[#2a2723] px-5 text-sm font-semibold text-white hover:bg-black sm:self-center"><Pencil aria-hidden="true" className="h-4 w-4" />Edit profile</button> : null}
          </div>

          {notice ? <p role="status" className={`mt-6 rounded-xl px-4 py-3 text-sm ${notice.kind === 'error' ? 'bg-[#fbe4e1] text-[#b23b2e]' : notice.kind === 'success' ? 'bg-[#e6efe7] text-[#3e6b4a]' : 'bg-[#f4f1ec] text-[#4b4740]'}`}>{notice.text}</p> : null}

          {editing ? (
            <form onSubmit={handleSave} className="mt-7 space-y-4 border-t border-[#ebe7e0] pt-7">
              <label className="block"><span className="mb-1.5 block text-[13px] font-medium">Full name</span><input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} autoComplete="name" required className={inputClass} /></label>
              <label className="block"><span className="mb-1.5 block text-[13px] font-medium">Email</span><input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} autoComplete="email" required className={inputClass} /></label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="inline-flex h-11 items-center rounded-full border border-[#e3ded6] px-5 text-sm font-medium hover:border-[#cc7654]">Cancel</button>
                <button type="submit" className="inline-flex h-11 items-center rounded-full bg-[#cc7654] px-6 text-sm font-semibold text-white hover:bg-[#b66545]">Save changes</button>
              </div>
            </form>
          ) : (
            <dl className="mt-7 divide-y divide-[#ebe7e0] border-t border-[#ebe7e0]">
              <Detail icon={UserRound} label="Full name" value={user.fullName} />
              <Detail icon={Mail} label="Email" value={user.email} />
              <Detail icon={ShieldCheck} label="Account type" value={ROLE_LABELS[user.role] ?? user.role} />
            </dl>
          )}
        </section>

        <section className="mt-5 flex flex-col gap-4 rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(42,39,35,0.06)] sm:flex-row sm:items-center sm:p-8">
          <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full bg-[#fbe9e1] text-[#cc7654]"><KeyRound className="h-5 w-5" /></span>
          <div className="flex-1"><h2 className="font-semibold">Password</h2><p className="mt-0.5 text-sm text-[#6b665f]">We’ll email you a secure link to set a new password.</p></div>
          <button type="button" onClick={() => void sendReset()} disabled={resetSending} className="inline-flex h-10 items-center self-start rounded-full border border-[#e3ded6] px-5 text-sm font-semibold hover:border-[#cc7654] disabled:opacity-60 sm:self-center">{resetSending ? 'Sending…' : 'Send reset link'}</button>
        </section>
      </div>
    </main>
  );
}

function Detail({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#9a958e]" />
      <dt className="w-32 shrink-0 text-sm text-[#6b665f]">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <main className="px-4 pb-20 pt-4 sm:px-6 sm:pt-8">
      <SkeletonStatus label="Loading profile" className="mx-auto w-full max-w-[720px] rounded-[28px] bg-white p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1"><Skeleton className="h-7 w-48" /><Skeleton className="mt-2 h-4 w-56" /><Skeleton className="mt-3 h-5 w-28 rounded-full" /></div>
        </div>
        <div className="mt-7 space-y-5 border-t border-[#ebe7e0] pt-6">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-5 w-full" />)}</div>
      </SkeletonStatus>
    </main>
  );
}
