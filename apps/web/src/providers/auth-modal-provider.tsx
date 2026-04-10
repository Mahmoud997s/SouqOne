'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type PendingAction = () => void | Promise<void>;

interface AuthModalContextValue {
  /** Whether the login modal is open */
  isOpen: boolean;
  /** Message shown in the modal header */
  message: string | null;
  /** Open the login modal, optionally with a message and a deferred action */
  open: (opts?: { message?: string; onSuccess?: PendingAction }) => void;
  /** Close the modal and clear pending action */
  close: () => void;
  /** Execute and clear the pending action (called after successful login) */
  executePending: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const open = useCallback((opts?: { message?: string; onSuccess?: PendingAction }) => {
    setMessage(opts?.message ?? 'سجّل الدخول لإكمال العملية');
    // Wrap in arrow so React doesn't invoke the function as a state initializer
    setPendingAction(() => opts?.onSuccess ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setMessage(null);
    setPendingAction(null);
  }, []);

  const executePending = useCallback(() => {
    if (pendingAction) {
      // Run on next tick so auth state is fully settled
      setTimeout(() => { pendingAction(); }, 0);
    }
    setPendingAction(null);
  }, [pendingAction]);

  const value = useMemo<AuthModalContextValue>(
    () => ({ isOpen, message, open, close, executePending }),
    [isOpen, message, open, close, executePending],
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
