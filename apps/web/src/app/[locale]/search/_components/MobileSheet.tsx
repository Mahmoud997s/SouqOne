'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { FilterDef } from './FilterBar';

// ─── Drag-to-dismiss ──────────────────────────────────────────────────────────
function useDragDismiss(onClose: () => void) {
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const dragging = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return;
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    setDragY(dy);
  }, []);

  const onTouchEnd = useCallback(() => {
    dragging.current = false;
    if (dragY > 120) onClose();
    setDragY(0);
  }, [dragY, onClose]);

  return { dragY, onTouchStart, onTouchMove, onTouchEnd };
}

// ─── Inline accordion filter group (no nested dropdowns) ─────────────────────
function SheetFilterGroup({
  def, values, onApply,
}: {
  def: FilterDef;
  values: Record<string, string>;
  onApply: (ov: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [minDraft, setMinDraft] = useState(values[def.key] ?? '');
  const [maxDraft, setMaxDraft] = useState(def.pairedKey ? (values[def.pairedKey] ?? '') : '');

  // sync drafts when values change externally
  useEffect(() => { setMinDraft(values[def.key] ?? ''); }, [values, def.key]);
  useEffect(() => { setMaxDraft(def.pairedKey ? (values[def.pairedKey] ?? '') : ''); }, [values, def.pairedKey]);

  const currentVal = values[def.key] ?? '';
  const currentPaired = def.pairedKey ? (values[def.pairedKey] ?? '') : '';
  const isActive = !!currentVal || !!currentPaired;
  const activeCount = [currentVal, currentPaired].filter(Boolean).length;

  return (
    <div className="border border-outline-variant/15 rounded-2xl overflow-hidden">
      {/* Group header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-right bg-surface-container-lowest hover:bg-surface-container transition-colors"
      >
        <span className="flex-1 text-sm font-black text-on-surface">{def.label}</span>
        {isActive && activeCount > 0 && (
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-primary text-on-primary shrink-0">
            {activeCount}
          </span>
        )}
        <ChevronDown
          size={16}
          strokeWidth={2}
          className={clsx('shrink-0 text-on-surface-variant transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {/* Inline options — no nested dropdowns */}
      {open && (
        <div className="border-t border-outline-variant/10 bg-surface-container-lowest">
          {def.type === 'enum' && def.options && (
            <div className="p-3 space-y-1">
              {def.options.length > 5 && (
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="بحث..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-outline-variant/20 bg-surface-container outline-none mb-2"
                />
              )}
              {/* Deselect */}
              {currentVal && (
                <button
                  type="button"
                  onClick={() => { onApply({ [def.key]: '' }); setOpen(false); }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-on-surface-variant/60 hover:bg-surface-container rounded-xl transition-colors"
                >
                  إلغاء التحديد
                </button>
              )}
              {/* Pill grid for short lists, list for long */}
              {def.options.length <= 5 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {def.options.map(o => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => { onApply({ [def.key]: currentVal === o.value ? '' : o.value }); if (currentVal !== o.value) setOpen(false); }}
                      className={clsx(
                        'px-4 py-2 rounded-full text-xs font-bold border transition-all',
                        currentVal === o.value
                          ? 'bg-primary border-primary text-on-primary'
                          : 'bg-surface-container border-outline-variant/20 text-on-surface hover:border-primary/40'
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="max-h-52 overflow-y-auto -mx-1">
                  {def.options
                    .filter(o => !search || o.label.toLowerCase().includes(search.toLowerCase()))
                    .map(o => (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => { onApply({ [def.key]: currentVal === o.value ? '' : o.value }); if (currentVal !== o.value) setOpen(false); }}
                        className={clsx(
                          'w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold rounded-xl transition-colors',
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
              )}
            </div>
          )}

          {def.type === 'range' && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-on-surface-variant/60 font-bold block">من</label>
                  <input
                    type="number"
                    value={minDraft}
                    onChange={e => setMinDraft(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-on-surface-variant/60 font-bold block">إلى</label>
                  <input
                    type="number"
                    value={maxDraft}
                    onChange={e => setMaxDraft(e.target.value)}
                    placeholder="∞"
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container text-on-surface outline-none focus:border-primary/50"
                  />
                </div>
                {def.unit && (
                  <span className="text-[10px] text-on-surface-variant/60 font-bold self-end pb-2.5">{def.unit}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const ov: Record<string, string> = { [def.key]: minDraft };
                  if (def.pairedKey) ov[def.pairedKey] = maxDraft;
                  onApply(ov);
                  setOpen(false);
                }}
                className="w-full bg-primary text-on-primary text-xs font-black py-2.5 rounded-xl hover:brightness-110 transition-all"
              >
                تطبيق
              </button>
            </div>
          )}

          {def.type === 'boolean' && (
            <div className="p-4">
              <button
                type="button"
                onClick={() => {
                  const next = currentVal !== 'true';
                  onApply({ [def.key]: next ? 'true' : '' });
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3"
              >
                <span className="text-sm font-bold text-on-surface">{def.label}</span>
                <div className={clsx(
                  'relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200',
                  currentVal === 'true' ? 'bg-primary' : 'bg-outline-variant/40'
                )}>
                  <div className={clsx(
                    'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200',
                    currentVal === 'true' ? 'right-1' : 'right-6'
                  )} />
                </div>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MobileSheet ──────────────────────────────────────────────────────────────

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterDef[];
  values: Record<string, string>;
  onApply: (ov: Record<string, string>) => void;
  onClearAll: () => void;
  total: number;
  activeFilterCount: number;
}

export function MobileSheet({
  open, onClose, filters, values, onApply, onClearAll, total, activeFilterCount,
}: MobileSheetProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { dragY, onTouchStart, onTouchMove, onTouchEnd } = useDragDismiss(onClose);

  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => { setMounted(false); document.body.style.overflow = ''; }, 300);
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  const sheetTransform = dragY > 0
    ? `translateY(${dragY}px)`
    : visible ? 'translateY(0)' : 'translateY(100%)';

  const sheetTransition = reduced || dragY > 0
    ? 'none'
    : visible
      ? 'transform 300ms cubic-bezier(0.32,0.72,0,1)'
      : 'transform 250ms ease-in';

  return createPortal(
    <div className="fixed inset-0 z-[200] sm:hidden">
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          transition: reduced ? 'none' : visible ? 'opacity 300ms ease' : 'opacity 250ms ease-in',
          opacity: visible ? 1 : 0,
        }}
        className="absolute inset-0 bg-black/50"
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 inset-x-0 flex flex-col rounded-t-3xl bg-surface-container-lowest shadow-2xl"
        style={{ maxHeight: '90dvh', transform: sheetTransform, transition: sheetTransition }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-outline-variant/40" />
        </div>

        {/* Header (sticky inside sheet) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                className="text-xs font-bold text-error hover:text-error/70 transition-colors"
              >
                مسح الكل
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <h2 className="text-base font-black text-on-surface">
            الفلاتر
            {activeFilterCount > 0 && (
              <span className="mr-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-on-primary text-[10px] font-black">
                {activeFilterCount}
              </span>
            )}
          </h2>
        </div>

        {/* Scrollable filter groups */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-2">
          {filters.map(def => (
            <SheetFilterGroup key={def.key} def={def} values={values} onApply={onApply} />
          ))}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-4 border-t border-outline-variant/10">
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

// ─── Sticky bottom trigger bar ────────────────────────────────────────────────

interface MobileFilterBarProps {
  activeFilterCount: number;
  sortValue: string;
  sortOptions: { value: string; label: string }[];
  onOpenFilters: () => void;
  onApplySort: (v: string) => void;
}

export function MobileFilterBar({
  activeFilterCount, sortValue, sortOptions, onOpenFilters, onApplySort,
}: MobileFilterBarProps) {
  const [sortOpen, setSortOpen] = useState(false);
  const currentSort = sortOptions.find(o => o.value === sortValue)?.label ?? 'الأحدث';

  return (
    <div
      className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-surface-container-lowest/95 backdrop-blur-sm border-t border-outline-variant/10 px-4 py-3 flex items-center gap-2 safe-area-inset-bottom"
      dir="rtl"
    >
      {/* Filters button */}
      <button
        type="button"
        onClick={onOpenFilters}
        className={clsx(
          'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl border text-sm font-bold transition-all',
          activeFilterCount > 0
            ? 'bg-primary border-primary text-on-primary'
            : 'border-outline-variant/30 text-on-surface hover:bg-surface-container'
        )}
      >
        <SlidersHorizontal size={15} strokeWidth={2} />
        <span>الفلاتر</span>
        {activeFilterCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-white/20 text-[10px] font-black">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Sort button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setSortOpen(o => !o)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-outline-variant/30 text-sm font-bold text-on-surface hover:bg-surface-container transition-colors"
        >
          <span>{currentSort}</span>
          <ChevronDown size={13} strokeWidth={2} className={clsx('transition-transform duration-200', sortOpen && 'rotate-180')} />
        </button>
        {sortOpen && (
          <div className="absolute bottom-full mb-2 left-0 min-w-[160px] bg-surface-container-lowest rounded-2xl border border-outline-variant/20 shadow-xl overflow-hidden z-10">
            {sortOptions.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onApplySort(o.value); setSortOpen(false); }}
                className={clsx(
                  'w-full text-right px-4 py-2.5 text-sm font-bold transition-colors',
                  sortValue === o.value
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface hover:bg-surface-container'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
