'use client'

import { useState, useEffect } from 'react'
import { X, ChevronDown } from 'lucide-react'
import type { ListingCategory } from '../types/category.types'
import type { ActiveFilters, FilterField } from '../types/filters.types'
import { FILTERS_CONFIG } from '../config/filters.config'

//  Props 

interface FilterSheetProps {
  category: ListingCategory
  filters: ActiveFilters
  onFilterChange: (key: string, value: string | boolean | null) => void
  onClearAll: () => void
  onClose: () => void
  total: number
}

//  Section 

function Section({
  field,
  value,
  onChange,
}: {
  field: FilterField
  value: string | string[] | undefined
  onChange: (v: string | boolean | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [rangeMin, setRangeMin] = useState('')
  const [rangeMax, setRangeMax] = useState('')

  useEffect(() => {
    if (field.type === 'range' && typeof value === 'string' && value.includes('|')) {
      const [mn, mx] = value.split('|')
      setRangeMin(mn ?? '')
      setRangeMax(mx ?? '')
    }
  }, [field.type, value])

  const hasVal = value !== undefined && value !== '' && value !== null

  function renderContent() {
    if (field.type === 'select') {
      const opts = field.options ?? []
      const cur = (value as string) ?? ''
      return (
        <div className="grid grid-cols-2 gap-2">
          {opts.map(opt => {
            const active = cur === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onChange(active ? null : opt.value)}
                className={`px-3 py-2 rounded-xl text-[13px] text-center transition-all cursor-pointer ${
                  active
                    ? 'border-2 border-primary bg-primary/8 text-primary font-medium'
                    : 'border border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                {opt.labelAr}
              </button>
            )
          })}
        </div>
      )
    }

    if (field.type === 'multiselect') {
      const opts = field.options ?? []
      const cur: string[] = typeof value === 'string'
        ? value.split(',').filter(Boolean)
        : (Array.isArray(value) ? value : [])
      const toggle = (v: string) => {
        const next = cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v]
        onChange(next.length ? next.join(',') : null)
      }
      return (
        <div className="grid grid-cols-2 gap-2">
          {opts.map(opt => {
            const checked = cur.includes(opt.value)
            return (
              <button
                key={opt.value}
                onClick={() => toggle(opt.value)}
                className={`px-3 py-2 rounded-xl text-[13px] text-center transition-all cursor-pointer ${
                  checked
                    ? 'border-2 border-primary bg-primary/8 text-primary font-medium'
                    : 'border border-border text-foreground hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                {opt.labelAr}
              </button>
            )
          })}
        </div>
      )
    }

    if (field.type === 'range') {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">من</label>
              <input
                type="number"
                value={rangeMin}
                onChange={e => setRangeMin(e.target.value)}
                placeholder={field.min != null ? String(field.min) : ''}
                className="w-full h-10 rounded-xl border border-border px-3 text-[13px] text-right bg-background focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground mb-1 block">إلى</label>
              <input
                type="number"
                value={rangeMax}
                onChange={e => setRangeMax(e.target.value)}
                placeholder={field.max != null ? String(field.max) : ''}
                className="w-full h-10 rounded-xl border border-border px-3 text-[13px] text-right bg-background focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
          <button
            onClick={() => onChange(rangeMin || rangeMax ? `${rangeMin}|${rangeMax}` : null)}
            className="w-full h-9 rounded-xl bg-primary/10 text-primary text-[13px] font-medium hover:bg-primary/20 transition-colors"
          >
            تطبيق
          </button>
        </div>
      )
    }

    if (field.type === 'toggle') {
      const on = value === 'true'
      return (
        <div className="flex items-center justify-between py-1">
          <span className="text-[13px] text-foreground">{field.labelAr}</span>
          <button
            onClick={() => onChange(on ? null : 'true')}
            className={`w-11 h-6 rounded-full cursor-pointer transition-colors relative ${on ? 'bg-primary' : 'bg-secondary border border-border'}`}
            role="switch"
            aria-checked={on}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-[-22px] right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      )
    }

    return null
  }

  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-full cursor-pointer py-4 hover:text-primary transition-colors"
      >
        <div className="flex items-center gap-2">
          {hasVal && <span className="w-2 h-2 rounded-full bg-primary" />}
          <span className="text-[14px] font-medium text-foreground">{field.labelAr}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-4">{renderContent()}</div>}
    </div>
  )
}

//  Main component 

export function FilterSheet({ category, filters, onFilterChange, onClearAll, onClose, total }: FilterSheetProps) {
  const config = FILTERS_CONFIG[category]
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-200 ${mounted ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-background rounded-t-3xl max-h-[90dvh] flex flex-col
          shadow-[0_-4px_32px_rgba(0,0,0,0.12)]
          transition-transform duration-300
          ${mounted ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full bg-border mx-auto mt-3 mb-2" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/40">
          <button
            onClick={() => { onClearAll() }}
            className="text-[13px] text-primary font-medium hover:text-primary/80 transition-colors"
          >
            مسح الكل
          </button>
          <span className="text-[16px] font-medium text-foreground">الفلاتر</span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
          {config.map(field => (
            <Section
              key={field.key}
              field={field}
              value={filters[field.key] as string | string[] | undefined}
              onChange={v => onFilterChange(field.key, v)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/30 bg-background/95 backdrop-blur-sm">
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl bg-primary text-white text-[14px] font-medium hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/20"
          >
            {total > 0 ? `عرض ${total.toLocaleString('en-US')} نتيجة` : 'تطبيق الفلاتر'}
          </button>
        </div>
      </div>
    </>
  )
}