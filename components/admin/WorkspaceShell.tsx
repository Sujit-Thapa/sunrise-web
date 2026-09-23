'use client';

import Link from 'next/link';
import { ArrowUpRight, Building2 } from 'lucide-react';
import type { ReactNode } from 'react';

export default function WorkspaceShell({ title, active, items, onSelect, children }: {
  title: string;
  active: string;
  items: Array<{ value: string; label: string }>;
  onSelect: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="staff-workspace min-h-screen bg-[#f8f6f1] p-4 text-[#2A2723] sm:p-7">
      <div className="mx-auto grid max-w-[1600px] gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="self-start rounded-[32px] bg-[#2A2723] p-5 text-white lg:sticky lg:top-6">
          <Link href="/" className="flex items-center gap-3 px-2 py-4 text-lg font-bold"><Building2 className="text-[#ce7c57]" /> Sunrise</Link>
          <p className="px-2 pb-6 text-xs uppercase tracking-[0.16em] text-stone-400">{title}</p>
          <nav aria-label={`${title} navigation`} className="flex gap-2 overflow-x-auto lg:flex-col">
            {items.map(item => <button key={item.value} type="button" aria-current={active === item.value ? 'page' : undefined} onClick={() => onSelect(item.value)} className={`whitespace-nowrap rounded-2xl px-4 py-3 text-left text-sm transition ${active === item.value ? 'bg-[#ce7c57] text-white' : 'text-stone-300 hover:bg-white/10 hover:text-white'}`}>{item.label}</button>)}
          </nav>
          <Link href="/properties" className="mt-8 flex items-center justify-between border-t border-white/15 px-2 pt-5 text-sm text-stone-300">View website <ArrowUpRight size={16} /></Link>
          <Link href="/profile" className="mt-4 block px-2 pb-2 text-sm text-stone-300">My account</Link>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
