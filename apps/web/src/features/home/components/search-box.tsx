'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';

const SB_META = [
  { key: 'all',       labelKey: 'all',       icon: 'search',              route: '/listings',  placeholderKey: 'boxPlaceholder' },
  { key: 'cars',      labelKey: 'cars',      icon: 'directions_car',      route: '/listings',  placeholderKey: 'boxCarsPlaceholder' },
  { key: 'rentals',   labelKey: 'rentals',   icon: 'car_rental',          route: '/rentals',   placeholderKey: 'boxRentalsPlaceholder' },
  { key: 'parts',     labelKey: 'parts',     icon: 'build',               route: '/parts',     placeholderKey: 'boxPartsPlaceholder' },
  { key: 'services',  labelKey: 'services',  icon: 'home_repair_service', route: '/services',  placeholderKey: 'boxServicesPlaceholder' },
  { key: 'transport', labelKey: 'transport', icon: 'local_shipping',      route: '/transport', placeholderKey: 'boxTransportPlaceholder' },
  { key: 'trips',     labelKey: 'trips',     icon: 'tour',                route: '/trips',     placeholderKey: 'boxTripsPlaceholder' },
  { key: 'insurance', labelKey: 'insurance', icon: 'verified_user',       route: '/insurance', placeholderKey: 'boxInsurancePlaceholder' },
  { key: 'jobs',      labelKey: 'jobs',      icon: 'work',                route: '/jobs',      placeholderKey: 'boxJobsPlaceholder' },
] as const;

export function SearchBox() {
  const router = useRouter();
  const t = useTranslations('search');
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeKey, setActiveKey] = useState('all');
  const [query, setQuery] = useState('');
  const cat = SB_META.find(c => c.key === activeKey)!;

  useEffect(() => { inputRef.current?.focus(); }, [activeKey]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`${cat.route}?search=${encodeURIComponent(query.trim())}` as any);
  }

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-6 pb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-1 bg-primary" />
        <h2 className="text-2xl font-black">{t('searchInSouqOne')}</h2>
      </div>
      <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden">

        {/* ── Category Tabs ── */}
        <div className="flex overflow-x-auto no-scrollbar">
          {SB_META.map((c) => {
            const active = activeKey === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveKey(c.key)}
                className={`shrink-0 flex items-center gap-1.5 px-4 sm:px-5 py-3.5 text-[13px] font-bold transition-all border-b-2 ${
                  active
                    ? 'bg-primary/5 text-primary border-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low dark:hover:bg-white/5 border-transparent'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{c.icon}</span>
                {t(c.labelKey)}
              </button>
            );
          })}
        </div>

        {/* ── Search Input ── */}
        <form onSubmit={handleSearch} className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-surface-container-low dark:bg-surface-container rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-xl shrink-0">search</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t(cat.placeholderKey)}
                className="flex-1 bg-transparent text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="text-on-surface-variant/40 hover:text-on-surface-variant transition-colors">
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary shrink-0 px-6 py-2.5 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-ambient hover:brightness-105 active:scale-[0.97]"
            >
              <Search size={16} />
              <span>{t('searchBtn')}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
