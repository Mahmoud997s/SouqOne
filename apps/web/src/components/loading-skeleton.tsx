'use client';

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl overflow-hidden border border-outline-variant/10">
      <div className="aspect-[16/10] skeleton-pulse relative">
        <div className="absolute bottom-4 right-4 h-4 w-3/4 bg-outline-variant rounded" />
      </div>
      <div className="p-6 space-y-4">
        <div className="h-6 w-3/4 skeleton-pulse rounded" />
        <div className="flex gap-4">
          <div className="h-4 w-1/4 skeleton-pulse rounded" />
          <div className="h-4 w-1/4 skeleton-pulse rounded" />
        </div>
        <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
          <div className="h-6 w-20 skeleton-pulse rounded" />
          <div className="h-8 w-24 skeleton-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ListingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
