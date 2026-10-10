'use client';

import Link from 'next/link';
import { RiBookmarkLine as Bookmark, RiBookmarkFill as BookmarkCheck, RiHeartLine, RiHeartFill } from 'react-icons/ri';

import { useAuthSession } from '@/components/auth/AuthSessionProvider';
import {
  snapshotProperty,
  toggleSavedProperty,
  useAccountStore,
} from '@/lib/account-store';
import type { PropertyResponseDto } from '@/types';

export default function SavePropertyButton({ property, compact = false }: { property: PropertyResponseDto; compact?: boolean }) {
  const { user } = useAuthSession();
  const hydrated = useAccountStore((state) => state.hydrated);
  const saved = useAccountStore((state) =>
    user ? (state.accounts[user.id]?.saved ?? []).some((item) => item.id === property.id) : false,
  );

  if (!user) {
    return (
      <Link
        href="/auth/login"
        aria-label="Sign in to save property"
        className={compact ? 'inline-flex rounded-full p-1.5 text-stone-600 hover:text-[#cc7654]' : 'inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition hover:border-gold-primary hover:text-gold-primary'}
      >
        {compact ? <RiHeartLine className="h-4 w-4" /> : <><Bookmark className="h-4 w-4" />Save</>}
      </Link>
    );
  }

  const handleToggle = () => {
    toggleSavedProperty(user.id, snapshotProperty(property));
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={!hydrated}
      className={compact ? `inline-flex rounded-full p-1.5 ${saved ? 'text-[#d74d49]' : 'text-stone-600 hover:text-[#cc7654]'}` : `inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
        saved
          ? 'border border-gold-primary bg-gold-primary/10 text-gold-deep'
          : 'border border-stone-200 bg-white text-slate-600 hover:border-gold-primary hover:text-gold-primary'
      }`}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved properties' : 'Save property'}
    >
      {compact ? (saved ? <RiHeartFill className="h-4 w-4" /> : <RiHeartLine className="h-4 w-4" />) : <>{saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}{saved ? 'Saved' : 'Save'}</>}
    </button>
  );
}
