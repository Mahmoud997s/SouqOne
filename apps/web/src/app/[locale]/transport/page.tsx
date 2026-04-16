'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { GenericListingCard } from '@/components/generic-listing-card';
import { useTransportServices } from '@/lib/api/transport';
import { getGovernorates } from '@/lib/location-data';
import { useTranslations, useLocale } from 'next-intl';

export default function TransportPage() {
  const t = useTranslations('pages');
  const locale = useLocale();
  const [governorate, setGovernorate] = useState('');
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (governorate) params.governorate = governorate;

  const { data, isLoading } = useTransportServices(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">local_shipping</span>
                {t('transportTitle')}
              </h1>
              <p className="text-on-surface-variant text-sm mt-1">{t('transportSubtitle')}</p>
            </div>
            <div className="flex gap-3">
              <select value={governorate} onChange={e => { setGovernorate(e.target.value); setPage(1); }}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/40">
                <option value="">{t('allGovernorates')}</option>
                {getGovernorates('OM', locale).map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-72" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">local_shipping</span>
              <p className="text-on-surface-variant text-lg font-bold">{t('transportNoListings')}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((item: any) => (
                  <GenericListingCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    sectionType="TRANSPORT"
                    price={item.basePrice}
                    currency={item.currency || 'OMR'}
                    governorate={item.governorate}
                    imageUrl={item.images?.[0]?.url}
                    createdAt={item.createdAt}
                    description={item.description}
                  />
                ))}
              </div>
              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).slice(0, 10).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${p === page ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-primary/10'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
