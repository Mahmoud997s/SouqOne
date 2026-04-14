'use client';

import { useState } from 'react';
import { StarRating } from './star-rating';
import { useCreateReview } from '@/lib/api/reviews';
import { useToast } from '@/components/toast';
import { useTranslations } from 'next-intl';

interface ReviewFormProps {
  entityType: string;
  entityId: string;
  revieweeId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ entityType, entityId, revieweeId, onSuccess }: ReviewFormProps) {
  const t = useTranslations('reviews');
  const { addToast } = useToast();
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { addToast('error', t('selectRating')); return; }

    try {
      await createReview.mutateAsync({ rating, comment: comment.trim() || undefined, entityType, entityId, revieweeId });
      addToast('success', t('reviewSubmitted'));
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (err: any) {
      addToast('error', err?.message || t('reviewError'));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <p className="text-xs font-bold text-on-surface mb-1.5">{t('yourRating')}</p>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder={t('commentPlaceholder')}
        rows={3}
        className="w-full bg-surface-container-low dark:bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary/40 resize-none"
      />
      <button
        type="submit"
        disabled={createReview.isPending || rating === 0}
        className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-black hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-base">rate_review</span>
        {createReview.isPending ? t('submitting') : t('submitReview')}
      </button>
    </form>
  );
}
