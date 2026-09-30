'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { CalendarDays, Camera, LoaderCircle, LockKeyhole, Mail, MapPin, Phone, UserRound, type LucideIcon } from 'lucide-react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import { auth, getAuthToken } from '@/lib/auth';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

type ProfileForm = { fullName: string; email: string; phone: string; dateOfBirth: string; street: string; city: string; state: string; postalCode: string; country: string };
const EMPTY_FORM: ProfileForm = { fullName: '', email: '', phone: '', dateOfBirth: '', street: '', city: '', state: '', postalCode: '', country: 'Nepal' };

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuthSession();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [savedForm, setSavedForm] = useState<ProfileForm>(EMPTY_FORM);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const nextForm = { ...EMPTY_FORM, fullName: user.fullName, email: user.email };
    setForm(nextForm);
    setSavedForm(nextForm);
  }, [user]);

  useEffect(() => () => { if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl); }, [avatarPreviewUrl]);

  const clearAvatarPreview = () => setAvatarPreviewUrl((current) => {
    if (current) URL.revokeObjectURL(current);
    return null;
  });

  const handleAvatarSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || avatarUploading || !user) return;
    if (!AVATAR_MIME_TYPES.includes(file.type as typeof AVATAR_MIME_TYPES[number])) {
      setAvatarError('Choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError('Choose an image smaller than 5 MB.');
      return;
    }
    setAvatarError(null);
    clearAvatarPreview();
    setAvatarPreviewUrl(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Your session has expired. Please sign in again.');
      const presign = await auth.presignAvatar({ mimeType: file.type as typeof AVATAR_MIME_TYPES[number] }, token);
      const upload = await fetch(presign.uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!upload.ok) throw new Error('Avatar upload failed. Please try again.');
      updateUser(await auth.confirmAvatar({ s3Key: presign.s3Key, publicUrl: presign.publicUrl }, token));
      clearAvatarPreview();
    } catch (error) {
      clearAvatarPreview();
      setAvatarError(error instanceof Error ? error.message : 'Unable to update your avatar.');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedForm(form);
    setNotice('Profile updates will be saved once the account-update endpoint is available.');
  };

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f8f7f3]"><p className="text-sm text-stone-500">Loading profile…</p></main>;
  if (!user) return <main className="grid min-h-screen place-items-center bg-[#f8f7f3] px-5"><div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-[0_18px_60px_rgba(44,41,37,0.08)]"><h1 className="text-2xl font-bold text-[#2c2925]">Sign in to edit your profile</h1><Link href="/auth/login" className="mt-5 inline-flex rounded-full bg-[#3e4a3d] px-5 py-3 text-sm font-bold text-white">Sign in</Link></div></main>;

  const initials = user.fullName.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'U';

  return (
    <main className="min-h-screen bg-[#f8f7f3] px-4 py-12 text-[#2c2925] sm:px-6 sm:py-16">
      <form onSubmit={handleSave} className="mx-auto w-full max-w-2xl">
        <header className="mb-9 text-center">
          <div className="relative mx-auto h-24 w-24"><div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-[#3e4a3d] text-2xl font-bold text-white shadow-[0_10px_25px_rgba(44,41,37,0.14)]">{avatarPreviewUrl || user.avatarUrl ? (
            // The S3 host is deployment-dependent, so this cannot use Next's image allow-list.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreviewUrl ?? user.avatarUrl ?? ''} alt={`${user.fullName}'s avatar`} className="h-full w-full object-cover" />
          ) : <span className="grid h-full place-items-center">{initials}</span>}</div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void handleAvatarSelection(event)} disabled={avatarUploading} className="sr-only" tabIndex={-1} />
            <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading} aria-label="Change profile photo" className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#ca7653] text-white shadow-sm transition hover:bg-[#b66545] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ca7653] disabled:opacity-60">{avatarUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}</button>
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">{form.fullName || 'Your profile'}</h1><p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#528f63]">{user.role} account</p><p className="mt-3 text-xs text-stone-400">JPG, PNG, or WEBP · up to 5 MB</p>{avatarError ? <p role="alert" className="mt-2 text-sm text-rose-700">{avatarError}</p> : null}
        </header>

        <ProfileCard title="Account details" description="Manage your account and keep your personal details current."><div className="grid gap-4 sm:grid-cols-2"><ProfileField label="Full name" icon={UserRound}><input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} autoComplete="name" /></ProfileField><ProfileField label="Email address" icon={Mail}><input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} autoComplete="email" /></ProfileField><ProfileField label="Phone number" icon={Phone}><input type="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+977 98 1234 5678" autoComplete="tel" /></ProfileField><ProfileField label="Date of birth" icon={CalendarDays}><input type="date" value={form.dateOfBirth} onChange={(event) => setForm((current) => ({ ...current, dateOfBirth: event.target.value }))} /></ProfileField></div><div className="mt-4 flex items-center justify-between rounded-xl bg-[#fbf7f3] px-4 py-3 text-sm"><span className="flex items-center gap-2 text-stone-500"><LockKeyhole className="h-4 w-4" />Password</span><Link href="/auth/forgot-password" className="font-semibold text-[#ca7653] hover:text-[#b66545]">Change password</Link></div></ProfileCard>

        <ProfileCard title="Contact details" description="Share the contact information you want connected to your account."><div className="grid gap-4 sm:grid-cols-2"><div className="sm:col-span-2"><ProfileField label="Street address" icon={MapPin}><input value={form.street} onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))} placeholder="Street, neighborhood, or ward" autoComplete="street-address" /></ProfileField></div><ProfileField label="City" icon={MapPin}><input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="Kathmandu" autoComplete="address-level2" /></ProfileField><ProfileField label="Province" icon={MapPin}><input value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} placeholder="Bagmati" autoComplete="address-level1" /></ProfileField><ProfileField label="Postal code" icon={MapPin}><input value={form.postalCode} onChange={(event) => setForm((current) => ({ ...current, postalCode: event.target.value }))} placeholder="44600" autoComplete="postal-code" /></ProfileField><ProfileField label="Country" icon={MapPin}><input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} autoComplete="country-name" /></ProfileField></div></ProfileCard>

        {notice ? <p role="status" className="mb-5 text-center text-sm text-[#528f63]">{notice}</p> : null}<div className="flex flex-col-reverse justify-center gap-3 sm:flex-row"><button type="button" onClick={() => { setForm(savedForm); setNotice(null); }} className="rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-semibold text-stone-600 transition hover:border-stone-300">Cancel</button><button type="submit" className="rounded-full bg-[#ca7653] px-7 py-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(202,118,83,0.26)] transition hover:bg-[#b66545] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ca7653]">Save changes</button></div>
      </form>
    </main>
  );
}

function ProfileCard({ title, description, children }: { title: string; description: string; children: ReactNode }) { return <section className="mb-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-[0_12px_35px_rgba(44,41,37,0.07)] sm:p-6"><h2 className="text-base font-bold">{title}</h2><p className="mt-1 text-xs leading-5 text-stone-500">{description}</p><div className="mt-5">{children}</div></section>; }
function ProfileField({ label, icon: Icon, children }: { label: string; icon: LucideIcon; children: ReactNode }) { return <label className="block"><span className="mb-1.5 block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</span><span className="flex items-center gap-2 rounded-xl border border-stone-200 bg-[#fcfbf9] px-3 text-stone-400 transition focus-within:border-[#ca7653] focus-within:ring-2 focus-within:ring-[#ca7653]/10"><Icon className="h-4 w-4 shrink-0" /><span className="min-w-0 flex-1 [&>input]:h-11 [&>input]:w-full [&>input]:bg-transparent [&>input]:text-sm [&>input]:text-stone-800 [&>input]:outline-none [&>input::placeholder]:text-stone-400">{children}</span></span></label>; }
