'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CardSkeleton } from '@/components/loading-skeleton';
import { getImageUrl } from '@/lib/image-utils';
import type { InsuranceItem } from '@/lib/api/insurance';

interface InsuranceShowcaseProps {
  items: InsuranceItem[];
  isLoading: boolean;
}

export function InsuranceShowcase({ items, isLoading }: InsuranceShowcaseProps) {
  const t = useTranslations('home');

  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-between items-end gap-2 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-primary" />
              <h2 className="text-xl md:text-3xl font-black">{t('latestInsurance')}</h2>
            </div>
            <p className="text-on-surface-variant text-sm">{t('latestInsuranceDesc')}</p>
          </div>
          <Link href="/insurance" className="text-primary font-bold text-sm hover:underline transition-colors">
            {t('viewAll')}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((offer) => {
              const img = offer.images?.find((i) => i.isPrimary) ?? offer.images?.[0];
              const imgUrl = getImageUrl(img?.url);
              return (
                <Link key={offer.id} href={`/insurance/${offer.id}`} className="group bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 shadow-sm hover:shadow-md transition-all">
                  <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={offer.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/30">
                        <span className="material-symbols-outlined text-5xl text-indigo-300">shield</span>
                      </div>
                    )}
                    {offer.coverageType && (
                      <span className="absolute top-2 start-2 text-[10px] font-black text-white bg-indigo-600 px-2 py-0.5 rounded-md">
                        {offer.coverageType}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-on-surface truncate">{offer.title}</h3>
                    <p className="text-xs text-on-surface-variant mt-1 truncate">{offer.providerName}</p>
                    {offer.priceFrom && (
                      <p className="text-primary font-black text-sm mt-2">{offer.priceFrom} {offer.currency}</p>
                    )}
                    {offer.features?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {offer.features.slice(0, 2).map((f, i) => (
                          <span key={i} className="text-[10px] bg-surface-container-low dark:bg-surface-container-high px-1.5 py-0.5 rounded text-on-surface-variant">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">shield</span>
            <p className="font-medium">{t('noInsuranceNow')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
