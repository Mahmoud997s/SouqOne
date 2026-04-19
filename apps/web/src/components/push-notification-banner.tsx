'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';

export function PushNotificationBanner() {
  const { isAuthenticated } = useAuth();
  const { status, isSubscribed, subscribe } = usePushNotifications();
  const t = useTranslations('notifications');
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState(false);

  if (!isAuthenticated) return null;
  if (status === 'unsupported' || status === 'loading') return null;
  if (status === 'denied') return null;

  const handleSubscribe = async () => {
    setSubscribing(true);
    setError(false);
    try {
      const result = await subscribe();
      if (!result) setError(true);
    } catch {
      setError(true);
    } finally {
      setSubscribing(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 rounded-xl p-3.5 flex items-center gap-3 transition-all duration-500">
        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-green-600 text-lg">notifications_active</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-on-surface">{t('pushEnabledTitle')}</p>
          <p className="text-[11px] text-on-surface-variant mt-0.5">{t('pushEnabledDesc')}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-lg">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span className="text-xs font-black">{t('pushEnabled')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-3.5 flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-lg">notifications_active</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-on-surface">{t('pushTitle')}</p>
        <p className="text-[11px] text-on-surface-variant mt-0.5">{t('pushDesc')}</p>
      </div>
      <button
        onClick={handleSubscribe}
        disabled={subscribing}
        className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-black hover:brightness-110 active:scale-95 transition-all shrink-0 disabled:opacity-60 flex items-center gap-1.5"
      >
        {subscribing ? (
          <>
            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            {t('pushEnabling')}
          </>
        ) : error ? (
          t('pushRetry')
        ) : (
          t('pushEnable')
        )}
      </button>
    </div>
  );
}
