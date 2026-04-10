'use client';

import { useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useAuthModal } from '@/providers/auth-modal-provider';

/**
 * Returns a function that checks authentication before executing an action.
 * If the user is not logged in, opens the login modal with an optional message
 * and defers the action until after successful login.
 *
 * Usage:
 *   const requireAuth = useRequireAuth();
 *   requireAuth(() => toggleFavorite(), 'سجّل الدخول لإضافة المفضلة');
 */
export function useRequireAuth() {
  const { isAuthenticated } = useAuth();
  const { open } = useAuthModal();

  return useCallback(
    (action: () => void | Promise<void>, message?: string) => {
      if (isAuthenticated) {
        action();
      } else {
        open({ message, onSuccess: action });
      }
    },
    [isAuthenticated, open],
  );
}
