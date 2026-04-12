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
      {/* ── Multi-layer Background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#f1f5f9] dark:from-[#0c0f1a] dark:via-[#101528] dark:to-[#0e1220]" />

      {/* Depth layer 1: large soft circles — clamped on mobile */}
      <div className="absolute top-[-20%] right-0 w-[60vw] md:w-[600px] h-[60vw] md:h-[600px] rounded-full bg-blue-400/[0.06] dark:bg-blue-500/[0.04] blur-3xl" />
      <div className="absolute bottom-[-30%] left-0 w-[50vw] md:w-[500px] h-[50vw] md:h-[500px] rounded-full bg-indigo-300/[0.07] dark:bg-indigo-500/[0.03] blur-3xl" />

      {/* Depth layer 2: subtle geometric shapes — hidden on small screens */}
      <div className="hidden sm:block absolute top-[15%] left-[8%] w-32 h-32 border border-primary/[0.06] dark:border-primary/[0.04] rounded-2xl rotate-12" />
      <div className="hidden sm:block absolute bottom-[20%] right-[5%] w-24 h-24 border border-orange-400/[0.08] dark:border-orange-400/[0.04] rounded-full" />
      <div className="hidden sm:block absolute top-[40%] right-[15%] w-16 h-16 bg-primary/[0.03] dark:bg-primary/[0.02] rounded-lg rotate-45" />

      {/* Depth layer 3: fine dots pattern */}
      <div className="absolute inset-0 opacity-[0.3] dark:opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 pt-[10px] pb-10 md:pb-14">
        {/* ── Brand Banner with Glow ── */}
        <div className="relative w-[92%] sm:w-[85%] md:w-[78%] lg:w-[70%] mx-auto mb-3 p-[5px]">
          {/* Soft glow behind the logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[120%] pointer-events-none">
            <div className="absolute inset-0 bg-blue-500/[0.12] dark:bg-blue-500/[0.08] rounded-[50%] blur-[80px]" />
            <div className="absolute top-[10%] right-[-10%] w-[50%] h-[70%] bg-orange-400/[0.10] dark:bg-orange-400/[0.06] rounded-[50%] blur-[60px]" />
          </div>
          <img
            src="/hero-banner.webp"
            alt="SouqOne - سوق وان"
            className="relative w-full h-auto object-contain drop-shadow-[0_8px_24px_rgba(15,23,42,0.10)] dark:drop-shadow-[0_8px_24px_rgba(0,0,0,0.4)]"
            style={{ animation: 'hero-entrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, hero-glow 4s ease-in-out 1.2s infinite' }}
          />
        </div>

        {/* ── Search Box with Backdrop Blur ── */}
        <div className="w-[92%] sm:w-[85%] md:w-[78%] lg:max-w-3xl mx-auto" style={{ animation: 'hero-search-entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both' }}>
          <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl border border-white/60 dark:border-white/[0.08] shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200/60 dark:border-white/[0.06]">
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
              <div className="flex-1 flex items-center gap-2 sm:gap-3 bg-slate-100/80 dark:bg-white/[0.05] rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:ring-2 focus-within:ring-primary/30 focus-within:bg-white dark:focus-within:bg-white/[0.08] transition-all">
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
              <button type="submit" className="btn-editorial shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-[13px] sm:text-sm rounded-xl flex items-center gap-1.5 hover:shadow-ambient hover:brightness-105 active:scale-[0.97] transition-all">
                <span className="material-symbols-outlined text-sm sm:text-base">search</span>
                <span className="hidden sm:inline">بحث</span>
              </button>
            </form>
          </div>
        </div>

        {/* Quick stats + CTA */}
        <div className="w-[92%] sm:w-[85%] md:w-[78%] lg:max-w-3xl mx-auto mt-5 flex flex-col sm:flex-row items-center gap-3 sm:gap-4" style={{ animation: 'hero-search-entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both' }}>
          <div className="flex items-center gap-3 sm:gap-5 flex-1 flex-wrap justify-center sm:justify-start">
            {stats.map(s => (
              <div key={s.label} className="flex items-center gap-1.5 text-slate-500 dark:text-on-surface-variant">
                <span className="material-symbols-outlined text-primary text-sm sm:text-base">{s.icon}</span>
                <span className="text-[11px] sm:text-xs font-black text-slate-700 dark:text-on-surface">{s.count}</span>
                <span className="text-[10px] sm:text-[11px] hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
          <Link
            href="/add-listing"
            className="btn-green px-5 py-2.5 text-xs font-black rounded-xl flex items-center gap-1.5 hover:brightness-110 shrink-0 transition-all animate-hero-float"
          >
            <span className="material-symbols-outlined text-sm">add_circle</span>
            أضف إعلانك مجاناً
          </Link>
        </div>
      </div>
    </section>
  );
}
