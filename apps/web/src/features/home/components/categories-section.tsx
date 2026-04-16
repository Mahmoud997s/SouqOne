'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const CAT_META = [
  { labelKey: 'catCars',      descKey: 'catCarsDesc',      icon: 'directions_car',   href: '/listings',   color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  { labelKey: 'catBuses',     descKey: 'catBusesDesc',     icon: 'directions_bus',   href: '/buses',      color: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400' },
  { labelKey: 'catParts',     descKey: 'catPartsDesc',     icon: 'settings',         href: '/parts',      color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' },
  { labelKey: 'catServices',  descKey: 'catServicesDesc',  icon: 'build',            href: '/services',   color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  { labelKey: 'catEquipment', descKey: 'catEquipmentDesc', icon: 'construction',     href: '/equipment',  color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  { labelKey: 'catInsurance', descKey: 'catInsuranceDesc', icon: 'shield',           href: '/insurance',  color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
  { labelKey: 'catJobs',      descKey: 'catJobsDesc',      icon: 'badge',            href: '/jobs',       color: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
] as const;

export function CategoriesSection() {
  const t = useTranslations('home');
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-8 w-1 bg-primary" />
        <h2 className="text-2xl font-black">{t('browseCategories')}</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
        {CAT_META.map((cat) => (
          <Link
            key={cat.labelKey}
            href={cat.href}
            className="group bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 p-3 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${cat.color} transition-transform group-hover:scale-110`}>
              <span className="material-symbols-outlined text-xl sm:text-2xl">{cat.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-on-surface mb-0.5">{t(cat.labelKey)}</h3>
              <span className="text-[10px] sm:text-[11px] text-on-surface-variant">{t(cat.descKey)}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
