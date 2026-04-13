'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useTransition } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const otherLocale = locale === 'ar' ? 'en' : 'ar';
  const label = locale === 'ar' ? 'EN' : 'عربي';

  function handleSwitch() {
    startTransition(() => {
      router.replace(pathname, { locale: otherLocale });
    });
  }

  return (
    <button
      onClick={handleSwitch}
      disabled={isPending}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium
        bg-surface-container hover:bg-surface-container-high
        text-on-surface transition-colors cursor-pointer
        disabled:opacity-50"
      title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <span className="material-symbols-outlined text-[18px]">language</span>
      <span>{label}</span>
    </button>
  );
}
