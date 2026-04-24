'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { clsx } from 'clsx'
import { Link } from '@/i18n/navigation'
import type { ListingCategory } from '../types/category.types'
import { VALID_CATEGORIES, CATEGORY_META } from '../types/category.types'
import type { ActiveFilters, FilterField } from '../types/filters.types'
import { FILTERS_CONFIG } from '../config/filters.config'

// ── Helpers ──────────────────────────────────────────────────────────────────

function hasValue(value: string | string[] | undefined): boolean {
  if (value === undefined || value === null) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value !== '' && value !== '|'
  return false
}

function countActive(config: FilterField[], filters: ActiveFilters): number {
  return config.filter(f => hasValue(filters[f.key] as string | string[] | undefined)).length
}

// ── Section Component ────────────────────────────────────────────────────────

function SidebarSection({
  field,
  value,
  onChange,
  defaultOpen = false,
  t,
}: {
  field: FilterField
  value: string | string[] | undefined
  onChange: (v: string | boolean | null) => void
  defaultOpen?: boolean
  t: (key: string) => string
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [rangeMin, setRangeMin] = useState('')
  const [rangeMax, setRangeMax] = useState('')
  const [optionSearch, setOptionSearch] = useState('')

  const hasVal = hasValue(value as string | string[] | undefined)

  useEffect(() => {
    if (field.type === 'range' && typeof value === 'string' && value.includes('|')) {
      const [mn, mx] = value.split('|')
      setRangeMin(mn ?? '')
      setRangeMax(mx ?? '')
    }
  }, [field.type, value])

  function renderContent() {
    // ── Select (Radio) ──
    if (field.type === 'select') {
      const opts = field.options ?? []
      const cur = (value as string) ?? ''
      return (
        <div className="space-y-2">
          {/* All option */}
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="radio"
              checked={!cur}
              onChange={() => onChange(null)}
              className="w-3.5 h-3.5 text-primary border-outline-variant/60 focus:ring-primary/20 bg-background accent-primary"
            />
            <span className="text-[12px] text-on-surface-variant group-hover:text-on-surface transition-colors">
              {t('all')}
            </span>
          </label>

          {/* Other options */}
          {opts.map(opt => (
            <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                checked={cur === opt.value}
                onChange={() => onChange(opt.value)}
                className="w-3.5 h-3.5 text-primary border-outline-variant/60 focus:ring-primary/20 bg-background accent-primary"
              />
              <span className={clsx(
                "text-[12px] transition-colors",
                cur === opt.value
                  ? "text-on-surface font-medium"
                  : "text-on-surface-variant group-hover:text-on-surface"
              )}>
                {opt.labelAr}
              </span>
            </label>
          ))}
        </div>
      )
    }

    // ── Multiselect (Checkbox) ──
    if (field.type === 'multiselect') {
      const opts = field.options ?? []
      const cur: string[] = typeof value === 'string'
        ? value.split(',').filter(Boolean)
        : (Array.isArray(value) ? value : [])
      
      const filteredOptions = opts.filter(o => 
        o.labelAr.toLowerCase().includes(optionSearch.toLowerCase())
      )

      return (
        <div className="flex flex-col">
          {opts.length > 6 && (
            <div className="relative mb-3">
              <input
                placeholder={t('search')}
                value={optionSearch}
                onChange={e => setOptionSearch(e.target.value)}
                className="w-full h-8 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 text-[11px] focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto premium-scrollbar">
            {filteredOptions.map(opt => {
              const isChecked = cur.includes(opt.value)
              return (
                <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      const next = isChecked ? cur.filter(v => v !== opt.value) : [...cur, opt.value]
                      onChange(next.length ? next.join(',') : null)
                    }}
                    className="w-3.5 h-3.5 rounded text-primary border-outline-variant/60 focus:ring-primary/20 accent-primary bg-background"
                  />
                  <span className={clsx(
                    "text-[12px] transition-colors",
                    isChecked
                      ? "text-on-surface font-medium"
                      : "text-on-surface-variant group-hover:text-on-surface"
                  )}>
                    {opt.labelAr}
                  </span>
                </label>
              )
            })}
            {filteredOptions.length === 0 && (
              <span className="text-[11px] text-on-surface-variant">{t('noResults')}</span>
            )}
          </div>
        </div>
      )
    }

    // ── Range ──
    if (field.type === 'range') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1">
                {t('from')} {field.unit ? `(${field.unit})` : ''}
              </label>
              <input
                type="number"
                placeholder={field.min != null ? String(field.min) : ''}
                value={rangeMin}
                onChange={e => setRangeMin(e.target.value)}
                onBlur={() => onChange(rangeMin || rangeMax ? `${rangeMin}|${rangeMax}` : null)}
                onKeyDown={e => {
                  if (e.key === 'Enter') onChange(rangeMin || rangeMax ? `${rangeMin}|${rangeMax}` : null)
                }}
                className="w-full h-8 rounded-lg border border-outline-variant/60 bg-background px-2.5 text-[12px] text-right focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] text-on-surface-variant block mb-1">
                {t('to')} {field.unit ? `(${field.unit})` : ''}
              </label>
              <input
                type="number"
                placeholder={field.max != null ? String(field.max) : ''}
                value={rangeMax}
                onChange={e => setRangeMax(e.target.value)}
                onBlur={() => onChange(rangeMin || rangeMax ? `${rangeMin}|${rangeMax}` : null)}
                onKeyDown={e => {
                  if (e.key === 'Enter') onChange(rangeMin || rangeMax ? `${rangeMin}|${rangeMax}` : null)
                }}
                className="w-full h-8 rounded-lg border border-outline-variant/60 bg-background px-2.5 text-[12px] text-right focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </div>
      )
    }

    // ── Toggle ──
    if (field.type === 'toggle') {
      const on = value === 'true'
      return (
        <div className="flex items-center justify-between py-1">
          <span className="text-[12px] text-on-surface-variant">{field.labelAr}</span>
          <button
            onClick={() => onChange(on ? null : 'true')}
            className={clsx(
              "relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer",
              on ? "bg-primary" : "bg-outline-variant/80"
            )}
            role="switch"
            aria-checked={on}
          >
            <span className={clsx(
              "absolute top-0.5 start-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
              on ? "translate-x-4 rtl:-translate-x-4" : "translate-x-0"
            )} />
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="border-b border-outline-variant/30 last:border-0">
      <button
        onClick={() => setOpen(p => !p)}
        className="flex items-center justify-between w-full py-3 group cursor-pointer"
      >
        <span className="text-[12px] font-semibold text-on-surface group-hover:text-primary transition-colors flex items-center gap-1.5">
          {hasVal && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
          {field.labelAr}
        </span>
        <ChevronDown
          size={14}
          className={clsx(
            "text-on-surface-variant transition-transform duration-200",
            !open && "-rotate-90"
          )}
        />
      </button>
      
      <div className={clsx(
        "overflow-hidden transition-all duration-200",
        open ? "max-h-[400px] pt-1 pb-4 opacity-100" : "max-h-0 opacity-0"
      )}>
        {renderContent()}
      </div>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────────────────────────

interface FilterSidebarProps {
  category: ListingCategory
  filters: ActiveFilters
  onFilterChange: (key: string, value: string | boolean | null) => void
  onClearAll: () => void
}

export function FilterSidebar({
  category,
  filters,
  onFilterChange,
  onClearAll,
}: FilterSidebarProps) {
  const config = FILTERS_CONFIG[category]
  const activeCount = countActive(config, filters)
  const t = useTranslations('listings')

  return (
    <aside className="hidden lg:block w-[308px] flex-shrink-0 self-start sticky top-[100px] space-y-3">

      {/* ── Categories Card ── */}
      <div className="bg-orange-50/60 border border-outline-variant/50 rounded-xl p-4">
        <p className="text-[13px] font-bold text-on-surface mb-3">{t('categories')}</p>
        <ul className="space-y-1">
          {VALID_CATEGORIES.map(cat => {
            const m = CATEGORY_META[cat]
            const isActive = cat === category
            return (
              <li key={cat}>
                <Link
                  href={`/browse/${cat}`}
                  className={clsx(
                    "flex items-center justify-between w-full px-2 py-1.5 rounded-lg text-[12px] transition-colors",
                    isActive
                      ? "bg-orange-500/15 text-orange-700 font-semibold"
                      : "text-on-surface-variant hover:bg-orange-500/8 hover:text-on-surface"
                  )}
                >
                  <span>{m.labelAr}</span>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      {/* ── Filters Card ── */}
      <div className="bg-background border border-outline-variant/50 rounded-xl p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[14px] font-semibold text-on-surface flex items-center gap-1.5">
            <SlidersHorizontal size={15} className="text-primary" />
            {t('filters')}
          </span>
          {activeCount > 0 && (
            <button
              onClick={onClearAll}
              className="text-[11px] text-primary hover:underline font-medium transition-colors cursor-pointer"
            >
              {t('clearAll')}
            </button>
          )}
        </div>

        {/* Sections */}
        <div>
          {config.map((field, i) => (
            <SidebarSection
              key={field.key}
              field={field}
              value={filters[field.key] as string | string[] | undefined}
              onChange={v => onFilterChange(field.key, v)}
              defaultOpen={i < 3 || hasValue(filters[field.key] as string | string[] | undefined)}
              t={t}
            />
          ))}
        </div>

      </div>
    </aside>
  )
}
