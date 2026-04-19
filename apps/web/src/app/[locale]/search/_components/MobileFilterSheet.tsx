'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import clsx from 'clsx';
import { SearchFilters, type FilterState, type FilterSetters } from './SearchFilters';

// ─── Drag-to-dismiss hook ────────────────────────────────────────────────────
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
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setDragY(diff);
  }, []);

  const onTouchEnd = useCallback(() => {
    dragging.current = false;
    if (dragY > 100) onClose();
    setDragY(0);
  }, [dragY, onClose]);

  return { dragY, onTouchStart, onTouchMove, onTouchEnd };
}

// ─── Trigger button ──────────────────────────────────────────────────────────
export function MobileFilterTrigger({
  activeFilterCount,
  total,
  onOpen,
}: {
  activeFilterCount: number;
  total: number;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="sm:hidden w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-outline-variant/20 bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high active:scale-[0.98]"
    >
      <div className="flex items-center gap-2">
        <SlidersHorizontal size={16} className="text-on-surface-variant" />
        <span className="text-sm font-bold">
          الفلاتر
          {activeFilterCount > 0 && (
            <span className="mr-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-error text-on-error text-[10px] font-black">
              {activeFilterCount}
            </span>
          )}
        </span>
      </div>
      <span className="text-xs text-on-surface-variant font-medium">
        {total > 0 ? `${total} نتيجة` : ''}
      </span>
    </button>
  );
}

// ─── Sheet ───────────────────────────────────────────────────────────────────
interface MobileFilterSheetProps {
  open: boolean;
  onClose: () => void;
  total: number;
  activeFilterCount: number;
  clearAllFilters: () => void;
  activeTab: string;
  state: FilterState;
  setters: FilterSetters;
  govOpts: { value: string; label: string }[];
  condOpts: { value: string; label: string }[];
  fuelOpts: { value: string; label: string }[];
  transOpts: { value: string; label: string }[];
  years: string[];
  CAR_MAKES: string[];
  applyFilters: (ov?: Record<string, string>) => void;
  applyNow: (key: string, val: string) => void;
}

export function MobileFilterSheet({
  open, onClose, total, activeFilterCount, clearAllFilters,
  activeTab, state, setters, govOpts, condOpts, fuelOpts, transOpts,
  years, CAR_MAKES, applyFilters, applyNow,
}: MobileFilterSheetProps) {
  const { dragY, onTouchStart, onTouchMove, onTouchEnd } = useDragDismiss(onClose);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  // mount → wait 1 frame → show (triggers CSS transition)
  useEffect(() => {
    if (open) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => { setMounted(false); document.body.style.overflow = ''; }, 320);
      return () => clearTimeout(t);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!mounted) return null;

  const sheetTransform = dragY > 0
    ? `translateY(${dragY}px)`
    : visible ? 'translateY(0)' : 'translateY(100%)';

  return (
    <div className="fixed inset-0 z-[200] sm:hidden">
      {/* Overlay */}
      <div
        onClick={onClose}
        className={clsx(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Sheet */}
      <div
        className="absolute bottom-0 inset-x-0 flex flex-col rounded-t-3xl bg-surface-container-lowest shadow-2xl overflow-hidden"
        style={{
          maxHeight: '90vh',
          transform: sheetTransform,
          transition: dragY > 0 ? 'none' : 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-outline-variant/40" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-outline-variant/10 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-on-surface-variant" />
            <h2 className="text-base font-black text-on-surface">
              الفلاتر
              {activeFilterCount > 0 && (
                <span className="mr-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-error text-on-error text-[10px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-bold text-primary hover:text-primary/70 transition-colors"
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
        </div>

        {/* Scrollable filter body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
          <SearchFilters
            activeTab={activeTab}
            state={state}
            setters={setters}
            govOpts={govOpts}
            condOpts={condOpts}
            fuelOpts={fuelOpts}
            transOpts={transOpts}
            years={years}
            CAR_MAKES={CAR_MAKES}
            applyFilters={applyFilters}
            applyNow={applyNow}
            activeFilterCount={activeFilterCount}
            clearAllFilters={clearAllFilters}
            dark={false}
          />
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 px-4 py-4 border-t border-outline-variant/10 bg-surface-container-lowest">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-primary text-on-primary py-3.5 rounded-2xl text-sm font-black hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {total > 0 ? `عرض النتائج (${total})` : 'عرض النتائج'}
          </button>
        </div>
      </div>
    </div>
  );
}
