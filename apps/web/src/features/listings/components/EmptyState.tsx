'use client'

import { SearchX } from 'lucide-react'

interface EmptyStateProps {
  onClear: () => void
  hasFilters: boolean
}

export function EmptyState({ onClear, hasFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
        <SearchX size={28} className="text-on-surface-variant/40" />
      </div>
      <div>
        <p className="font-black text-on-surface text-base">لا توجد نتائج</p>
        <p className="text-sm text-on-surface-variant mt-1">
          {hasFilters ? 'جرّب تعديل الفلاتر أو مسحها' : 'لا يوجد إعلانات في هذا القسم حالياً'}
        </p>
      </div>
      {hasFilters && (
        <button
          onClick={onClear}
          className="px-4 py-2 text-sm font-bold text-primary border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors"
        >
          مسح كل الفلاتر
        </button>
      )}
    </div>
  )
}
