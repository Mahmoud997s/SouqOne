'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useBusListings, type BusListingItem } from '@/lib/api/buses';
import { getGovernorates } from '@/lib/location-data';
import { relativeTimeT } from '@/lib/time-utils';
import { useTranslations, useLocale } from 'next-intl';

const TYPE_COLORS: Record<string, string> = {
  BUS_SALE: 'bg-blue-600 text-white',
  BUS_SALE_WITH_CONTRACT: 'bg-emerald-600 text-white',
  BUS_RENT: 'bg-violet-600 text-white',
  BUS_CONTRACT: 'bg-orange-600 text-white',
};

export default function BusesPage() {
  const t = useTranslations('pages');
  const locale = useLocale();

  const TABS = [
    { value: '', label: t('all'), icon: 'grid_view' },
    { value: 'BUS_SALE', label: t('busesTabSale'), icon: 'sell' },
    { value: 'BUS_SALE_WITH_CONTRACT', label: t('busesTabSaleContract'), icon: 'assignment' },
    { value: 'BUS_RENT', label: t('busesTabRent'), icon: 'car_rental' },
    { value: 'BUS_CONTRACT', label: t('busesTabContract'), icon: 'request_quote' },
  ];
  const [activeTab, setActiveTab] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (activeTab) params.busListingType = activeTab;
  if (governorate) params.governorate = governorate;

  const { data, isLoading } = useBusListings(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-16">
        <style>{`.scrollbar-hide::-webkit-scrollbar{display:none} .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
        {/* Hero */}
        <div className="bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 pb-8">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-3xl">directions_bus</span>
                  {t('busesTitle')}
                </h1>
                <p className="text-on-surface-variant text-sm mt-1">{t('busesSubtitle')}</p>
              </div>
              <Link href="/add-listing/bus" className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-black hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg">
                <span className="material-symbols-outlined text-base">add</span>
                {t('addListing')}
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {TABS.map(tab => (
                <button key={tab.value} onClick={() => { setActiveTab(tab.value); setPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${activeTab === tab.value ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:border-primary/30'}`}>
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter */}
            <div className="flex gap-3 mt-4">
              <select value={governorate} onChange={e => { setGovernorate(e.target.value); setPage(1); }}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-primary/40">
                <option value="">{t('allGovernorates')}</option>
                {getGovernorates('OM', locale).map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-72" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">directions_bus</span>
              <p className="text-on-surface-variant text-lg font-bold">{t('busesNoListings')}</p>
              <p className="text-on-surface-variant/60 text-sm mt-1">{t('busesBeFirst')}</p>
              <Link href="/add-listing/bus" className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-black mt-6 hover:brightness-110 transition-all">
                <span className="material-symbols-outlined text-base">add</span>{t('addListing')}
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map(bus => <BusCard key={bus.id} bus={bus} />)}
              </div>

              {/* Pagination */}
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

function BusCard({ bus }: { bus: BusListingItem }) {
  const t = useTranslations('pages');
  const tl = useTranslations('listings');
  const tt = useTranslations('time');
  const locale = useLocale();

  const BUS_TYPE_LABELS: Record<string, string> = {
    MINI_BUS: t('busesMini'), MEDIUM_BUS: t('busesMedium'), LARGE_BUS: t('busesLarge'),
    COASTER: t('busesCoaster'), SCHOOL_BUS: t('busesSchool'),
  };
  const TYPE_LABELS: Record<string, string> = {
    BUS_SALE: t('busesTypeSale'), BUS_SALE_WITH_CONTRACT: t('busesTypeSaleContract'),
    BUS_RENT: t('busesTypeRent'), BUS_CONTRACT: t('busesTypeContract'),
  };

  const img = bus.images?.[0]?.url;
  const isContract = bus.busListingType === 'BUS_CONTRACT';
  const hasContract = bus.busListingType === 'BUS_SALE_WITH_CONTRACT';

  return (
    <Link href={`/buses/${bus.id}`} className="group bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 shadow-sm hover:shadow-md transition-all">
      {/* Image */}
      <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
        {img ? (
          <Image src={img} alt={bus.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">directions_bus</span>
          </div>
        )}
        {/* Type Badge */}
        <span className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-md ${TYPE_COLORS[bus.busListingType] || 'bg-primary text-white'}`}>
          {TYPE_LABELS[bus.busListingType] || bus.busListingType}
        </span>
        {/* Capacity */}
        {!isContract && (
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px]">groups</span>{t('busesPassenger', { count: bus.capacity })}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-black text-on-surface text-sm leading-tight line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">{bus.title}</h3>

        {!isContract && (
          <p className="text-[11px] text-on-surface-variant mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[11px]">directions_bus</span>
            {BUS_TYPE_LABELS[bus.busType] || bus.busType} · {bus.year} · {bus.make}
          </p>
        )}

        {/* Price / Contract info */}
        {bus.busListingType === 'BUS_SALE' && bus.price && (
          <p className="text-base font-black text-primary">{Number(bus.price).toLocaleString('en-US')} <span className="text-[10px] text-on-surface-variant font-bold">{tl('currency')}</span></p>
        )}
        {hasContract && (
          <div>
            {bus.price && <p className="text-base font-black text-primary">{Number(bus.price).toLocaleString('en-US')} <span className="text-[10px] text-on-surface-variant font-bold">{tl('currency')}</span></p>}
            {bus.contractMonthly && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">assignment</span>
                {t('busesContract', { price: bus.contractMonthly })}
              </p>
            )}
          </div>
        )}
        {bus.busListingType === 'BUS_RENT' && (
          <div className="flex items-baseline gap-1.5">
            {bus.dailyPrice && <p className="text-base font-black text-violet-700 dark:text-violet-400">{Number(bus.dailyPrice).toLocaleString('en-US')} <span className="text-[10px] font-bold">{t('busesPerDay')}</span></p>}
          </div>
        )}
        {isContract && (
          <div className="flex items-center gap-1 text-[11px] text-orange-700 dark:text-orange-400 font-bold">
            <span className="material-symbols-outlined text-[11px]">groups</span>
            {t('busesPassenger', { count: bus.requestPassengers ?? 0 })} · {bus.requestSchedule || t('busesNotSpecified')}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/5">
          <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[10px]">schedule</span>
            {relativeTimeT(bus.createdAt, tt, locale)}
          </span>
          {bus.governorate && (
            <span className="text-[10px] text-on-surface-variant flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">location_on</span>
              {bus.governorate}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
