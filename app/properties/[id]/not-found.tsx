import Link from 'next/link';

export default function PropertyNotFound() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)]">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full rounded-[32px] border border-stone-200 bg-white p-8 text-center shadow-brand-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
            Property details
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-midnight">Property not found</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            The listing you opened may have been removed, hidden, or the link may be incorrect.
          </p>
          <Link
            href="/properties"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to properties
          </Link>
        </div>
      </div>
    </main>
  );
}
