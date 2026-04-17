'use client';

import { useTranslations, useLocale } from 'next-intl';
import LogoArIcon from '@/components/icons/logo-ar';

export default function Loading() {
  const tp = useTranslations('pages');
  const locale = useLocale();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-5">
        {locale === 'ar' && (
          // <Image src="/souq-one-ar.svg" alt="سوق وان" width={140} height={28} className="h-[28px] w-auto" />
          <LogoArIcon className='w-35 h-7'/>
        )}
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
          <span className="material-symbols-outlined text-primary text-2xl">directions_car</span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant/50 text-sm">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{tp('loadingText')}</span>
        </div>
      </div>
    </div>
  );
}
