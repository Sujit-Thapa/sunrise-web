import { PropertyCardGridSkeleton, Skeleton } from '@/components/ui/Skeleton';

export default function HomeLoading() {
  return (
    <div className="bg-[#f7f5f1]">
      <div className="flex h-svh min-h-[560px] flex-col items-center justify-center bg-[#ece8e0] px-5 pt-[16vh] sm:px-8">
        <Skeleton className="h-4 w-48 bg-[#dcd6cb]" />
        <Skeleton className="mt-4 h-12 w-full max-w-[640px] bg-[#dcd6cb] sm:h-20" />
        <Skeleton className="mt-7 h-[102px] w-full max-w-[1048px] rounded-[30px] bg-white/80" />
      </div>
      <section className="mx-auto max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16 xl:px-0">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mb-10 mt-3 h-10 w-full max-w-[460px]" />
        <PropertyCardGridSkeleton label="Loading featured properties" />
      </section>
    </div>
  );
}
