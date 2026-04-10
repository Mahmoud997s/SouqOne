'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const searchTabs = [
  { key: 'all',       label: 'الكل',      icon: 'search',              route: '/listings',  placeholder: 'ابحث في سوق وان...' },
  { key: 'cars',      label: 'سيارات',    icon: 'directions_car',      route: '/listings',  placeholder: 'ماركة، موديل، سنة...' },
  { key: 'parts',     label: 'قطع غيار',  icon: 'settings',            route: '/parts',     placeholder: 'ابحث عن قطعة غيار...' },
  { key: 'services',  label: 'خدمات',     icon: 'build',               route: '/services',  placeholder: 'ابحث عن خدمة...' },
  { key: 'transport', label: 'نقل',       icon: 'local_shipping',      route: '/transport', placeholder: 'ابحث عن خدمة نقل...' },
  { key: 'jobs',      label: 'وظائف',     icon: 'work',                route: '/jobs',      placeholder: 'ابحث عن وظيفة...' },
];

const stats = [
  { icon: 'directions_car', label: 'سيارة', count: '500+' },
  { icon: 'build', label: 'خدمة وقطعة', count: '200+' },
  { icon: 'local_shipping', label: 'شركة نقل', count: '80+' },
  { icon: 'work', label: 'وظيفة سائق', count: '50+' },
];

export function HeroSection() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');
  const tab = searchTabs.find(t => t.key === activeTab)!;

  useEffect(() => { inputRef.current?.focus(); }, [activeTab]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`${tab.route}?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative overflow-hidden" dir="rtl">
      <div className="relative z-10 pt-[10px] pb-8 md:pb-12">
        {/* ── Brand Banner ── */}
        <div className="w-[92%] sm:w-[85%] md:w-[78%] lg:w-[70%] mx-auto mb-2 p-[5px]">
          <img
            src="/hero-banner.png"
            alt="SouqOne - سوق وان"
            className="w-full h-auto object-contain"
            style={{ animation: 'hero-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, hero-glow 4s ease-in-out 1.2s infinite' }}
          />
        </div>

        {/* ── Search Box ── */}
        <div className="w-[92%] sm:w-[85%] md:w-[78%] lg:max-w-3xl mx-auto" style={{ animation: 'hero-search-entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both' }}>
          <div className="bg-surface-container-lowest dark:bg-surface-container-high shadow-[0_8px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden">
            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-outline-variant/10">
              {searchTabs.map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`shrink-0 flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2.5 sm:py-3 text-[12px] sm:text-[13px] font-bold transition-all border-b-2 ${
                    activeTab === t.key
                      ? 'bg-primary/5 text-primary border-primary'
                      : 'text-on-surface-variant hover:text-on-surface border-transparent'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] sm:text-[15px]">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search input */}
            <form onSubmit={handleSearch} className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
              <div className="flex-1 flex items-center gap-2 sm:gap-3 bg-surface-container-low dark:bg-surface-container rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-lg sm:text-xl shrink-0">search</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={tab.placeholder}
                  className="flex-1 bg-transparent text-[13px] sm:text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none min-w-0"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} className="text-on-surface-variant/40 hover:text-on-surface-variant shrink-0">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
              </div>
              <button type="submit" className="btn-editorial shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-[13px] sm:text-sm flex items-center gap-1.5 hover:shadow-ambient hover:brightness-105 active:scale-[0.97]">
                <span className="material-symbols-outlined text-sm sm:text-base">search</span>
                <span className="hidden sm:inline">بحث</span>
              </button>
            </form>
          </div>
        </div>

        {/* Quick stats + CTA */}
        <div className="w-[92%] sm:w-[85%] md:w-[78%] lg:max-w-3xl mx-auto mt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4" style={{ animation: 'hero-search-entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both' }}>
          <div className="flex items-center gap-3 sm:gap-4 flex-1 flex-wrap justify-center sm:justify-start">
            {stats.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-sm sm:text-base">{s.icon}</span>
                <span className="text-[11px] sm:text-xs font-bold">{s.count}</span>
                <span className="text-[10px] sm:text-[11px] hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
          <Link
            href="/add-listing"
            className="btn-green px-5 py-2.5 text-xs font-black flex items-center gap-1.5 hover:brightness-110 shadow-ambient shrink-0"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            أضف إعلانك مجاناً
          </Link>
        </div>
      </div>
    </section>
  );
}
