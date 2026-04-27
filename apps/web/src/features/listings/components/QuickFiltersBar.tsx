'use client'

import { useMemo } from 'react'
import { clsx } from 'clsx'
import { Check, X } from 'lucide-react'
import type { ActiveFilters, FilterField } from '../types/filters.types'
import type { ListingCategory } from '../types/category.types'
import { FILTERS_CONFIG } from '../config/filters.config'

interface QuickFiltersBarProps {
  category: ListingCategory
  filters: ActiveFilters
  onToggle: (key: string, value: string | null) => void
  /** Maximum visible chips per filter field (defaults to all). */
  maxOptionsPerField?: number
}

/**
 * Premium quick-filters chips bar — horizontal scroll, RTL-aware.
 * Renders only filters marked `primary: true` from FILTERS_CONFIG[category].
 *
 * Behaviour:
 *  - select/multiselect: each option becomes a chip (toggle-like).
 *  - range/toggle: rendered as a single chip indicating the current value.
 *  - Click a chip → instant URL update via `onToggle`.
 *  - Active chip: filled bg + check icon.
 */
export function QuickFiltersBar({
  category,
  filters,
  onToggle,
  maxOptionsPerField = 6,
}: QuickFiltersBarProps) {
  const primaryFields = useMemo<FilterField[]>(
    () => (FILTERS_CONFIG[category] ?? []).filter((f) => f.primary && (f.type === 'select' || f.type === 'multiselect')),
    [category],
  )

  if (primaryFields.length === 0) return null

  return (
    <div className="relative -mx-3 sm:-mx-6">
      <div
        className="flex gap-2 overflow-x-auto scrollbar-hide px-3 sm:px-6 py-2"
        role="toolbar"
        aria-label="Quick filters"
      >
        {primaryFields.map((field) => {
          const opts = (field.options ?? []).slice(0, maxOptionsPerField)
          const value = filters[field.key]

          if (field.type === 'multiselect') {
            const cur: string[] = typeof value === 'string'
              ? value.split(',').filter(Boolean)
              : Array.isArray(value) ? value : []
            return (
              <FieldGroup key={field.key} label={field.labelAr}>
                {opts.map((opt) => {
                  const active = cur.includes(opt.value)
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.labelAr}
                      active={active}
                      onClick={() => {
                        const next = active
                          ? cur.filter((v) => v !== opt.value)
                          : [...cur, opt.value]
                        onToggle(field.key, next.length ? next.join(',') : null)
                      }}
                    />
                  )
                })}
              </FieldGroup>
            )
          }

          // select
          const cur = typeof value === 'string' ? value : ''
          return (
            <FieldGroup key={field.key} label={field.labelAr}>
              {opts.map((opt) => {
                const active = cur === opt.value
                return (
                  <Chip
                    key={opt.value}
                    label={opt.labelAr}
                    active={active}
                    onClick={() => onToggle(field.key, active ? null : opt.value)}
                  />
                )
              })}
            </FieldGroup>
          )
        })}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <span className="text-[10px] font-semibold text-on-surface-variant/70 whitespace-nowrap me-0.5">
        {label}:
      </span>
      <div className="flex gap-1.5">{children}</div>
    </div>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] whitespace-nowrap',
        'transition-all duration-150 ease-out',
        'border active:scale-95',
        active
          ? 'bg-primary text-on-primary border-primary shadow-sm shadow-primary/20'
          : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-primary/40 hover:text-primary',
      )}
    >
      {active ? <Check size={11} className="shrink-0" /> : null}
      <span className="font-medium">{label}</span>
      {active ? <X size={11} className="shrink-0 opacity-70" /> : null}
    </button>
  )
}
