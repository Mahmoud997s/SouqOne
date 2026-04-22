'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useFavoriteIds, useToggleFavorite } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

interface FavoritesContextValue {
  favIds: Set<string>;
  toggleFav: ReturnType<typeof useToggleFavorite>;
  isFav: (key: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { data } = useFavoriteIds();
  const toggleFav = useToggleFavorite();

  const favIds = useMemo(
    () => new Set(isAuthenticated && data ? data : []),
    [data, isAuthenticated],
  );

  const isFav = useMemo(
    () => (key: string) => favIds.has(key),
    [favIds],
  );

  const value = useMemo(
    () => ({ favIds, toggleFav, isFav }),
    [favIds, toggleFav, isFav],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavContext() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    // Fallback for components rendered outside provider
    return { favIds: new Set<string>(), toggleFav: null as any, isFav: () => false };
  }
  return ctx;
}
