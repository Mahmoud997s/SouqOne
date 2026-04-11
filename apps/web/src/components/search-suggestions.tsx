'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAutocomplete } from '@/lib/api/search';
import { Search, Clock, TrendingUp, X } from 'lucide-react';

const RECENT_SEARCHES_KEY = 'carone.recent_searches';
const MAX_RECENT = 5;

const POPULAR_SEARCHES = [
  'تويوتا لاندكروزر',
  'نيسان باترول',
  'هوندا سيفيك',
  'تويوتا كامري',
  'سيارات للإيجار',
];

function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

interface SearchSuggestionsProps {
  onClose?: () => void;
  className?: string;
}

export function SearchSuggestions({ onClose, className }: SearchSuggestionsProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: suggestions } = useAutocomplete(query);
  const recentSearches = getRecentSearches();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    saveRecentSearch(q.trim());
    setShowDropdown(false);
    onClose?.();
    router.push(`/listings?search=${encodeURIComponent(q.trim())}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearRecent = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setShowDropdown(false);
  };

  const ENTITY_LABELS: Record<string, string> = {
    LISTING: 'سيارة',
    SPARE_PART: 'قطعة غيار',
    SERVICE: 'خدمة',
    JOB: 'وظيفة',
    TRANSPORT: 'نقل',
    TRIP: 'رحلة',
    INSURANCE: 'تأمين',
  };

  return (
    <div ref={dropdownRef} className={`relative ${className ?? ''}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="ابحث عن سيارات، قطع غيار، خدمات..."
          className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/20 rounded-xl py-2.5 pr-10 pl-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 hover:text-on-surface-variant"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-2 inset-x-0 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl shadow-lg overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
          {/* Autocomplete results */}
          {query.length >= 2 && suggestions && suggestions.length > 0 && (
            <div className="p-2">
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSearch(s.title)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-right hover:bg-surface-container transition-colors"
                >
                  <Search size={14} className="text-on-surface-variant/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface truncate" dangerouslySetInnerHTML={{ __html: s.highlighted || s.title }} />
                    <p className="text-[11px] text-on-surface-variant">{ENTITY_LABELS[s.entityType] || s.entityType}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent searches */}
          {query.length < 2 && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-1.5 mb-1">
                <span className="text-xs font-bold text-on-surface-variant">عمليات بحث سابقة</span>
                <button onClick={clearRecent} className="text-[11px] text-primary hover:underline">مسح</button>
              </div>
              {recentSearches.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSearch(s)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-right hover:bg-surface-container transition-colors"
                >
                  <Clock size={14} className="text-on-surface-variant/30 shrink-0" />
                  <span className="text-sm text-on-surface">{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular searches */}
          {query.length < 2 && (
            <div className="p-2 border-t border-outline-variant/10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 mb-1">
                <TrendingUp size={13} className="text-primary" />
                <span className="text-xs font-bold text-on-surface-variant">عمليات بحث شائعة</span>
              </div>
              <div className="flex flex-wrap gap-1.5 px-3 pb-2">
                {POPULAR_SEARCHES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primary hover:text-on-primary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results */}
          {query.length >= 2 && suggestions && suggestions.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-on-surface-variant">لا توجد نتائج لـ "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
