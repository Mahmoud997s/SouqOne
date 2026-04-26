'use client'

import { X } from 'lucide-react'
import type { ActiveFilters as ActiveFiltersType } from '../types/filters.types'
import type { ListingCategory } from '../types/category.types'
import { FILTERS_CONFIG } from '../config/filters.config'

//  Props 

interface ActiveFiltersProps {
  category: ListingCategory
  filters: ActiveFiltersType
  onRemove: (key: string) => void
  onClearAll: () => void
}

//  Label helper 

function buildLabel(key: string, value: string | string[], category: ListingCategory): string {
  const config = FILTERS_CONFIG[category]
  const field = config.find(f => f.key === key)
  if (!field) return Array.isArray(value) ? value.join('، ') : value

  if (field.type === 'range') {
    const str = Array.isArray(value) ? value[0] : value
    const [mn, mx] = str.split('|')
    const fmt = (v: string) => v ? Number(v).toLocaleString('en-US') : ''
    const unit = field.unit ? ` ${field.unit}` : ''
    if (mn && mx) return `${fmt(mn)}  ${fmt(mx)}${unit}`
    if (mn) return `من ${fmt(mn)}${unit}`
    return `حتى ${fmt(mx ?? '')}${unit}`
  }

  if (field.type === 'toggle') return field.labelAr

  if (field.type === 'multiselect') {
    const vals = Array.isArray(value) ? value : value.split(',')
    return vals.map(v => field.options?.find(o => o.value === v)?.labelAr ?? v).join('، ')
  }

  // select
  const str = Array.isArray(value) ? value[0] : value
  return field.options?.find(o => o.value === str)?.labelAr ?? str
}

function hasValue(value: string | string[] | undefined): boolean {
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.length > 0
  return value !== '' && value !== '|'
}

//  Component 

export function ActiveFilters({ category, filters, onRemove, onClearAll }: ActiveFiltersProps) {
  const config = FILTERS_CONFIG[category]

  const activeEntries = config
    .filter(field => hasValue(filters[field.key] as string | string[] | undefined))
    .map(field => ({
      key:   field.key,
      label: field.labelAr,
      value: buildLabel(field.key, filters[field.key] as string | string[], category),
    }))

  if (activeEntries.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {activeEntries.map(entry => (
        <span
          key={entry.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/20 text-[11px] text-primary"
        >
          {entry.label}: {entry.value}
          <X
            size={11}
            className="cursor-pointer hover:text-primary/60 transition-colors"
            onClick={() => onRemove(entry.key)}
          />
        </span>
      ))}

      {activeEntries.length > 1 && (
        <button
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-outline-variant/30 text-[11px] text-on-surface-variant hover:text-on-surface hover:border-on-surface/40 transition-colors cursor-pointer"
        >
          مسح الكل
        </button>
      )}
    </div>
  )
}