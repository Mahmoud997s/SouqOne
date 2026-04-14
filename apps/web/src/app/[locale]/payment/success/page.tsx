'use client';

import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useTranslations } from 'next-intl';
import { useVerifyPayment } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function PaymentSuccessPage() {
  const tp = useTranslations('pricing');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { data, isLoading, isError } = useVerifyPayment(sessionId);

  const isPaid = data?.status === 'paid';

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-lg mx-auto px-6 text-center">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-sm text-on-surface-variant">{tp('verifying')}</p>
          </div>
        ) : isPaid ? (
          <>
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
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-amber-600">{isError ? 'error' : 'pending'}</span>
            </div>
            <h1 className="text-2xl font-black text-on-surface mb-3">{tp('paymentPending')}</h1>
            <p className="text-sm text-on-surface-variant mb-8">{tp('paymentPendingDesc')}</p>
            <div className="flex flex-col gap-3">
              <Link href="/pricing" className="bg-primary text-on-primary px-8 py-3 rounded-xl text-sm font-black hover:brightness-110 transition-all inline-flex items-center justify-center gap-2">
                {tp('tryAgain')}
              </Link>
              <Link href="/" className="text-primary text-sm font-bold hover:underline">
                {tp('backToHome')}
              </Link>
            </div>
          </>
        )}
      </main>
    </>
  );
}
