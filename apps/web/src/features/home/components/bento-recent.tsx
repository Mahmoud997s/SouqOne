'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

const QL_META = [
  { icon: 'build',           titleKey: 'qlMaintenance',    descKey: 'qlMaintenanceDesc',    href: '/services',                      color: 'text-blue-500' },
  { icon: 'local_car_wash',  titleKey: 'qlCarWash',        descKey: 'qlCarWashDesc',        href: '/services',                      color: 'text-cyan-500' },
  { icon: 'settings',        titleKey: 'qlOriginalParts',  descKey: 'qlOriginalPartsDesc',  href: '/parts',                         color: 'text-orange-500' },
  { icon: 'local_shipping',  titleKey: 'qlCargo',          descKey: 'qlCargoDesc',          href: '/coming-soon?section=transport', color: 'text-red-500' },
  { icon: 'weekend',         titleKey: 'qlFurniture',      descKey: 'qlFurnitureDesc',      href: '/coming-soon?section=transport', color: 'text-amber-600' },
  { icon: 'departure_board', titleKey: 'qlTrips',          descKey: 'qlTripsDesc',          href: '/coming-soon?section=trips',     color: 'text-teal-500' },
  { icon: 'shield',          titleKey: 'qlInsurance',      descKey: 'qlInsuranceDesc',      href: '/insurance',                     color: 'text-indigo-500' },
  { icon: 'car_crash',       titleKey: 'qlTowing',         descKey: 'qlTowingDesc',         href: '/services',                      color: 'text-rose-500' },
] as const;

export function QuickServicesGrid() {
  const t = useTranslations('home');
  return (
    <section className="bg-surface-container-low dark:bg-surface-dim py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-primary" />
              <h2 className="text-2xl font-black">{t('servicesAndTransport')}</h2>
            </div>
            <p className="text-on-surface-variant text-sm">{t('servicesAndTransportDesc')}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/services" className="text-primary font-bold text-xs hover:underline">{t('servicesLink')}</Link>
            <span className="text-outline-variant">|</span>
            <Link href="/coming-soon?section=transport" className="text-primary font-bold text-xs hover:underline">{t('transportLink')}</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QL_META.map((link) => (
            <Link
              key={link.titleKey}
              href={link.href}
              className="group bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 p-4 flex items-start gap-3 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <span className={`material-symbols-outlined text-2xl ${link.color} shrink-0 mt-0.5`}>{link.icon}</span>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-on-surface mb-0.5 truncate">{t(link.titleKey)}</h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">{t(link.descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
