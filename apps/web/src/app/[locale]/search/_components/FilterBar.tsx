'use client';

import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useDropdownPortal, DropdownPortal } from './DropdownPortal';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterDef {
  key: string;                         // URL param key
  label: string;                       // chip label when idle
  type: 'enum' | 'range' | 'boolean';
  options?: { value: string; label: string }[];   // for enum
  unit?: string;                       // for range e.g. 'OMR'
  // paired key for range (e.g. minPrice ↔ maxPrice)
  pairedKey?: string;
  pairedLabel?: string;
}

export interface FilterBarProps {
  filters: FilterDef[];
  values: Record<string, string>;      // current URL param values
  onApply: (ov: Record<string, string>) => void;
  activeTab: string;
  total: number;
  // "all filters" modal content
  allFiltersContent: React.ReactNode;
}

// ─── Shared dropdown close registry (same singleton as DropdownPortal) ────────
// We re-use the pattern from DropdownPortal.tsx but the registry is imported
// indirectly via the hook — each chip uses useDropdownPortal which registers itself.

// ─── Single filter chip + its dropdown ───────────────────────────────────────

function FilterChip({
  def, values, onApply,
}: {
  def: FilterDef;
  values: Record<string, string>;
  onApply: (ov: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const handleClose = useCallback(() => { setOpen(false); setSearch(''); }, []);
  const { triggerRef, pos } = useDropdownPortal(open, handleClose);

  // Derive active value label
  const currentVal = values[def.key] ?? '';
  const currentPaired = def.pairedKey ? (values[def.pairedKey] ?? '') : '';
  const isActive = !!currentVal || !!currentPaired || (def.type === 'boolean' && currentVal === 'true');

  let activeLabel = '';
  if (def.type === 'enum' && currentVal) {
    activeLabel = def.options?.find(o => o.value === currentVal)?.label ?? currentVal;
  } else if (def.type === 'range') {
    if (currentVal && currentPaired) activeLabel = `${currentVal}–${currentPaired}`;
    else if (currentVal) activeLabel = `من ${currentVal}`;
    else if (currentPaired) activeLabel = `إلى ${currentPaired}`;
  } else if (def.type === 'boolean' && currentVal === 'true') {
    activeLabel = def.label;
  }

  function clearChip(e: React.MouseEvent) {
    e.stopPropagation();
    const ov: Record<string, string> = { [def.key]: '' };
    if (def.pairedKey) ov[def.pairedKey] = '';
    onApply(ov);
  }

  const panelCls = 'rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-xl overflow-hidden';

  return (
    <div className="shrink-0">
      {/* Trigger chip */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className={clsx(
          'flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          isActive
            ? 'bg-primary border-primary text-white shadow-sm'
            : 'bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-primary/40 hover:bg-surface-container'
        )}
      >
        <span>{isActive && activeLabel ? activeLabel : def.label}</span>
        {isActive ? (
          <span
            role="button"
            aria-label="إلغاء الفلتر"
            onClick={clearChip}
            className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
          >
            <X size={9} strokeWidth={3} />
          </span>
        ) : (
          <ChevronDown size={11} strokeWidth={2.5} className={clsx('transition-transform duration-200', open && 'rotate-180')} />
        )}
      </button>

      {/* Dropdown content via portal */}
      <DropdownPortal
        open={open}
        pos={pos}
        onClose={handleClose}
        triggerRef={triggerRef}
        className={panelCls}
      >
        <DropdownContent
          def={def}
          values={values}
          search={search}
          setSearch={setSearch}
          onApply={ov => { onApply(ov); handleClose(); }}
        />
      </DropdownPortal>
    </div>
  );
}

// ─── Dropdown content by type ─────────────────────────────────────────────────

function DropdownContent({
  def, values, search, setSearch, onApply,
}: {
  def: FilterDef;
  values: Record<string, string>;
  search: string;
  setSearch: (s: string) => void;
  onApply: (ov: Record<string, string>) => void;
}) {
  const currentVal = values[def.key] ?? '';
  const [minDraft, setMinDraft] = useState(values[def.key] ?? '');
  const [maxDraft, setMaxDraft] = useState(def.pairedKey ? (values[def.pairedKey] ?? '') : '');

  // Enum dropdown
  if (def.type === 'enum' && def.options) {
    const many = def.options.length > 5;
    const filtered = def.options.filter(o =>
      !search || o.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div style={{ minWidth: 220, maxWidth: 320 }}>
        {many && (
          <div className="p-2 border-b border-outline-variant/10">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-full text-xs px-2.5 py-1.5 rounded-lg outline-none bg-surface-container text-on-surface placeholder:text-on-surface-variant/50"
            />
          </div>
        )}
        <div className="max-h-[260px] overflow-y-auto py-1">
          {currentVal && (
            <button
              type="button"
              onClick={() => onApply({ [def.key]: '' })}
              className="w-full text-right px-4 py-2 text-xs font-bold text-on-surface-variant/60 hover:bg-surface-container transition-colors"
            >
              إلغاء التحديد
            </button>
          )}
          {filtered.length === 0 && (
            <p className="px-4 py-2 text-xs text-on-surface-variant/50">لا نتائج</p>
          )}
          {filtered.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => onApply({ [def.key]: o.value })}
              className={clsx(
                'w-full flex items-center justify-between px-4 py-2 text-xs font-bold transition-colors',
                currentVal === o.value
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface hover:bg-surface-container'
              )}
            >
              <span>{o.label}</span>
              {currentVal === o.value && (
                <span className="material-symbols-outlined text-sm text-primary">check</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Range dropdown
  if (def.type === 'range') {
    return (
      <div style={{ minWidth: 240 }} className="p-4 space-y-3">
        <p className="text-xs font-black text-on-surface mb-2">{def.label}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[10px] text-on-surface-variant/60 font-bold block mb-1">من</label>
            <input
              type="number"
              value={minDraft}
              onChange={e => setMinDraft(e.target.value)}
              placeholder="0"
              className="w-full text-xs px-2.5 py-2 rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-on-surface-variant/60 font-bold block mb-1">إلى</label>
            <input
              type="number"
              value={maxDraft}
              onChange={e => setMaxDraft(e.target.value)}
              placeholder="∞"
              className="w-full text-xs px-2.5 py-2 rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface outline-none focus:border-primary/50"
            />
          </div>
          {def.unit && <span className="text-[10px] text-on-surface-variant/60 font-bold self-end pb-2">{def.unit}</span>}
        </div>
        <button
          type="button"
          onClick={() => {
            const ov: Record<string, string> = { [def.key]: minDraft };
            if (def.pairedKey) ov[def.pairedKey] = maxDraft;
            onApply(ov);
          }}
          className="w-full bg-primary text-on-primary text-xs font-black py-2 rounded-xl hover:brightness-110 transition-all"
        >
          تطبيق
        </button>
      </div>
    );
  }

  // Boolean toggle
  if (def.type === 'boolean') {
    const active = currentVal === 'true';
    return (
      <div style={{ minWidth: 200 }} className="p-3">
        <button
          type="button"
          onClick={() => onApply({ [def.key]: active ? '' : 'true' })}
          className="w-full flex items-center justify-between gap-3 px-2 py-1"
        >
          <span className="text-xs font-bold text-on-surface">{def.label}</span>
          <div className={clsx(
            'relative w-10 h-5 rounded-full transition-colors duration-200 shrink-0',
            active ? 'bg-primary' : 'bg-outline-variant/40'
          )}>
            <div className={clsx(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200',
              active ? 'right-0.5' : 'right-5'
            )} />
          </div>
        </button>
      </div>
    );
  }

  return null;
}

// ─── "كل الفلاتر" modal ───────────────────────────────────────────────────────

function AllFiltersModal({
  open, onClose, total, children,
}: {
  open: boolean; onClose: () => void; total: number; children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => { setMounted(false); document.body.style.overflow = ''; }, 280);
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ transition: reduced ? 'none' : 'opacity 250ms ease', opacity: visible ? 1 : 0 }}
        className="absolute inset-0 bg-black/50"
      />
      {/* Panel */}
      <div
        style={{
          transition: reduced ? 'none' : 'transform 300ms cubic-bezier(0.32,0.72,0,1), opacity 280ms ease',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
          opacity: visible ? 1 : 0,
        }}
        className="relative z-10 w-full sm:max-w-2xl max-h-[90dvh] flex flex-col bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
          >
            <X size={16} />
          </button>
          <h2 className="text-base font-black text-on-surface">كل الفلاتر</h2>
          <div className="w-8" />
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>
        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-outline-variant/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-primary text-on-primary py-3.5 rounded-2xl text-sm font-black hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {total > 0 ? `عرض النتائج (${total})` : 'عرض النتائج'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── FilterBar ────────────────────────────────────────────────────────────────

export function FilterBar({
  filters, values, onApply, activeTab, total, allFiltersContent,
}: FilterBarProps) {
  const [allOpen, setAllOpen] = useState(false);

  // Close all-filters modal on tab change
  useEffect(() => { setAllOpen(false); }, [activeTab]);

  if (filters.length === 0) return null;

  return (
    <>
      <div className="sticky top-0 z-40 bg-surface-container-lowest/95 backdrop-blur-sm border-b border-outline-variant/10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5" dir="rtl">
            {filters.map(def => (
              <FilterChip key={def.key} def={def} values={values} onApply={onApply} />
            ))}

            {/* Divider */}
            <div className="shrink-0 w-px h-5 bg-outline-variant/20 mx-0.5" />

            {/* "كل الفلاتر" chip */}
            <button
              type="button"
              onClick={() => setAllOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-outline-variant/30 bg-surface-container text-on-surface text-xs font-bold whitespace-nowrap hover:border-primary/40 hover:bg-surface-container-high transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <SlidersHorizontal size={12} strokeWidth={2.5} />
              كل الفلاتر
            </button>
          </div>
        </div>
      </div>

      <AllFiltersModal open={allOpen} onClose={() => setAllOpen(false)} total={total}>
        {allFiltersContent}
      </AllFiltersModal>
    </>
  );
}
