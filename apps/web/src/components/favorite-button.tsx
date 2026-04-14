'use client';

import { useToggleFavorite, useFavoriteIds, type EntityType } from '@/lib/api';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useTranslations } from 'next-intl';

interface FavoriteButtonProps {
  entityType: EntityType;
  entityId: string;
  className?: string;
}

export function FavoriteButton({ entityType, entityId, className }: FavoriteButtonProps) {
  const requireAuth = useRequireAuth();
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const tp = useTranslations('pages');

  const key = `${entityType}:${entityId}`;
  const isFavorite = favoriteIds?.includes(key) ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requireAuth(
      () => toggleFav.mutate({ entityType, entityId }),
      tp('favBtnLogin'),
    );
  };

  return (
    <button
      onClick={handleClick}
      className={
        className ||
        'absolute top-2 left-2 w-7 h-7 rounded-md bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all z-10'
      }
      aria-label={isFavorite ? tp('favBtnRemove') : tp('favBtnAdd')}
    >
      <span
        className="material-symbols-outlined text-[14px]"
        style={{ fontVariationSettings: `'FILL' ${isFavorite ? 1 : 0}` }}
      >
        favorite
      </span>
    </button>
  );
}
