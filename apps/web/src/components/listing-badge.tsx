/**
 * Listing type badge component.
 * Displays SALE, RENTAL, or WANTED badges.
 */

import { memo } from 'react';

interface ListingBadgeProps {
  type: string;
}

export const ListingBadge = memo(function ListingBadge({ type }: ListingBadgeProps) {
  if (type === 'RENTAL') {
    return (
      <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1" />
        إيجار
      </span>
    );
  }

  if (type === 'WANTED') {
    return (
      <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block mr-1" />
        مطلوب
      </span>
    );
  }

  return (
    <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block mr-1" />
      للبيع
    </span>
  );
});
