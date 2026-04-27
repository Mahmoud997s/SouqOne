'use client'

import {
  useState, useEffect, useRef, useCallback,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Check, Search } from 'lucide-react'
import type { FilterField } from '../types/filters.types'

//  Props 

interface FilterDropdownProps {
  field: FilterField
  value: string | boolean | null
  onChange: (value: string | boolean | null) => void
  triggerRef: RefObject<HTMLButtonElement | null>
  onClose: () => void
}

//  Position helper 

interface Pos { top: number; right: number; openUp: boolean }

function calcPos(trigger: HTMLElement): Pos {
  const rect = trigger.getBoundingClientRect()
  const gap = 6
  const viewH = window.innerHeight
  const viewW = window.innerWidth
  const spaceBelow = viewH - rect.bottom
  const openUp = spaceBelow < 300 && rect.top > 300

  // RTL: anchor to right edge of trigger
  let right = viewW - rect.right
  if (right + 240 > viewW) right = Math.max(8, viewW - 248)

  return {
    top:    openUp ? rect.top - gap : rect.bottom + gap,
    right,
    openUp,
  }
}

//  Component 

export function FilterDropdown({ field, value, onChange, triggerRef, onClose }: FilterDropdownProps) {
  const t = useTranslations('pages')
  const [pos, setPos] = useState<Pos>({ top: 0, right: 0, openUp: false })
  const [search, setSearch] = useState('')
  const [rangeMin, setRangeMin] = useState('')
  const [rangeMax, setRangeMax] = useState('')
  const boxRef = useRef<HTMLDivElement>(null)

  // init range values from current value ("min|max")
  useEffect(() => {
    if (field.type === 'range' && typeof value === 'string' && value.includes('|')) {
      const [mn, mx] = value.split('|')
      setRangeMin(mn ?? '')
      setRangeMax(mx ?? '')
    }
  }, [field.type, value])

  // position
  useEffect(() => {
    if (triggerRef.current) setPos(calcPos(triggerRef.current))
  }, [triggerRef])

  // close on outside click, Escape, scroll
  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    let scrollStart = window.scrollY
    const onScroll = () => { if (Math.abs(window.scrollY - scrollStart) > 50) handleClose() }
    const onMouseDown = (e: MouseEvent) => {
      if (
        boxRef.current && !boxRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) handleClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('scroll', onScroll)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [handleClose, triggerRef])

  //  Render helpers 

  function renderSelect() {
    const opts = field.options ?? []
    const filtered = search
      ? opts.filter(o => o.labelAr.includes(search) || o.value.toLowerCase().includes(search.toLowerCase()))
      : opts
    return (
      <div className="min-w-[200px] max-h-[280px] overflow-y-auto">
        {opts.length > 7 && (
          <div className="p-2 border-b border-border/30 sticky top-0 bg-background">
            <div className="relative">
              <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t('sfSearchPlaceholder')}
                className="w-full h-8 rounded-lg border border-border text-[12px] pr-8 pl-3 outline-none focus:border-primary"
              />
            </div>
          </div>
        )}
        {filtered.map(opt => {
          const active = value === opt.value
          return (
            <div
              key={opt.value}
              onClick={() => { onChange(active ? null : opt.value); onClose() }}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-secondary/60 cursor-pointer rounded-lg transition-colors text-[13px]"
            >
              <span className={active ? 'text-primary font-medium' : ''}>{opt.labelAr}</span>
              {active && <Check size={14} className="text-primary shrink-0" />}
            </div>
          )
        })}
      </div>
    )
  }

  function renderMultiselect() {
    const opts = field.options ?? []
    const current: string[] = typeof value === 'string'
      ? value.split(',').filter(Boolean)
      : []
    const filtered = search
      ? opts.filter(o => o.labelAr.includes(search))
      : opts
    const toggle = (v: string) => {
      const next = current.includes(v)
        ? current.filter(x => x !== v)
        : [...current, v]
      onChange(next.length ? next.join(',') : null)
    }
    return (
      <div className="min-w-[200px] max-h-[280px] overflow-y-auto">
        {opts.length > 7 && (
          <div className="p-2 border-b border-border/30 sticky top-0 bg-background">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('sfSearchPlaceholder')}
              className="w-full h-8 rounded-lg border border-border text-[12px] px-3 outline-none focus:border-primary"
            />
          </div>
        )}
        {filtered.map(opt => {
          const checked = current.includes(opt.value)
          return (
            <div
              key={opt.value}
              onClick={() => toggle(opt.value)}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/60 cursor-pointer rounded-lg transition-colors text-[13px]"
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-primary border-primary' : 'border-border'}`}>
                {checked && <Check size={10} className="text-white" />}
              </div>
              <span className={checked ? 'text-primary font-medium' : ''}>{opt.labelAr}</span>
            </div>
          )
        })}
      </div>
    )
  }

  function renderRange() {
    return (
      <div className="min-w-[240px] p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block">من</label>
            <input
              type="number"
              value={rangeMin}
              onChange={e => setRangeMin(e.target.value)}
              placeholder={field.min != null ? String(field.min) : ''}
              className="w-full h-9 rounded-lg border border-border px-3 text-[13px] text-right outline-none focus:border-primary"
            />
          </div>
          <span className="text-muted-foreground mt-5"></span>
          <div className="flex-1">
            <label className="text-[11px] text-muted-foreground mb-1 block">إلى</label>
            <input
              type="number"
              value={rangeMax}
              onChange={e => setRangeMax(e.target.value)}
              placeholder={field.max != null ? String(field.max) : ''}
              className="w-full h-9 rounded-lg border border-border px-3 text-[13px] text-right outline-none focus:border-primary"
            />
          </div>
        </div>
        {field.unit && <p className="text-[11px] text-muted-foreground mb-3">{field.unit}</p>}
        <button
          onClick={() => {
            onChange(rangeMin || rangeMax ? `${rangeMin}|${rangeMax}` : null)
            onClose()
          }}
          className="w-full h-9 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors"
        >
          تطبيق
        </button>
      </div>
    )
  }

  function renderToggle() {
    const on = value === 'true'
    return (
      <div className="min-w-[180px] p-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[13px]">{field.labelAr}</span>
          <button
            onClick={() => { onChange(on ? null : 'true'); onClose() }}
            className={`w-11 h-6 rounded-full transition-colors relative ${on ? 'bg-primary' : 'bg-secondary border border-border'}`}
            role="switch"
            aria-checked={on}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-0 right-0.5' : 'translate-x-0 left-0.5'}`} />
          </button>
        </div>
      </div>
    )
  }

  const content = (
    <div
      ref={boxRef}
      style={{
        position: 'fixed',
        zIndex: 9999,
        top:    pos.openUp ? undefined : pos.top,
        bottom: pos.openUp ? window.innerHeight - pos.top : undefined,
        right:  pos.right,
      }}
      className="bg-background border border-outline-variant/30 rounded-2xl shadow-xl p-1"
    >
      {field.type === 'select'      && renderSelect()}
      {field.type === 'multiselect' && renderMultiselect()}
      {field.type === 'range'       && renderRange()}
      {field.type === 'toggle'      && renderToggle()}
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}