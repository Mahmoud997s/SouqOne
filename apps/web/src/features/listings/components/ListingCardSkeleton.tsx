'use client'

export function ListingCardSkeleton() {
  return (
    <div className="flex gap-3 bg-background rounded-xl border border-outline-variant/30 p-3 animate-pulse">
      {/* Image skeleton */}
      <div className="w-[140px] h-[105px] rounded-lg bg-surface-container flex-shrink-0" />
      
      {/* Content skeleton */}
      <div className="flex-1 space-y-2.5 py-1 flex flex-col justify-between">
        <div>
          <div className="h-3.5 bg-surface-container rounded w-3/4 mb-2" />
          <div className="flex gap-2 mb-2">
            <div className="h-3 bg-surface-container rounded w-1/4" />
            <div className="h-3 bg-surface-container rounded w-1/4" />
          </div>
          <div className="h-3 bg-surface-container rounded w-2/5" />
        </div>
        
        <div className="mt-auto pt-3 flex justify-between items-center">
          <div className="h-4 bg-surface-container rounded w-1/4" />
          <div className="flex gap-2">
            <div className="h-3 bg-surface-container rounded w-12" />
            <div className="h-3 bg-surface-container rounded w-12" />
          </div>
        </div>
      </div>
    </div>
  )
}
