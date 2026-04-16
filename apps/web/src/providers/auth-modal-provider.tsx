'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type AuthView = 'login' | 'register' | 'forgot' | 'reset' | 'verify' | null;
type PendingAction = () => void | Promise<void>;

interface AuthModalContextValue {
  /** Current auth view, null = closed */
  view: AuthView;
  /** Whether any auth overlay is open */
  isOpen: boolean;
  /** Message shown in the modal header */
  message: string | null;
  /** Extra data passed between views (e.g. email for reset) */
  data: Record<string, string>;
  /** Open a specific auth view */
  openAuth: (view: AuthView, opts?: { message?: string; onSuccess?: PendingAction; data?: Record<string, string> }) => void;
  /** Shorthand: open login modal with optional deferred action */
  open: (opts?: { message?: string; onSuccess?: PendingAction }) => void;
  /** Switch to another view without closing (preserves pending action) */
  switchView: (view: AuthView, data?: Record<string, string>) => void;
  /** Close the overlay and clear state */
  close: () => void;
  /** Execute and clear the pending action (called after successful login/register) */
  executePending: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<AuthView>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<Record<string, string>>({});
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const openAuth = useCallback((v: AuthView, opts?: { message?: string; onSuccess?: PendingAction; data?: Record<string, string> }) => {
    setView(v);
    setMessage(opts?.message ?? null);
    setData(opts?.data ?? {});
    setPendingAction(() => opts?.onSuccess ?? null);
  }, []);

  const open = useCallback((opts?: { message?: string; onSuccess?: PendingAction }) => {
    openAuth('login', { message: opts?.message ?? 'سجّل الدخول لإكمال العملية', onSuccess: opts?.onSuccess });
  }, [openAuth]);

  const switchView = useCallback((v: AuthView, newData?: Record<string, string>) => {
    setView(v);
    if (newData) setData(prev => ({ ...prev, ...newData }));
  }, []);

  const close = useCallback(() => {
    setView(null);
    setMessage(null);
    setData({});
    setPendingAction(null);
  }, []);

  const executePending = useCallback(() => {
    if (pendingAction) {
      setTimeout(() => { pendingAction(); }, 0);
    }
    setPendingAction(null);
  }, [pendingAction]);

  const isOpen = view !== null;

  const value = useMemo<AuthModalContextValue>(
    () => ({ view, isOpen, message, data, openAuth, open, switchView, close, executePending }),
    [view, isOpen, message, data, openAuth, open, switchView, close, executePending],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error('useAuthModal must be used within <AuthModalProvider>');
  }
  return ctx;
}
