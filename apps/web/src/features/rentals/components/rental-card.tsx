'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getImageUrl } from '@/lib/image-utils';
import { fuelLabels, transmissionLabels, BADGE_COLORS, PILL_COLORS } from '@/lib/constants/mappings';
import { useTranslations } from 'next-intl';

interface RentalCardProps {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  dailyPrice?: string | number | null;
  weeklyPrice?: string | number | null;
  monthlyPrice?: string | number | null;
  currency: string;
  mileage?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  governorate?: string | null;
  imageUrl?: string | null;
  withDriver?: boolean;
  insuranceIncluded?: boolean;
  deliveryAvailable?: boolean;
}

function fmt(price: string | number | null | undefined) {
  if (!price) return null;
  return Number(price).toLocaleString('en-US');
}

export function RentalCard(props: RentalCardProps) {
  const t = useTranslations('listings');
  const tm = useTranslations('mappings');
  const fuels = fuelLabels(tm);
  const transmissions = transmissionLabels(tm);
  const dailyFormatted = fmt(props.dailyPrice);
  const weeklyFormatted = fmt(props.weeklyPrice);
  const monthlyFormatted = fmt(props.monthlyPrice);
  const imgSrc = getImageUrl(props.imageUrl);

  const features = [
    props.withDriver && { icon: 'person', label: t('withDriver') },
    props.insuranceIncluded && { icon: 'verified_user', label: t('fullInsurance') },
    props.deliveryAvailable && { icon: 'local_shipping', label: t('delivery') },
  ].filter(Boolean) as { icon: string; label: string }[];

  return (
    <article
      className="h-full rounded-xl overflow-hidden bg-surface-container-lowest border-t-[3px] border-t-emerald-500 group hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] transition-all duration-300"
      data-testid="rental-card"
    >
      <Link href={`/cars/${props.id}`} className="h-full flex flex-col">

        {/* ── Image ── */}
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={props.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-on-surface-variant/30">
              <span className="material-symbols-outlined text-5xl">car_rental</span>
              <span className="text-[11px] font-medium">{t('noImage')}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

          {/* Top: Rental badge */}
          <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.rental}`}>
            {t('forRent')}
          </span>

          {/* Bottom: Daily price (right only) */}
          {dailyFormatted && (
            <div className="absolute bottom-3 right-3">
              <span className="bg-emerald-500 text-white px-3 py-1 rounded text-sm font-black tracking-tight">
                {dailyFormatted} <small className="text-[10px] font-bold opacity-80">{t('currencyPerDay')}</small>
              </span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-4 flex-1 flex flex-col gap-2.5">

          {/* Title */}
          <h3 className="text-base font-black leading-snug line-clamp-1">{props.title}</h3>

          {/* Meta: location · car info */}
          <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant leading-none">
            {props.governorate && (
              <>
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                <span>{props.governorate}</span>
                <span className="text-outline-variant/40 mx-0.5">·</span>
              </>
            )}
            <span>{props.make} {props.model} {props.year}</span>
          </div>

          {/* Feature pills (moved from image to body) */}
          {features.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {features.map((f) => (
                <span key={f.label} className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 ${PILL_COLORS.green}`}>
                  <span className="material-symbols-outlined text-[12px]">{f.icon}</span>
                  {f.label}
                </span>
              ))}
            </div>
          )}

          {/* Pricing tiers */}
          {(weeklyFormatted || monthlyFormatted) && (
            <div className="flex items-center gap-3 text-[11px]">
              {weeklyFormatted && (
                <span className="text-on-surface-variant">
                  {t('weekly')} <strong className="text-on-surface">{weeklyFormatted}</strong> {t('currencyUnit')}
                </span>
              )}
              {monthlyFormatted && (
                <span className="text-on-surface-variant">
                  {t('monthly')} <strong className="text-on-surface">{monthlyFormatted}</strong> {t('currencyUnit')}
                </span>
              )}
            </div>
          )}

          {/* Specs Grid — 3 columns */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded-lg py-2 px-1">
              <span className="material-symbols-outlined text-emerald-500 text-[16px]">speed</span>
              <span className="text-[11px] font-bold text-on-surface leading-none">
                {props.mileage != null ? props.mileage.toLocaleString('en-US') : '0'}
              </span>
              <span className="text-[10px] text-on-surface-variant">{t('km')}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded-lg py-2 px-1">
              <span className="material-symbols-outlined text-emerald-500 text-[16px]">local_gas_station</span>
              <span className="text-[11px] font-bold text-on-surface leading-none">
                {props.fuelType ? (fuels[props.fuelType] ?? props.fuelType) : t('petrol')}
              </span>
              <span className="text-[10px] text-on-surface-variant">{t('fuel')}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded-lg py-2 px-1">
              <span className="material-symbols-outlined text-emerald-500 text-[16px]">settings</span>
              <span className="text-[11px] font-bold text-on-surface leading-none">
                {props.transmission ? (transmissions[props.transmission] ?? props.transmission) : t('automatic')}
              </span>
              <span className="text-[10px] text-on-surface-variant">{t('transmission')}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/10">
            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold group-hover:underline">{t('rentalDetails')}</span>
            <span className="material-symbols-outlined icon-flip text-emerald-500 text-sm rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform">arrow_back</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
