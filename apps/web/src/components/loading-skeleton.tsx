'use client';

export function CardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-outline-variant/10 bg-surface-container-lowest dark:bg-surface-container">
      <div className="aspect-[16/10] skeleton-pulse relative">
        <div className="absolute bottom-4 right-4 h-4 w-3/4 bg-outline-variant/20 dark:bg-outline-variant/15 rounded" />
      </div>
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="h-5 sm:h-6 w-3/4 skeleton-pulse rounded" />
        <div className="flex gap-3 sm:gap-4">
          <div className="h-3 sm:h-4 w-1/4 skeleton-pulse rounded" />
          <div className="h-3 sm:h-4 w-1/4 skeleton-pulse rounded" />
        </div>
        <div className="pt-3 sm:pt-4 border-t border-outline-variant/10 flex items-center justify-between">
          <div className="h-5 sm:h-6 w-20 skeleton-pulse rounded" />
          <div className="h-7 sm:h-8 w-24 skeleton-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ListingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-8 pt-28 pb-20">
      <div className="h-4 skeleton-pulse rounded w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-xl skeleton-pulse aspect-[16/10]" />
          <div className="bg-surface-container-lowest rounded-xl p-6 space-y-4 border border-outline-variant/10">
            <div className="h-6 skeleton-pulse rounded w-40" />
            <div className="h-4 skeleton-pulse rounded w-full" />
            <div className="h-4 skeleton-pulse rounded w-3/4" />
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 space-y-4 border border-outline-variant/10">
            <div className="h-8 skeleton-pulse rounded w-3/4" />
            <div className="h-12 skeleton-pulse rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
