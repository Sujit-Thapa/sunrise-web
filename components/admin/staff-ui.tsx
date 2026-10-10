'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, X as XIcon } from 'lucide-react';

// Shared building blocks for the admin and agent workspaces (Figma "Sunrise operations").

export const card = 'rounded-2xl border border-[#ebe7e0] bg-white';

// Compact Nepali notation used across the staff designs: "NPR 2.15 Cr", "NPR 52 L", "NPR 58,000/mo".
export function formatNpr(value: number | string | null | undefined, listingType?: string): string {
  const amount = Number(value) || 0;
  const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, '');
  const base = amount >= 1e7 ? `${trim(amount / 1e7)} Cr` : amount >= 1e5 ? `${trim(amount / 1e5)} L` : amount.toLocaleString('en-IN');
  return `NPR ${base}${listingType === 'RENT' ? '/mo' : ''}`;
}

export function relativeTime(value?: string | null): string {
  if (!value) return '—';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '—';
  const minutes = Math.round((Date.now() - then) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDay(value);
}

export function formatDay(value?: string | null, withTime = false): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', withTime ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false } : { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

export function initialsOf(name?: string | null): string {
  return (name ?? '').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '—';
}

export function Avatar({ name, size = 'md' }: { name?: string | null; size?: 'sm' | 'md' }) {
  return <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full bg-[#efece7] font-semibold text-[#2a2723] ${size === 'sm' ? 'size-7 text-[10px]' : 'size-9 text-xs'}`}>{initialsOf(name)}</span>;
}

export type Tone = 'green' | 'amber' | 'red' | 'gray' | 'orange' | 'dark';

const toneClass: Record<Tone, string> = {
  green: 'bg-[#e6efe7] text-[#3e6b4a]',
  amber: 'bg-[#fdf1d6] text-[#a8740f]',
  red: 'bg-[#f9e1de] text-[#b23b2e]',
  gray: 'bg-[#efedea] text-[#6b665f]',
  orange: 'bg-[#fbe9e1] text-[#b5583a]',
  dark: 'bg-[#2a2723] text-white',
};

export function Pill({ tone, children, upper = false }: { tone: Tone; children: ReactNode; upper?: boolean }) {
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${upper ? 'uppercase' : ''} ${toneClass[tone]}`}>{children}</span>;
}

// Status → (label, tone) for every status string the backend returns.
export function statusTone(status?: string | null): { label: string; tone: Tone } {
  const value = String(status ?? '').toUpperCase();
  const map: Record<string, { label: string; tone: Tone }> = {
    ACTIVE: { label: 'Active', tone: 'green' },
    APPROVED: { label: 'Approved', tone: 'green' },
    SUCCEEDED: { label: 'Succeeded', tone: 'green' },
    COMPLETED: { label: 'Completed', tone: 'green' },
    CLAIMED: { label: 'Claimed', tone: 'gray' },
    PENDING: { label: 'Pending', tone: 'amber' },
    PENDING_REVIEW: { label: 'Pending review', tone: 'amber' },
    RESERVED: { label: 'Reserved', tone: 'orange' },
    FAILED: { label: 'Failed', tone: 'red' },
    REJECTED: { label: 'Rejected', tone: 'red' },
    CANCELLED: { label: 'Cancelled', tone: 'red' },
    HIDDEN: { label: 'Hidden', tone: 'gray' },
    REFUNDED: { label: 'Refunded', tone: 'gray' },
    DRAFT: { label: 'Draft', tone: 'gray' },
  };
  return map[value] ?? { label: value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ') : '—', tone: 'gray' };
}

export function StatusPill({ status, upper = true }: { status?: string | null; upper?: boolean }) {
  const { label, tone } = statusTone(status);
  return <Pill tone={tone} upper={upper}>{label}</Pill>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[32px] font-bold leading-tight text-[#2a2723]">{title}</h1>
        <p className="mt-1 text-sm text-[#6b665f]">{subtitle}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-2.5">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, detail, onClick, active = false }: { label: string; value: ReactNode; detail?: string; onClick?: () => void; active?: boolean }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2"><p className="text-[13px] font-medium text-[#2a2723]">{label}</p>{onClick ? <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-[#77726b]" /> : null}</div>
      <div className="mt-2 text-[32px] font-semibold leading-none text-[#2a2723]">{value}</div>
      {detail ? <p className="mt-3 text-[11px] text-[#77726b]">{detail}</p> : null}
    </>
  );
  const className = `${card} px-4 py-4 text-left ${active ? 'ring-2 ring-[#cc7654]' : ''}`;
  return onClick ? <button type="button" onClick={onClick} className={`${className} transition hover:border-[#cc7654]`}>{body}</button> : <div className={className}>{body}</div>;
}

export function SectionCard({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${card} ${className}`}>
      <div className="flex items-start justify-between gap-3 px-5 pt-5">
        <div><h2 className="text-[22px] font-semibold leading-tight text-[#2a2723]">{title}</h2>{subtitle ? <p className="mt-1 text-[13px] text-[#6b665f]">{subtitle}</p> : null}</div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TextAction({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className="shrink-0 text-sm font-semibold text-[#c56847] hover:underline">{children}</button>;
}

export const primaryButton = 'inline-flex h-10 items-center gap-2 rounded-full bg-[#cc7654] px-5 text-sm font-semibold text-white transition hover:bg-[#b66545] disabled:opacity-50';
export const outlineButton = 'inline-flex h-10 items-center gap-2 rounded-full border border-[#e3ded6] bg-white px-4 text-sm font-medium text-[#2a2723] transition hover:border-[#cc7654] disabled:opacity-50';
export const tableHead = 'bg-[#faf9f7] text-[11px] font-semibold uppercase text-[#6b665f]';

// Downloads rows as a CSV file named after the report.
export function downloadCsv(filename: string, rows: Array<Record<string, string | number | null | undefined>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((row) => headers.map((key) => escape(row[key])).join(','))].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export type StaffRole = 'admin' | 'agent';
export type StaffNotice = { kind: 'success' | 'error'; title?: string; message: string };

// Turns a failed request into a sentence that says what was blocked and why, for the
// person's role. `action` reads naturally after "couldn't", e.g. "suspend this listing".
export function describeActionError(error: unknown, action: string, role: StaffRole): StaffNotice {
  const status = error && typeof error === 'object' && 'status' in error ? Number((error as { status: unknown }).status) : 0;
  const backend = error instanceof Error && error.message ? error.message : '';
  const title = `Couldn’t ${action}`;
  if (status === 401) return { kind: 'error', title, message: 'Your session has expired. Sign in again and retry.' };
  if (status === 403) {
    return {
      kind: 'error',
      title,
      message: role === 'agent'
        ? 'Your agent account doesn’t have permission for this. Agents can only change listings they created, and moderation (suspend or restore) is limited to admins.'
        : 'The server refused this for your admin account. Check that your account is still active, or ask the system owner to confirm your permissions.',
    };
  }
  if (status === 404) return { kind: 'error', title, message: 'This item no longer exists. It may have been deleted by someone else — refresh to see the latest list.' };
  if (status === 409 || status === 400 || status === 422) return { kind: 'error', title, message: backend || 'This item isn’t in a state that allows this action. Refresh and check its current status.' };
  if (status >= 500) return { kind: 'error', title, message: 'The Sunrise server had a problem. Nothing was changed — try again in a moment.' };
  if (!status) return { kind: 'error', title, message: 'We couldn’t reach the Sunrise server. Check your connection and try again.' };
  return { kind: 'error', title, message: backend || 'Something went wrong. Please try again.' };
}

// Fixed notice above drawers and dialogs so results are visible wherever the action was taken.
export function StaffToast({ notice, onClose }: { notice: StaffNotice | null; onClose: () => void }) {
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!notice || notice.kind === 'error') return;
    const timer = window.setTimeout(() => onCloseRef.current(), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  if (!notice) return null;
  const error = notice.kind === 'error';
  return (
    <div role={error ? 'alert' : 'status'} className={`fixed bottom-5 right-5 z-[90] flex w-[min(420px,calc(100vw-40px))] items-start gap-3 rounded-2xl border bg-white p-4 shadow-[0_12px_32px_rgba(42,39,35,0.18)] ${error ? 'border-[#f3c6c0]' : 'border-[#cfe0d1]'}`}>
      <span aria-hidden="true" className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${error ? 'bg-[#fbe4e1] text-[#b23b2e]' : 'bg-[#e6efe7] text-[#3e6b4a]'}`}>{error ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</span>
      <div className="min-w-0 flex-1">
        {notice.title ? <p className="text-sm font-semibold text-[#2a2723]">{notice.title}</p> : null}
        <p className={`text-sm ${notice.title ? 'mt-0.5 text-[#6b665f]' : 'text-[#2a2723]'}`}>{notice.message}</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="rounded-full p-1 text-[#9a958e] hover:bg-[#f4f1ec] hover:text-[#2a2723]"><XIcon className="h-4 w-4" /></button>
    </div>
  );
}
