'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getImageUrl } from '@/lib/image-utils';
import { relativeTimeT } from '@/lib/time-utils';
import { useTranslations, useLocale } from 'next-intl';

const SECTION_ROUTES: Record<string, string> = {
  LISTING: '/cars',
  BUS_LISTING: '/buses',
  EQUIPMENT_LISTING: '/equipment',
  OPERATOR_LISTING: '/equipment/operators',
  SPARE_PART: '/parts',
  CAR_SERVICE: '/services',
  TRANSPORT: '/transport',
  TRIP: '/trips',
  JOB: '/jobs',
};

const SECTION_ICONS: Record<string, string> = {
  LISTING: 'directions_car',
  BUS_LISTING: 'directions_bus',
  EQUIPMENT_LISTING: 'construction',
  OPERATOR_LISTING: 'engineering',
  SPARE_PART: 'build',
  CAR_SERVICE: 'car_repair',
  TRANSPORT: 'local_shipping',
  TRIP: 'route',
  JOB: 'work',
};

const SECTION_COLORS: Record<string, string> = {
  LISTING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  BUS_LISTING: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  EQUIPMENT_LISTING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  OPERATOR_LISTING: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  SPARE_PART: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  CAR_SERVICE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  TRANSPORT: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  TRIP: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  JOB: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
};

export interface GenericListingCardProps {
  id: string;
  title: string;
  sectionType: string;
  price?: string | number | null;
  currency?: string;
  governorate?: string | null;
  imageUrl?: string | null;
  status?: string;
  createdAt?: string;
  description?: string | null;
  showBadge?: boolean;
  actions?: React.ReactNode;
}

export function GenericListingCard(props: GenericListingCardProps) {
  const tl = useTranslations('listings');
  const tt = useTranslations('time');
  const locale = useLocale();
  const imgSrc = getImageUrl(props.imageUrl);
  const route = SECTION_ROUTES[props.sectionType] || '/';
  const icon = SECTION_ICONS[props.sectionType] || 'article';
  const badgeColor = SECTION_COLORS[props.sectionType] || 'bg-gray-100 text-gray-700';

  const priceDisplay = props.price
    ? `${Number(props.price).toLocaleString('en-US')} ${props.currency || 'OMR'}`
    : null;

  return (
    <Link
      href={`${route}/${props.id}`}
      className="group block rounded-2xl border border-outline-variant/10 dark:border-outline-variant/20 bg-surface-container-lowest dark:bg-surface-container overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] bg-surface-container-low dark:bg-surface-container-high overflow-hidden">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={props.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant/30">
            <span className="material-symbols-outlined text-3xl sm:text-4xl">{icon}</span>
            <span className="text-[9px] font-medium">{tl('noImage')}</span>
          </div>
        )}
        {/* Section badge */}
        {props.showBadge !== false && (
          <div className={`absolute top-2 start-2 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${badgeColor}`}>
            <span className="material-symbols-outlined text-xs">{icon}</span>
          </div>
        )}
        {/* Status badge */}
        {props.status && props.status !== 'ACTIVE' && (
          <div className="absolute top-2 end-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            {props.status === 'INACTIVE' ? 'غير نشط' : props.status === 'SOLD' ? 'مباع' : props.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-bold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
          {props.title}
        </h3>

        {props.description && (
          <p className="text-[11px] text-on-surface-variant/70 line-clamp-1">{props.description}</p>
        )}

        <div className="flex items-center justify-between gap-2">
          {priceDisplay ? (
            <span className="text-sm font-extrabold text-primary">{priceDisplay}</span>
          ) : (
            <span className="text-[11px] text-on-surface-variant/50">اتصل للسعر</span>
          )}
        </div>

        <div className="flex items-center justify-between text-[10px] text-on-surface-variant/60">
          {props.governorate && (
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {props.governorate}
            </span>
          )}
          {props.createdAt && (
            <span>{relativeTimeT(props.createdAt, tt, locale)}</span>
          )}
        </div>

        {/* Custom actions slot */}
        {props.actions && (
          <div className="pt-1.5 border-t border-outline-variant/10" onClick={e => e.preventDefault()}>
            {props.actions}
          </div>
        )}
      </div>
    </Link>
  );
}
