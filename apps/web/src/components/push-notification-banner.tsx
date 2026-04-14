'use client';

import { usePushNotifications } from '@/hooks/use-push-notifications';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';

export function PushNotificationBanner() {
  const { isAuthenticated } = useAuth();
  const { status, isSubscribed, subscribe } = usePushNotifications();
  const t = useTranslations('notifications');

  if (!isAuthenticated) return null;
  if (status === 'unsupported' || status === 'loading') return null;
  if (status === 'denied') return null;
  if (isSubscribed) return null;

  return (
    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-primary text-xl">notifications_active</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black text-on-surface">{t('pushTitle')}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{t('pushDesc')}</p>
      </div>
      <button
        onClick={subscribe}
        className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-black hover:brightness-110 transition-all shrink-0"
      >
        {t('pushEnable')}
      </button>
    </div>
  );
}
