'use client';

import { StarRating } from './star-rating';
import type { ReviewSummary } from '@/lib/api/reviews';
import { useTranslations } from 'next-intl';

export function ReviewSummaryCard({ summary }: { summary: ReviewSummary }) {
  const t = useTranslations('reviews');
  const { averageRating, reviewCount, distribution } = summary;

  return (
    <div className="flex items-center gap-6">
      <div className="text-center">
        <p className="text-3xl font-black text-on-surface">{averageRating.toFixed(1)}</p>
        <StarRating value={Math.round(averageRating)} size="sm" readonly />
        <p className="text-[11px] text-on-surface-variant mt-1">
          {t('reviewCount', { count: reviewCount })}
        </p>
      </div>
      <div className="flex-1 space-y-1">
        {[5, 4, 3, 2, 1].map(star => {
          const count = distribution[star] || 0;
          const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant w-3 text-end">{star}</span>
              <span className="material-symbols-outlined text-amber-500 text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              <div className="flex-1 h-1.5 bg-outline-variant/10 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[10px] text-on-surface-variant w-5">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
