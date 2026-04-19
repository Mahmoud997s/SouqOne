'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';

const CAT_META = [
  { labelKey: 'catCars',      descKey: 'catCarsDesc',      icon: 'directions_car',   href: '/listings',   color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  { labelKey: 'catBuses',     descKey: 'catBusesDesc',     icon: 'directions_bus',   href: '/buses',      color: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400' },
  { labelKey: 'catParts',     descKey: 'catPartsDesc',     icon: 'settings',         href: '/parts',      color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' },
  { labelKey: 'catServices',  descKey: 'catServicesDesc',  icon: 'build',            href: '/services',   color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  { labelKey: 'catEquipment', descKey: 'catEquipmentDesc', icon: 'construction',     href: '/equipment',  color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  { labelKey: 'catJobs',      descKey: 'catJobsDesc',      icon: 'badge',            href: '/jobs',       color: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
  { labelKey: 'catTransport', descKey: 'catTransportDesc', icon: 'local_shipping',   href: '/transport',  color: 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400' },
  { labelKey: 'catTrips',     descKey: 'catTripsDesc',     icon: 'travel_explore',   href: '/trips',      color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' },
  { labelKey: 'catRentals',   descKey: 'catRentalsDesc',   icon: 'car_rental',       href: '/rentals',    color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
] as const;

const SLIDE_INTERVAL = 3000;

export function CategoriesSection() {
  const t = useTranslations('home');
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const dirRef = useRef(1);

  useEffect(() => {
    const maxPos = CAT_META.length - 4;
    const isRtl = document.documentElement.dir === 'rtl';

    const timer = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const item = track.children[0] as HTMLElement;
      if (!item) return;

      posRef.current += dirRef.current;
      if (posRef.current >= maxPos) { posRef.current = maxPos; dirRef.current = -1; }
      if (posRef.current <= 0) { posRef.current = 0; dirRef.current = 1; }

      const step = item.offsetWidth + 8;
      const sign = isRtl ? 1 : -1;
      track.style.transform = `translateX(${posRef.current * sign * step}px)`;
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-8">
        <div className="h-6 sm:h-8 w-1 rounded-full bg-primary" />
        <h2 className="text-sm sm:text-xl md:text-3xl font-black tracking-tight whitespace-nowrap">{t('browseCategories')}</h2>
      </div>

      {/* Mobile: sliding window carousel — always shows 4, shifts 1 at a time */}
      <div className="lg:hidden overflow-hidden">
        <div ref={trackRef} className="flex gap-2 transition-transform duration-500 ease-in-out">
          {CAT_META.map((cat) => (
            <Link
              key={cat.labelKey}
              href={cat.href}
              className="group shrink-0 flex flex-col items-center text-center gap-1.5 py-3 rounded-2xl bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 hover:border-primary/20 active:scale-[0.97] transition-all duration-300"
              style={{ width: 'calc((100% - 24px) / 4)' }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cat.color} shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 group-hover:scale-110`}>
                <span className="material-symbols-outlined text-base">{cat.icon}</span>
              </div>
              <div className="px-0.5">
                <h3 className="font-bold text-[9px] text-on-surface leading-tight mb-0.5">{t(cat.labelKey)}</h3>
                <p className="text-[7px] text-on-surface-variant/60 leading-tight">{t(cat.descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: normal grid */}
      <div className="hidden lg:flex gap-3 flex-wrap justify-center">
        {CAT_META.map((cat) => (
          <Link
            key={cat.labelKey}
            href={cat.href}
            className="group shrink-0 w-[116px] flex flex-col items-center text-center gap-2.5 py-5 rounded-2xl bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] active:scale-[0.97] transition-all duration-300"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color} shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md`}>
              <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
            </div>
            <div className="px-0.5">
              <h3 className="font-bold text-sm text-on-surface leading-tight mb-0.5">{t(cat.labelKey)}</h3>
              <p className="text-[11px] text-on-surface-variant/60 leading-tight">{t(cat.descKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
