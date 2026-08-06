'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function PropertyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the console detail for debugging while showing a friendly UI.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)]">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-[32px] border border-stone-200 bg-white p-8 text-center shadow-brand-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
            Property details
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-midnight">We couldn’t load this property</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            The page hit an unexpected error while loading the listing. Please try again, or go
            back to the property list.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center justify-center rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Try again
            </button>
            <Link
              href="/properties"
              className="inline-flex items-center justify-center rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
            >
              Back to properties
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
