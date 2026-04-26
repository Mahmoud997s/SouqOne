'use client'

export function UnifiedCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-outline-variant/20 bg-background">
      {/* Image skeleton */}
      <div className="bg-surface-container animate-pulse" style={{ aspectRatio: '16/10' }} />

      {/* Body */}
      <div className="p-3 space-y-2">
        <div className="h-3 bg-surface-container rounded animate-pulse w-3/4" />
        <div className="h-3 bg-surface-container rounded animate-pulse w-1/2" />
        <div className="h-3 bg-surface-container rounded animate-pulse w-1/3" />
      </div>
    </div>
  )
}
