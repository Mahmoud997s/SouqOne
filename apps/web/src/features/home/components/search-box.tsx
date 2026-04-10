'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

const categories = [
  { key: 'all',       label: 'الكل',      icon: 'search',              route: '/listings',  placeholder: 'ابحث في سوق وان...' },
  { key: 'cars',      label: 'سيارات',    icon: 'directions_car',      route: '/listings',  placeholder: 'ماركة، موديل، سنة...' },
  { key: 'rentals',   label: 'إيجار',     icon: 'car_rental',          route: '/rentals',   placeholder: 'ابحث عن سيارة للإيجار...' },
  { key: 'parts',     label: 'قطع غيار',  icon: 'build',               route: '/parts',     placeholder: 'ابحث عن قطعة غيار...' },
  { key: 'services',  label: 'خدمات',     icon: 'home_repair_service', route: '/services',  placeholder: 'ابحث عن خدمة سيارات...' },
  { key: 'transport', label: 'نقل',       icon: 'local_shipping',      route: '/transport', placeholder: 'ابحث عن خدمة نقل...' },
  { key: 'trips',     label: 'رحلات',     icon: 'tour',                route: '/trips',     placeholder: 'ابحث عن رحلة...' },
  { key: 'insurance', label: 'تأمين',     icon: 'verified_user',       route: '/insurance', placeholder: 'ابحث عن تأمين...' },
  { key: 'jobs',      label: 'وظائف',     icon: 'work',                route: '/jobs',      placeholder: 'ابحث عن وظيفة سائق...' },
];

export function SearchBox() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeKey, setActiveKey] = useState('all');
  const [query, setQuery] = useState('');
  const cat = categories.find(c => c.key === activeKey)!;

  useEffect(() => { inputRef.current?.focus(); }, [activeKey]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`${cat.route}?search=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-6 pb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-1 bg-primary" />
        <h2 className="text-2xl font-black">ابحث في سوق وان</h2>
      </div>
      <div className="bg-surface-container-lowest dark:bg-surface-container-high rounded-xl shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden">

        {/* ── Category Tabs ── */}
        <div className="flex overflow-x-auto no-scrollbar">
          {categories.map((c) => {
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
                {c.label}
              </button>
            );
          })}
        </div>

        {/* ── Search Input ── */}
        <form onSubmit={handleSearch} className="p-4 sm:p-5" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="flex-1 flex items-center gap-3 bg-surface-container-low dark:bg-surface-container rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/30 transition-all">
              <span className="material-symbols-outlined text-on-surface-variant/40 text-xl shrink-0">search</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={cat.placeholder}
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
              className="btn-editorial shrink-0 px-6 py-3 font-bold text-sm flex items-center justify-center gap-2 hover:shadow-ambient hover:brightness-105 active:scale-[0.97]"
            >
              <Search size={16} />
              <span>بحث</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
