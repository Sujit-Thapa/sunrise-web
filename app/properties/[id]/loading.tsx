export default function PropertyLoading() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#fbf8f2_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="animate-pulse space-y-6">
          <div className="h-4 w-40 rounded-full bg-stone-200" />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-8">
              <div className="h-[520px] rounded-[34px] bg-stone-200" />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="h-28 rounded-[24px] bg-stone-200" />
                <div className="h-28 rounded-[24px] bg-stone-200" />
                <div className="h-28 rounded-[24px] bg-stone-200" />
              </div>
              <div className="h-72 rounded-[28px] bg-stone-200" />
            </div>
            <div className="h-[520px] rounded-[32px] bg-stone-200" />
          </div>
        </div>
      </div>
    </main>
  );
}
