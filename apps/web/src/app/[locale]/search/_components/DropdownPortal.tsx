'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

// ─── Shared open-dropdown registry (one open at a time) ──────────────────────
// Each dropdown registers a close fn; opening one closes all others.
type CloseFn = () => void;
const registry = new Set<CloseFn>();

function registerDropdown(close: CloseFn) {
  // close all others
  registry.forEach(fn => { if (fn !== close) fn(); });
  registry.add(close);
}
function unregisterDropdown(close: CloseFn) {
  registry.delete(close);
}

// ─── Position type ────────────────────────────────────────────────────────────
interface DropdownPos {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
  triggerHeight: number;
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

    const DROPDOWN_W = Math.min(rect.width, vw - 16);
    const DROPDOWN_MAX_H = 280; // max height of the dropdown panel

    // Flip left if would overflow right edge
    let left = rect.left;
    if (left + DROPDOWN_W > vw - 8) {
      left = rect.right - DROPDOWN_W;
    }
    left = Math.max(8, left);

    // Open upward if not enough room below
    const spaceBelow = vh - rect.bottom;
    const openUpward = spaceBelow < DROPDOWN_MAX_H && rect.top > DROPDOWN_MAX_H;

    setPos({
      top: rect.bottom,
      left,
      width: DROPDOWN_W,
      openUpward,
      triggerHeight: rect.height,
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

  const style: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    width: pos.width,
    left: pos.left,
    // pos.top === rect.bottom (bottom edge of the trigger)
    // openUpward: anchor to the trigger's top edge instead
    ...(pos.openUpward
      ? { bottom: window.innerHeight - (pos.top - pos.triggerHeight) + 4 }
      : { top: pos.top + 4 }),
  };

  return createPortal(
    <div ref={panelRef} style={style} className={`search-dropdown-enter ${className}`}>
      {children}
    </div>,
    document.body
  );
}
