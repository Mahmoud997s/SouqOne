'use client'

import { useState, useRef, useEffect } from 'react'
import { ArrowUpDown, Check } from 'lucide-react'
import type { SortOption } from '../types/filters.types'

interface SortDropdownProps {
  options: SortOption[]
  value: string
  onChange: (value: string) => void
}

export function SortDropdown({ options, value, onChange }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = options.find(o => o.value === value) ?? options[0]

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  if (options.length <= 1) return null

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/30 text-[12px] text-on-surface hover:border-outline-variant/50 transition-colors"
      >
        <ArrowUpDown size={13} />
        {current?.labelAr ?? 'ترتيب'}
      </button>

      {open && (
        <div className="absolute start-0 top-full mt-1 z-50 min-w-[160px] bg-background border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden py-1">
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 text-[12px] text-on-surface hover:bg-surface-container transition-colors text-start"
            >
              <span>{opt.labelAr}</span>
              {opt.value === value && <Check size={13} className="text-primary shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
