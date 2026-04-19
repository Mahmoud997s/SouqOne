'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─────────────────────────────────────────────────────────────────────────────
// OVERFLOW / TRANSFORM AUDIT — search filter codebase
// ─────────────────────────────────────────────────────────────────────────────
//
// Elements with overflow:hidden / overflow:scroll that clip absolute dropdowns:
//   [FIXED by portal]  page.tsx:434   <section overflow-hidden>  (hero section)
//   [FIXED by portal]  page.tsx:495   <div max-h-[60vh] overflow-y-auto>  (desktop filter column)
//   [FIXED by portal]  page.tsx:450   <div overflow-hidden>  (search input) — no dropdowns inside, safe
//   [FIXED by portal]  SearchFilters.tsx:264  FilterGroup <div overflow-hidden> — accordion wrapper
//   [mobile=accordion] MobileFilterSheet.tsx:143  sheet <div overflow-hidden> — mobile uses inline path, safe
//   [mobile=accordion] MobileFilterSheet.tsx:192  scrollable body overflow-y-auto — inline accordions, safe
//
// Elements with CSS transform that BREAK position:fixed children:
//   [⚠ CRITICAL]  MobileFilterSheet.tsx:146  sheet div style={{ transform: sheetTransform }}
//                 → All SearchableSelect inside BottomSheet live in dark=true path,
//                   which uses inline accordion (no portal at all). SAFE — no fix needed.
//   [harmless]    ActiveFilters.tsx:54   FilterChip span transform:scale — no dropdowns inside
//   [harmless]    ActiveFilters.tsx:112  row wrapper transform:translateY — no dropdowns inside
//   [harmless]    page.tsx:592   card image group-hover:scale-105 — no dropdowns inside
//
// Desktop portal path (dark=false):
//   Hero <section> has NO transform — only overflow:hidden + relative.
//   position:fixed is therefore safe for all desktop dropdowns.
//
// Defensive measure: hasTransformAncestor() walks the DOM at render time.
//   If a transform ancestor IS found (future-proof), the portal switches to
//   position:absolute with document-origin coordinates automatically.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Shared open-dropdown registry (one open at a time) ──────────────────────
type CloseFn = () => void;
const registry = new Set<CloseFn>();

function registerDropdown(close: CloseFn) {
  registry.forEach(fn => { if (fn !== close) fn(); });
  registry.add(close);
}
function unregisterDropdown(close: CloseFn) {
  registry.delete(close);
}

// ─── Detect transform ancestor ───────────────────────────────────────────────
// position:fixed is broken when any ancestor has a CSS transform applied.
// Walk up the DOM tree to find such an ancestor.
function hasTransformAncestor(el: HTMLElement): boolean {
  let node: HTMLElement | null = el.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const t = style.transform;
    const wt = style.webkitTransform;
    if ((t && t !== 'none') || (wt && wt !== 'none')) return true;
    node = node.parentElement;
  }
  return false;
}

// ─── Position type ────────────────────────────────────────────────────────────
interface DropdownPos {
  /** viewport-relative bottom edge of trigger (= top of dropdown in fixed mode) */
  top: number;
  /** document-absolute top edge of trigger bottom (for absolute mode) */
  topAbs: number;
  left: number;
  width: number;
  openUpward: boolean;
  triggerHeight: number;
  /** true → use position:absolute (transform ancestor found); false → position:fixed */
  useAbsolute: boolean;
}

// ─── useDropdownPortal hook ───────────────────────────────────────────────────
export function useDropdownPortal(open: boolean, onClose: () => void) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<DropdownPos | null>(null);
  const lastScrollY = useRef(0);

  const recalculate = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scrollY = window.scrollY;

    const DROPDOWN_W = Math.min(rect.width, vw - 16);
    const DROPDOWN_MAX_H = 280;

    // RTL-aware: flip left if would overflow right edge of viewport
    let left = rect.left;
    if (left + DROPDOWN_W > vw - 8) {
      left = rect.right - DROPDOWN_W;
    }
    left = Math.max(8, left);

    // Open upward if insufficient space below
    const spaceBelow = vh - rect.bottom;
    const openUpward = spaceBelow < DROPDOWN_MAX_H && rect.top > DROPDOWN_MAX_H;

    // Detect transform ancestor → switch positioning strategy
    const useAbsolute = hasTransformAncestor(el);

    setPos({
      top: rect.bottom,
      topAbs: rect.bottom + scrollY,
      left,
      width: DROPDOWN_W,
      openUpward,
      triggerHeight: rect.height,
      useAbsolute,
    });
  }, []);

  // Register/unregister with the global close registry
  useEffect(() => {
    if (!open) return;
    registerDropdown(onClose);
    return () => unregisterDropdown(onClose);
  }, [open, onClose]);

  // Recalculate on open
  useEffect(() => {
    if (open) recalculate();
  }, [open, recalculate]);

  // Resize observer on trigger
  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => { if (open) recalculate(); });
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, recalculate]);

  // Scroll & Escape listeners
  useEffect(() => {
    if (!open) return;

    lastScrollY.current = window.scrollY;

    function onScroll() {
      if (Math.abs(window.scrollY - lastScrollY.current) > 50) {
        onClose();
      } else {
        recalculate();
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, recalculate]);

  return { triggerRef, pos };
}

// ─── DropdownPortal component ─────────────────────────────────────────────────
interface DropdownPortalProps {
  open: boolean;
  pos: DropdownPos | null;
  onClose: () => void;
  children: React.ReactNode;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  className?: string;
}

export function DropdownPortal({
  open, pos, onClose, children, triggerRef, className = '',
}: DropdownPortalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open, onClose, triggerRef]);

  if (!open || !pos) return null;

  let style: React.CSSProperties;

  if (pos.useAbsolute) {
    // Transform ancestor detected: position:fixed is broken.
    // Use position:absolute with document-origin (scrollY-compensated) coordinates
    // so the portal renders correctly relative to document.body.
    const scrollY = window.scrollY;
    const triggerTopAbs = pos.topAbs - pos.triggerHeight; // top edge of trigger in doc coords

    style = {
      position: 'absolute',
      zIndex: 9999,
      width: pos.width,
      left: pos.left,
      ...(pos.openUpward
        ? { top: triggerTopAbs - 4 + scrollY, transform: 'translateY(-100%)' }
        : { top: pos.topAbs + 4 }),
    };
  } else {
    // Normal case: no transform ancestor, position:fixed works correctly.
    // pos.top === rect.bottom (viewport-relative bottom edge of trigger)
    // openUpward: anchor to trigger's top edge (= pos.top - triggerHeight)
    style = {
      position: 'fixed',
      zIndex: 9999,
      width: pos.width,
      left: pos.left,
      ...(pos.openUpward
        ? { bottom: window.innerHeight - (pos.top - pos.triggerHeight) + 4 }
        : { top: pos.top + 4 }),
    };
  }

  return createPortal(
    <div ref={panelRef} style={style} className={`search-dropdown-enter ${className}`}>
      {children}
    </div>,
    document.body
  );
}
