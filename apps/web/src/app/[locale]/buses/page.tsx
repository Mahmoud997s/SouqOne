'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { getGovernorates } from '@/lib/location-data';
import { relativeTimeT } from '@/lib/time-utils';
import { useTranslations, useLocale } from 'next-intl';
import { useFavContext } from '@/providers/favorites-provider';
import { useAuth } from '@/providers/auth-provider';
import { useBusListings, type BusListingItem } from '@/lib/api/buses';

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
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
  const { isAuthenticated } = useAuth();
  const { isFav: checkFav, toggleFav } = useFavContext();
  const isFav = checkFav(`BUS_LISTING:${bus.id}`);

  const TYPE_LABELS: Record<string, string> = {
    BUS_SALE: t('busesTypeSale'), BUS_SALE_WITH_CONTRACT: t('busesTypeSaleContract'),
    BUS_RENT: t('busesTypeRent'), BUS_CONTRACT: t('busesTypeContract'),
  };

  const img = bus.images?.[0]?.url;
  const priceText = bus.price ? `${Number(bus.price).toLocaleString('en-US')} ${tl('currency')}`
    : bus.dailyPrice ? `${Number(bus.dailyPrice).toLocaleString('en-US')} ${tl('currency')}${t('busesPerDay')}`
    : bus.monthlyPrice ? `${Number(bus.monthlyPrice).toLocaleString('en-US')} ${tl('currency')}${tl('perMonth')}`
    : null;

  return (
    <article className="h-full rounded-xl overflow-hidden bg-surface-container-lowest group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300 border border-outline-variant/10">
      <Link href={`/sale/bus/${bus.id}`} className="h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
          {img ? (
            <Image src={img} alt={bus.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:640px) 50vw, 25vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl sm:text-5xl text-on-surface-variant/20">directions_bus</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          {/* Fav */}
          {isAuthenticated && (
            <button onClick={e => { e.preventDefault(); toggleFav.mutate({ entityType: 'BUS_LISTING', entityId: bus.id }); }}
              className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
              <span className={`material-symbols-outlined text-[18px] sm:text-[20px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 ${isFav ? 'text-red-500' : 'text-white'}`}
                style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            </button>
          )}
          {/* Type top-right */}
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
            {TYPE_LABELS[bus.busListingType] || bus.busListingType}
          </span>
          {/* Verified */}
          {bus.user?.isVerified && (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-blue-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </span>
          )}
          {/* Price */}
          {priceText && (
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
              <span className="px-1.5 sm:px-2 py-px sm:py-0.5 rounded text-[9px] sm:text-xs font-black bg-primary text-on-primary shadow-sm">{priceText}</span>
            </div>
          )}
        </div>
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">
          <h3 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1">{bus.title}</h3>
          <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[10px] text-on-surface-variant">
            <span className="shrink-0">{relativeTimeT(bus.createdAt, tt, locale)}</span>
            {bus.governorate && <span className="text-outline/40">·</span>}
            {bus.governorate && (
              <span className="flex items-center gap-px shrink-0">
                <span className="material-symbols-outlined text-[9px] sm:text-[11px]">location_on</span>
                {bus.governorate}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
