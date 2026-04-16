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
      className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all disabled:opacity-50 relative"
      title={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <span className="material-symbols-outlined text-[20px]">language</span>
      <span className="absolute -bottom-0.5 -end-0.5 text-[9px] font-black text-on-surface-variant/70 leading-none">{label}</span>
    </button>
  );
}
