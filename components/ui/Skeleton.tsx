import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Placeholder blocks shown while content loads. Each composite mirrors the real
// component's layout so the page doesn't jump when data arrives.

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={cn('rounded-md bg-[#e8e4db] motion-safe:animate-pulse', className)} />;
}

// Announces the loading state once to assistive tech; the blocks inside are hidden from it.
export function SkeletonStatus({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[26px] bg-white">
      <Skeleton className="aspect-square rounded-none" />
      <div className="px-[23px] pb-4 pt-4">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="mt-2.5 h-5 w-4/5" />
        <Skeleton className="mt-2 h-3 w-1/2" />
        <div className="mt-3 flex gap-4 border-t border-[#e8e4db] pt-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

export function PropertyCardGridSkeleton({ count = 4, label = 'Loading properties' }: { count?: number; label?: string }) {
  return (
    <SkeletonStatus label={label} className="grid gap-[30px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => <PropertyCardSkeleton key={index} />)}
    </SkeletonStatus>
  );
}

// Horizontal result card used in the properties list beside the map.
export function PropertyResultSkeleton() {
  return (
    <div className="grid min-h-[180px] grid-cols-[47%_minmax(0,1fr)] overflow-hidden rounded-[26px] border-2 border-transparent bg-white">
      <Skeleton className="h-full rounded-none" />
      <div className="flex flex-col py-2.5 pl-[23px] pr-[30px]">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2 h-5 w-full" />
        <Skeleton className="mt-2 h-3 w-2/3" />
        <Skeleton className="mt-3 size-5 rounded-full" />
        <div className="mt-auto flex gap-4 border-t border-[#e8e4db] pt-2">
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

function DetailTileSkeleton() {
  return (
    <div className="flex min-h-[92px] items-center gap-3 rounded-xl border border-[#efe7de] bg-white p-4">
      <Skeleton className="size-10 shrink-0 rounded-[10px]" />
      <div className="flex-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-4 w-28" />
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <SkeletonStatus label="Loading property" className="bg-[#f7f5f1]">
      <div className="mx-auto max-w-[1320px] px-5 pb-16 pt-6 sm:px-8 xl:px-0">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,660fr)_minmax(0,614fr)] lg:gap-[46px]">
          <div className="space-y-[46px]">
            <div>
              <Skeleton className="aspect-[660/402] rounded-2xl" />
              <div className="mt-12 grid grid-cols-3 gap-6">
                {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="aspect-[204/146] rounded-[12.5px]" />)}
              </div>
            </div>
            <div>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="mt-4 h-3.5 w-full" />
              <Skeleton className="mt-2.5 h-3.5 w-full" />
              <Skeleton className="mt-2.5 h-3.5 w-3/4" />
            </div>
          </div>
          <div className="space-y-[46px]">
            <div>
              <Skeleton className="h-8 w-56" />
              <Skeleton className="mt-3 h-8 w-4/5" />
              <Skeleton className="mt-3 h-3 w-48" />
              <Skeleton className="mt-6 h-[35px] w-[165px] rounded-[20px]" />
            </div>
            <div>
              <Skeleton className="mb-4 h-6 w-40" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[repeat(2,300px)]">
                {Array.from({ length: 4 }, (_, index) => <DetailTileSkeleton key={index} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SkeletonStatus>
  );
}

// Generic stacked rows for tables and lists (reservations, submissions, admin panels).
export function RowsSkeleton({ rows = 4, label = 'Loading', withThumb = true }: { rows?: number; label?: string; withThumb?: boolean }) {
  return (
    <SkeletonStatus label={label} className="space-y-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4">
          {withThumb ? <Skeleton className="size-14 shrink-0 rounded-xl" /> : null}
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="mt-2 h-3 w-3/5" />
          </div>
          <Skeleton className="hidden h-7 w-20 rounded-full sm:block" />
        </div>
      ))}
    </SkeletonStatus>
  );
}

// Centered card used while a single record or account is being checked.
export function CardSkeleton({ label, className = '' }: { label: string; className?: string }) {
  return (
    <SkeletonStatus label={label} className={`mx-auto max-w-[620px] rounded-[24px] border border-stone-200 bg-white px-6 py-9 sm:p-10 ${className}`}>
      <Skeleton className="mx-auto size-14 rounded-full" />
      <Skeleton className="mx-auto mt-5 h-8 w-2/3" />
      <Skeleton className="mx-auto mt-3 h-4 w-1/2" />
      <Skeleton className="mt-8 h-32 rounded-2xl" />
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-11 rounded-xl" />
        <Skeleton className="h-11 rounded-xl" />
      </div>
    </SkeletonStatus>
  );
}

// Table placeholder: header strip plus rows of cells, sized like the admin tables.
export function TableSkeleton({ rows = 5, columns = 5, label = 'Loading' }: { rows?: number; columns?: number; label?: string }) {
  return (
    <SkeletonStatus label={label} className="overflow-hidden rounded-[24px] border border-stone-200 bg-white">
      <div className="flex gap-6 bg-[#f7f5f1] px-4 py-3">
        {Array.from({ length: columns }, (_, index) => <Skeleton key={index} className="h-3 flex-1 bg-[#e3ddd2]" />)}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-6 border-t border-stone-200 px-4 py-4">
          {Array.from({ length: columns }, (_, column) => <Skeleton key={column} className={`h-4 flex-1 ${column === 0 ? 'max-w-[40%]' : ''}`} />)}
        </div>
      ))}
    </SkeletonStatus>
  );
}

// Full workspace placeholder shown while staff access is being checked.
export function DashboardSkeleton({ label = 'Checking access' }: { label?: string }) {
  return (
    <SkeletonStatus label={label} className="min-h-[calc(100vh-68px)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-3 h-9 w-72" />
        <Skeleton className="mt-3 h-4 w-full max-w-lg" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-2xl border border-stone-200 bg-white p-5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="mt-3 h-7 w-28" />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <TableSkeleton label={label} />
        </div>
      </div>
    </SkeletonStatus>
  );
}
