'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getImageUrl } from '@/lib/image-utils';
import { relativeTimeT } from '@/lib/time-utils';
import { useTranslations, useLocale } from 'next-intl';
import { resolveLocationLabel } from '@/lib/location-data';

const SECTION_ROUTES: Record<string, string> = {
  LISTING: '/sale/car',
  BUS_LISTING: '/sale/bus',
  EQUIPMENT_LISTING: '/sale/equipment',
  OPERATOR_LISTING: '/equipment/operators',
  SPARE_PART: '/sale/part',
  CAR_SERVICE: '/sale/service',
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
    <article className="h-full rounded-xl overflow-hidden bg-surface-container-lowest group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300 border border-outline-variant/10">
      <Link href={`${route}/${props.id}`} className="h-full flex flex-col">

        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={props.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant/30">
              <span className="material-symbols-outlined text-3xl sm:text-4xl">{icon}</span>
              <span className="text-[9px] font-medium">{tl('noImage')}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* Section badge top-right */}
          {props.showBadge !== false && (
            <span className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold ${badgeColor}`}>
              <span className="material-symbols-outlined text-[8px] sm:text-xs">{icon}</span>
            </span>
          )}

          {/* Status badge top-left */}
          {props.status && props.status !== 'ACTIVE' && (
            <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-yellow-400 text-yellow-900">
              {props.status === 'INACTIVE' ? 'غير نشط' : props.status === 'SOLD' ? 'مباع' : props.status}
            </span>
          )}

          {/* Price bottom-right */}
          {priceDisplay && (
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
              <span className="px-1.5 sm:px-2 py-px sm:py-0.5 rounded text-[9px] sm:text-xs font-black tracking-tight shadow-sm bg-primary text-on-primary">
                {priceDisplay}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">
          <h3 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1">{props.title}</h3>

          {/* type · date · location */}
          <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[10px] text-on-surface-variant">
            {props.createdAt && (
              <span className="shrink-0">{relativeTimeT(props.createdAt, tt, locale)}</span>
            )}
            {props.createdAt && props.governorate && <span className="text-outline/40">·</span>}
            {props.governorate && (
              <span className="flex items-center gap-px shrink-0">
                <span className="material-symbols-outlined text-[9px] sm:text-[11px]">location_on</span>
                {resolveLocationLabel(props.governorate, locale)}
              </span>
            )}
          </div>

          {/* Custom actions slot */}
          {props.actions && (
            <div className="pt-1.5 border-t border-outline-variant/10 mt-auto" onClick={e => e.preventDefault()}>
              {props.actions}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
