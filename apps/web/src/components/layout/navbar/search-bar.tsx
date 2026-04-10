'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const searchCategories = [
  { value: 'all', label: 'الكل', placeholder: 'ابحث في سوق وان...', route: '/listings' },
  { value: 'cars', label: 'سيارات', placeholder: 'ابحث: ماركة، موديل، سنة...', route: '/listings' },
  { value: 'parts', label: 'قطع غيار', placeholder: 'ابحث عن قطعة غيار...', route: '/parts' },
  { value: 'services', label: 'خدمات', placeholder: 'ابحث عن خدمة سيارات...', route: '/services' },
  { value: 'transport', label: 'نقل', placeholder: 'ابحث عن خدمة نقل...', route: '/transport' },
  { value: 'jobs', label: 'وظائف', placeholder: 'ابحث عن وظيفة سائق...', route: '/jobs' },
];

interface NavSearchBarProps {
  searchOpen: boolean;
  onSearchOpenChange: (open: boolean) => void;
  onCloseMobile?: () => void;
  height: number;
  navLinks: { href: string; label: string }[];
  isActive: (href: string) => boolean;
}

export function NavSearchBar({ searchOpen, onSearchOpenChange, onCloseMobile, height }: NavSearchBarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [catOpen, setCatOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const activeCat = searchCategories.find(c => c.value === searchCategory) ?? searchCategories[0];

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`${activeCat.route}?search=${encodeURIComponent(searchQuery.trim())}`);
    onSearchOpenChange(false);
    onCloseMobile?.();
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-center" style={{ height }} dir="rtl">
      <div className="flex items-center gap-2 sm:gap-3 w-full max-w-[800px]">
        <form onSubmit={handleSearch} className="flex flex-1 h-[36px] rounded-xl border border-outline-variant/15 dark:border-outline-variant/30 bg-surface-container-lowest dark:bg-surface-container shadow-sm dark:shadow-none focus-within:border-primary/40 dark:focus-within:border-primary/50 focus-within:shadow-[0_0_0_3px_rgba(0,74,198,0.08)] dark:focus-within:shadow-[0_0_0_3px_rgba(96,165,250,0.15)] transition-all">
          <div className="relative" ref={catRef}>
            <button
              type="button"
              onClick={() => setCatOpen(p => !p)}
              className="h-full px-2.5 sm:px-3.5 bg-surface-container-low/60 dark:bg-surface-container-high/60 flex items-center gap-1 text-[12px] sm:text-[13px] font-bold text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors border-l border-outline-variant/15 dark:border-outline-variant/30 rounded-r-xl"
            >
              {activeCat.label}
              <span className={`material-symbols-outlined text-[11px] transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            {catOpen && (
              <div className="absolute top-full right-0 mt-1.5 bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/15 dark:border-outline-variant/30 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] z-50 min-w-[140px] rounded-xl overflow-hidden py-1">
                {searchCategories.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => { setSearchCategory(cat.value); setCatOpen(false); }}
                    className={`w-full text-right px-4 py-2 text-[13px] font-semibold transition-colors ${
                      searchCategory === cat.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container-highest'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={activeCat.placeholder}
            className="flex-1 h-full px-3 sm:px-4 text-[13px] sm:text-sm font-medium text-on-surface bg-transparent focus:outline-none placeholder:text-on-surface-variant/40 min-w-0"
          />
          <button
            type="submit"
            className="h-full px-3 sm:px-4 bg-primary text-on-primary flex items-center justify-center hover:brightness-110 transition-colors rounded-l-xl"
          >
            <span className="material-symbols-outlined text-base">search</span>
          </button>
        </form>
        <Link href="/add-listing" className="shrink-0 btn-green h-[36px] px-3 sm:px-4 text-[12px] sm:text-[13px] font-bold flex items-center gap-1.5 hover:brightness-105 hover:shadow-ambient">
          <span className="material-symbols-outlined text-sm">add</span>
          <span className="hidden sm:inline">أضف إعلان</span>
        </Link>
      </div>
    </div>
  );
}
