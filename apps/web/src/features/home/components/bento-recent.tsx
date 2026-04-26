'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const QL_META = [
  { icon: 'electrical_services',   titleKey: 'qlElectrician',   href: '/browse/services?serviceType=MAINTENANCE',         color: 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
  { icon: 'oil_barrel',            titleKey: 'qlOilChange',     href: '/browse/services?serviceType=MAINTENANCE',         color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' },
  { icon: 'car_crash',             titleKey: 'qlTowing',        href: '/browse/services?serviceType=TOWING',              color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  { icon: 'tire_repair',           titleKey: 'qlMobileTire',    href: '/browse/services?serviceType=MAINTENANCE',         color: 'bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400' },
  { icon: 'battery_charging_full', titleKey: 'qlBattery',       href: '/browse/services?serviceType=MAINTENANCE',         color: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' },
  { icon: 'local_car_wash',        titleKey: 'qlCarWash',       href: '/browse/services?serviceType=CLEANING',            color: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400' },
  { icon: 'build',                 titleKey: 'qlMaintenance',   href: '/browse/services?serviceType=MAINTENANCE',         color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  { icon: 'search_check_2',        titleKey: 'qlInspection',    href: '/browse/services?serviceType=INSPECTION',          color: 'bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400' },
  { icon: 'format_paint',          titleKey: 'qlBodywork',      href: '/browse/services?serviceType=BODYWORK',            color: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' },
  { icon: 'tune',                  titleKey: 'qlModification',  href: '/browse/services?serviceType=MODIFICATION',        color: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' },
  { icon: 'dashboard_customize',   titleKey: 'qlAccessories',   href: '/browse/services?serviceType=ACCESSORIES_INSTALL', color: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400' },
  { icon: 'key',                   titleKey: 'qlKeysLocks',     href: '/browse/services?serviceType=KEYS_LOCKS',          color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' },
] as const;

export function QuickServicesGrid() {
  const t = useTranslations('home');
  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-2 sm:pt-3 pb-6 sm:pb-10">
      <div className="flex items-center justify-between mb-5 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="h-6 sm:h-8 w-1 rounded-full bg-primary" />
          <h2 className="text-base sm:text-xl md:text-3xl font-black tracking-tight">{t('quickServices')}</h2>
        </div>
        <Link href="/browse/services" className="text-primary font-semibold text-xs sm:text-sm hover:underline underline-offset-2 transition-colors">{t('servicesLink')}</Link>
      </div>

      <div className="flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar pb-1 ps-0.5">
        {QL_META.map((link) => (
          <Link
            key={link.titleKey}
            href={link.href}
            className="group shrink-0 flex items-center gap-2 sm:gap-2.5 pe-3 ps-1.5 py-1.5 sm:pe-4 sm:ps-2 sm:py-2 rounded-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 hover:border-primary/20 hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] active:scale-[0.97] transition-all duration-200"
          >
            <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 ${link.color} transition-transform duration-200 group-hover:scale-110`}>
              <span className="material-symbols-outlined text-sm sm:text-lg">{link.icon}</span>
            </div>
            <span className="font-semibold text-[10px] sm:text-xs text-on-surface whitespace-nowrap">{t(link.titleKey)}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
