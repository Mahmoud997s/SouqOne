'use client';

import { useTranslations } from 'next-intl';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const tp = useTranslations('pages');
  return (
    <div className="bg-surface-container-low border border-error/20 rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-error text-4xl">cloud_off</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-on-surface">{tp('errorStateTitle')}</h3>
        <p className="text-sm text-on-surface-variant max-w-sm">{message || tp('errorStateMessage')}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-surface-container-highest border border-outline-variant/30 text-on-surface px-6 py-2 rounded-lg font-bold text-sm hover:bg-surface-bright transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          {tp('errorStateRetry')}
        </button>
      )}
    </div>
  );
}
