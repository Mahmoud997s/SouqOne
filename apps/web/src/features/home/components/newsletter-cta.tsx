'use client';

import { useTranslations } from 'next-intl';

const STATS = [
  { icon: 'campaign', valueKey: 'statListings', labelKey: 'statListingsLabel' },
  { icon: 'group', valueKey: 'statUsers', labelKey: 'statUsersLabel' },
  { icon: 'verified_user', valueKey: 'statSafe', labelKey: 'statSafeLabel' },
  { icon: 'support_agent', valueKey: 'statSupport', labelKey: 'statSupportLabel' },
] as const;

export function NewsletterCta() {
  const t = useTranslations('home');

  return (
    <div
      className="fixed bottom-[57px] inset-x-0 z-40 lg:hidden bg-gradient-to-r from-primary/[0.05] via-surface-container-lowest/95 to-brand-amber/[0.05] dark:from-primary/[0.08] dark:via-surface-container/95 dark:to-brand-amber/[0.06] backdrop-blur-xl"
      style={{ maskImage: 'radial-gradient(circle 38px at 50% calc(100% + 4px), transparent 98%, black 100%)', WebkitMaskImage: 'radial-gradient(circle 38px at 50% calc(100% + 4px), transparent 98%, black 100%)' }}
    >
      <div className="flex items-center justify-around h-[53px] max-w-lg mx-auto px-2">
        {/* Slot 1 */}
        <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
          <span className="material-symbols-outlined text-primary text-[16px]">{STATS[0].icon}</span>
          <span className="text-on-surface text-[10px] font-black leading-none whitespace-nowrap">{t(STATS[0].valueKey)}</span>
          <span className="text-on-surface-variant/80 text-[8px] font-semibold leading-none whitespace-nowrap">{t(STATS[0].labelKey)}</span>
        </div>
        {/* Slot 2 */}
        <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
          <span className="material-symbols-outlined text-primary text-[16px]">{STATS[1].icon}</span>
          <span className="text-on-surface text-[10px] font-black leading-none whitespace-nowrap">{t(STATS[1].valueKey)}</span>
          <span className="text-on-surface-variant/80 text-[8px] font-semibold leading-none whitespace-nowrap">{t(STATS[1].labelKey)}</span>
        </div>
        {/* Center spacer — aligned with CTA button */}
        <div className="min-w-[48px]" />
        {/* Slot 3 */}
        <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
          <span className="material-symbols-outlined text-primary text-[16px]">{STATS[2].icon}</span>
          <span className="text-on-surface text-[10px] font-black leading-none whitespace-nowrap">{t(STATS[2].valueKey)}</span>
          <span className="text-on-surface-variant/80 text-[8px] font-semibold leading-none whitespace-nowrap">{t(STATS[2].labelKey)}</span>
        </div>
        {/* Slot 4 */}
        <div className="flex flex-col items-center gap-0.5 min-w-[48px]">
          <span className="material-symbols-outlined text-primary text-[16px]">{STATS[3].icon}</span>
          <span className="text-on-surface text-[10px] font-black leading-none whitespace-nowrap">{t(STATS[3].valueKey)}</span>
          <span className="text-on-surface-variant/80 text-[8px] font-semibold leading-none whitespace-nowrap">{t(STATS[3].labelKey)}</span>
        </div>
      </div>
    </div>
  );
}
