import { PropertyResultSkeleton, Skeleton, SkeletonStatus } from '@/components/ui/Skeleton';

export default function PropertiesLoading() {
  return (
    <div className="grid grid-cols-1 bg-[#f7f5f1] pt-[var(--site-header)] lg:h-svh lg:min-h-[724px] lg:grid-cols-[minmax(0,64fr)_minmax(390px,36fr)]">
      <div className="relative min-h-[430px] bg-[#ece8e0] motion-safe:animate-pulse lg:min-h-0">
        <Skeleton className="absolute left-4 right-4 top-[37px] mx-auto h-[46px] max-w-[557px] rounded-[16px] bg-white/80" />
      </div>
      <SkeletonStatus label="Loading properties" className="min-w-0 bg-[#f7f5f0] px-5 py-5 sm:px-[30px]">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-60" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="ml-auto mt-3 h-6 w-16 rounded-[15px]" />
        <div className="mt-4 space-y-[31px]">
          {Array.from({ length: 3 }, (_, index) => <PropertyResultSkeleton key={index} />)}
        </div>
      </SkeletonStatus>
    </div>
  );
}
