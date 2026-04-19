'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { getGovernorates, type LocationOption } from '@/lib/location-data';

const HERO_SLIDES = ['/hero-banner.png', '/hero-banner-2.png'];
const SLIDE_INTERVAL = 5000;

const TRUST_BADGES = [
  { icon: 'verified_user',     key: 'heroBadgeTrusted' },
  { icon: 'bolt',              key: 'heroBadgeFast' },
  { icon: 'workspace_premium', key: 'heroBadgeReliable' },
] as const;

const OMAN_GOVS = getGovernorates('OM');

export function HeroSection() {
  const router = useRouter();
  const t = useTranslations('home');
  const tc = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedGov, setSelectedGov] = useState<{ value: string; label: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    if (window.innerWidth >= 640) inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, [nextSlide]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (selectedGov) params.set('governorate', selectedGov.value);
    const qs = params.toString();
    router.push(`/listings${qs ? `?${qs}` : ''}` as any);
  }

  return (
    <section>
      {/* ── Search Bar ── */}
      <div className="px-3 sm:px-6 lg:max-w-3xl lg:mx-auto py-2">
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container rounded-full border border-outline-variant/20 ps-1.5 pe-1.5 py-1 shadow-sm"
        >
          <div ref={dropdownRef} className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 text-xs sm:text-sm font-bold text-on-surface bg-surface-container-low dark:bg-surface-container-high rounded-full px-2.5 py-1.5 sm:px-3 sm:py-2 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[14px] sm:text-[16px] text-primary">location_on</span>
              <span>{selectedGov ? selectedGov.label : t('heroLocation')}</span>
              <span className="material-symbols-outlined text-[12px] sm:text-[14px] text-on-surface-variant">expand_more</span>
            </button>
            {showDropdown && (
              <div className="absolute top-full mt-1 start-0 z-50 w-44 max-h-56 overflow-y-auto rounded-xl border border-outline-variant/20 bg-surface-container-lowest dark:bg-surface-container shadow-lg py-1">
                <button
                  type="button"
                  onClick={() => { setSelectedGov(null); setShowDropdown(false); }}
                  className={`w-full text-start px-3 py-2 text-xs sm:text-sm hover:bg-surface-container-low transition-colors ${!selectedGov ? 'text-primary font-bold' : 'text-on-surface'}`}
                >
                  {t('heroLocationAll')}
                </button>
                {OMAN_GOVS.map((gov: LocationOption) => (
                  <button
                    key={gov.value}
                    type="button"
                    onClick={() => { setSelectedGov(gov); setShowDropdown(false); }}
                    className={`w-full text-start px-3 py-2 text-xs sm:text-sm hover:bg-surface-container-low transition-colors ${selectedGov?.value === gov.value ? 'text-primary font-bold' : 'text-on-surface'}`}
                  >
                    {gov.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('heroSearchPlaceholder')}
            dir="auto"
            className="flex-1 bg-transparent text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none min-w-0 text-start"
          />

          <button
            type="submit"
            className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 bg-primary rounded-full flex items-center justify-center hover:brightness-110 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-on-primary text-[16px] sm:text-[18px]">search</span>
          </button>
        </form>
      </div>

      {/* ── Hero Banner Slider ── */}
      <div className="px-3 sm:px-6 pb-3">
        <div className="relative w-full overflow-hidden aspect-[16/9] sm:aspect-[16/5] lg:aspect-[16/5.5] xl:aspect-[16/5] rounded-2xl sm:rounded-3xl">
          {HERO_SLIDES.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={tc('siteName')}
              fill
              priority={i === 0}
              className={`object-cover transition-opacity duration-700 ${i === activeSlide ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e52] via-[#102a6e]/60 to-transparent" />

          {/* Dot indicators */}
          <div className="absolute top-2.5 sm:top-4 lg:top-5 inset-x-0 flex justify-center gap-1.5 sm:gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveSlide(i)}
                className={`h-2 sm:h-2.5 rounded-full transition-all ${i === activeSlide ? 'bg-white w-5 sm:w-7' : 'bg-white/50 w-2 sm:w-2.5'}`}
              />
            ))}
          </div>

          <div className="absolute bottom-0 inset-x-0 px-4 sm:px-8 lg:px-12 xl:px-16 pb-3 sm:pb-6 lg:pb-10 xl:pb-12 text-white">
            <h1 className="text-[11px] sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight mb-0.5 sm:mb-1 lg:mb-2">
              {t('heroTitle')}
            </h1>
            <p className="text-[8px] sm:text-sm md:text-base lg:text-lg text-white/80 leading-snug mb-1 sm:mb-3 lg:mb-5 max-w-lg lg:max-w-xl">
              {t('heroSubtitle')}
            </p>

            <div className="flex items-center gap-1 sm:gap-3 lg:gap-4 mb-1 sm:mb-3 lg:mb-5">
              <Link
                href="/add-listing"
                className="btn-brand shrink-0 flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-5 lg:px-7 py-0.5 sm:py-2.5 lg:py-3 text-[7px] sm:text-sm lg:text-base font-black rounded-md sm:rounded-xl hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-[8px] sm:text-sm lg:text-base">add_circle</span>
                {t('heroAddCta')}
              </Link>
              <Link
                href="/listings"
                className="shrink-0 flex items-center gap-0.5 sm:gap-1.5 px-1.5 sm:px-5 lg:px-7 py-0.5 sm:py-2.5 lg:py-3 text-[7px] sm:text-sm lg:text-base font-bold rounded-md sm:rounded-xl border border-white/30 text-white hover:bg-white/10 transition-all"
              >
                <span className="material-symbols-outlined text-[8px] sm:text-sm lg:text-base">explore</span>
                {t('heroExploreCta')}
              </Link>
            </div>

            <div className="flex items-center gap-0.5 sm:gap-2 lg:gap-3 flex-wrap">
              {TRUST_BADGES.map(b => (
                <span
                  key={b.key}
                  className="inline-flex items-center gap-0.5 sm:gap-1 text-[5px] sm:text-[11px] lg:text-xs font-bold bg-white/15 backdrop-blur-sm rounded-full px-1 py-px sm:px-2.5 sm:py-1 lg:px-3 lg:py-1.5"
                >
                  <span className="material-symbols-outlined text-[5px] sm:text-[12px] lg:text-sm">{b.icon}</span>
                  {t(b.key)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
