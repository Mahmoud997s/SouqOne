/**
 * Listing type badge component.
 * Displays SALE, RENTAL, or WANTED badges.
 */

import { memo } from 'react';

interface ListingBadgeProps {
  type: string;
}

export const ListingBadge = memo(function ListingBadge({ type }: ListingBadgeProps) {
  // Unified background for all badges to match card backgrounds
  const baseClass = "px-3 py-0.5 rounded-full text-[11px] font-medium bg-surface-container-lowest text-on-surface border border-outline-variant/30 dark:bg-surface-container dark:text-on-surface dark:border-outline-variant/50";
  
  if (type === 'RENTAL') {
    return (
      <span className={baseClass}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
        إيجار
      </span>
    );
  }

  if (type === 'WANTED') {
    return (
      <span className={baseClass}>
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block mr-1" />
        مطلوب
      </span>
    );
  }

  // SALE/Price badge - blue like other cards
  return (
    <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mr-1" />
      للبيع
    </span>
  );
});
