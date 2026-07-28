'use client';

import Link from 'next/link';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import {
  ACCOUNT_STORAGE_EVENT,
  isPropertySaved,
  snapshotProperty,
  toggleSavedProperty,
} from '@/lib/account-storage';
import type { PropertyResponseDto } from '@/types';

export default function SavePropertyButton({ property }: { property: PropertyResponseDto }) {
  const { user } = useAuthSession();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) {
      window.setTimeout(() => setSaved(false), 0);
      return;
    }

    const sync = () => setSaved(isPropertySaved(user.id, property.id));
    sync();

    window.addEventListener(ACCOUNT_STORAGE_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(ACCOUNT_STORAGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, [property.id, user]);

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
      >
        <Bookmark className="h-4 w-4" />
        Save
      </Link>
    );
  }

  const handleToggle = () => {
    const nextSaved = toggleSavedProperty(user.id, snapshotProperty(property));
    setSaved(nextSaved);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
        saved
          ? 'border border-gold-primary bg-gold-primary/10 text-gold-deep'
          : 'border border-stone-200 bg-white text-slate-600 hover:border-gold-primary hover:text-gold-primary'
      }`}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved properties' : 'Save property'}
    >
      {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
