'use client';

import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useTranslations } from 'next-intl';

export default function PaymentSuccessPage() {
  const tp = useTranslations('pricing');

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-lg mx-auto px-6 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <span className="material-symbols-outlined text-4xl text-emerald-600">check_circle</span>
        </div>
        <h1 className="text-2xl font-black text-on-surface mb-3">{tp('paymentSuccess')}</h1>
        <p className="text-sm text-on-surface-variant mb-8">{tp('paymentSuccessDesc')}</p>

        <div className="flex flex-col gap-3">
          <Link href="/my-listings" className="bg-primary text-on-primary px-8 py-3 rounded-xl text-sm font-black hover:brightness-110 transition-all inline-flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">list_alt</span>
            {tp('goToListings')}
          </Link>
          <Link href="/" className="text-primary text-sm font-bold hover:underline">
            {tp('backToHome')}
          </Link>
        </div>
      </main>
    </>
  );
}
