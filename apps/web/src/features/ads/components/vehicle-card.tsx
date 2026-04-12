'use client';

import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';
import { FUEL_LABELS, TRANSMISSION_LABELS, CONDITION_BADGE, PILL_COLORS } from '@/lib/constants/mappings';
import { VerifiedBadge } from '@/components/verified-badge';
import { relativeTime } from '@/lib/time-utils';

interface VehicleCardProps {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: string | number;
  currency: string;
  mileage?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  condition?: string | null;
  governorate?: string | null;
  imageUrl?: string | null;
  distance?: number | null;
  viewCount?: number;
  createdAt?: string;
  isVerified?: boolean;
  isPriceNegotiable?: boolean;
  listingType?: string;
  dailyPrice?: string | number | null;
  monthlyPrice?: string | number | null;
}

function formatPrice(price: string | number, currency: string, suffix?: string) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  const formatted = `${num.toLocaleString('en-US')} ${currency === 'OMR' ? 'ر.ع' : currency}`;
  return suffix ? `${formatted}${suffix}` : formatted;
}

export function VehicleCard(props: VehicleCardProps) {
  const imgSrc = getImageUrl(props.imageUrl);
  const badge = props.condition ? CONDITION_BADGE[props.condition] : null;

  const priceText = props.listingType === 'RENTAL'
    ? formatPrice(props.dailyPrice || props.price, props.currency, '/يوم')
    : formatPrice(props.price, props.currency);

  return (
    <article
      className="h-full rounded-lg overflow-hidden bg-surface-container-lowest group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300"
      data-testid="listing-card"
    >
      <Link href={`/cars/${props.id}`} className="h-full flex flex-row sm:flex-col">

        {/* ── Image ── */}
        <div className="relative w-[130px] min-h-[120px] sm:w-full sm:min-h-0 sm:aspect-[16/10] overflow-hidden bg-surface-container-low shrink-0">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={props.title}
              fill
              sizes="(max-width: 640px) 130px, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-on-surface-variant/30">
              <span className="material-symbols-outlined text-4xl">directions_car</span>
            </div>
          )}

          {/* Gradient overlay bottom */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none hidden sm:block" />

          {/* ── Condition badge ── */}
          {badge && (
            <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] ${badge.cls}`}>
              {badge.label}
            </span>
          )}

          {/* ── Price on image (desktop only) ── */}
          <div className="absolute bottom-2 right-2 hidden sm:block">
            <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-xs font-black tracking-tight">
              {priceText}
            </span>
          </div>

          {/* Distance badge (desktop only on image) */}
          {props.distance != null && (
            <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white rounded px-1.5 py-0.5 items-center gap-0.5 text-[10px] font-bold hidden sm:flex">
              <span className="material-symbols-outlined text-[10px]">near_me</span>
              {props.distance < 1 ? `${Math.round(props.distance * 1000)} م` : `${props.distance} كم`}
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1 sm:gap-1.5 min-w-0 justify-center">

          {/* Title + Price row on mobile */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13px] font-black leading-snug line-clamp-1 min-w-0">{props.title}</h3>
            <span className="bg-primary text-on-primary px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-black tracking-tight whitespace-nowrap shrink-0 sm:hidden">
              {priceText}
            </span>
          </div>

          {/* Meta row: location · car info */}
          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant leading-none">
            {props.governorate && (
              <>
                <span className="material-symbols-outlined text-[11px]">location_on</span>
                <span className="truncate">{props.governorate}</span>
                <span className="text-outline-variant/40 mx-0.5">·</span>
              </>
            )}
            <span className="truncate">{props.make} {props.model} {props.year}</span>
          </div>

          {/* Badges row: condition + rental + negotiable + verified */}
          <div className="flex items-center gap-1 flex-wrap">
            {props.isVerified && <VerifiedBadge />}
            {props.listingType === 'RENTAL' && (
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 ${PILL_COLORS.green}`}>
                <span className="material-symbols-outlined text-[10px]">car_rental</span>
                للإيجار
              </span>
            )}
            {props.isPriceNegotiable && (
              <span className={`inline-flex items-center gap-0.5 text-[9px] font-black px-1.5 py-0.5 ${PILL_COLORS.info}`}>
                <span className="material-symbols-outlined text-[10px]">handshake</span>
                قابل للتفاوض
              </span>
            )}
            {props.distance != null && (
              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-on-surface-variant sm:hidden">
                <span className="material-symbols-outlined text-[10px]">near_me</span>
                {props.distance < 1 ? `${Math.round(props.distance * 1000)} م` : `${props.distance} كم`}
              </span>
            )}
          </div>

          {/* Specs row — inline on mobile, grid on desktop */}
          <div className="flex items-center gap-1.5 sm:grid sm:grid-cols-3 sm:gap-1">
            <span className="flex items-center gap-0.5 bg-surface-container-low rounded px-1.5 py-1 sm:flex-col sm:py-1.5 sm:px-0.5">
              <span className="material-symbols-outlined text-primary text-[12px] sm:text-[13px]">speed</span>
              <span className="text-[10px] font-bold text-on-surface leading-none">
                {props.mileage != null ? props.mileage.toLocaleString('en-US') : '0'}
              </span>
              <span className="text-[9px] text-on-surface-variant hidden sm:block">كم</span>
            </span>
            <span className="flex items-center gap-0.5 bg-surface-container-low rounded px-1.5 py-1 sm:flex-col sm:py-1.5 sm:px-0.5">
              <span className="material-symbols-outlined text-primary text-[12px] sm:text-[13px]">local_gas_station</span>
              <span className="text-[10px] font-bold text-on-surface leading-none">
                {props.fuelType ? (FUEL_LABELS[props.fuelType] ?? props.fuelType) : 'بنزين'}
              </span>
              <span className="text-[9px] text-on-surface-variant hidden sm:block">الوقود</span>
            </span>
            <span className="flex items-center gap-0.5 bg-surface-container-low rounded px-1.5 py-1 sm:flex-col sm:py-1.5 sm:px-0.5">
              <span className="material-symbols-outlined text-primary text-[12px] sm:text-[13px]">settings</span>
              <span className="text-[10px] font-bold text-on-surface leading-none">
                {props.transmission ? (TRANSMISSION_LABELS[props.transmission] ?? props.transmission) : 'أوتوماتيك'}
              </span>
              <span className="text-[9px] text-on-surface-variant hidden sm:block">ناقل الحركة</span>
            </span>
          </div>

          {/* Footer: time + views (left) · arrow (right) */}
          <div className="flex items-center justify-between mt-auto pt-1 sm:pt-1.5 border-t border-outline-variant/10">
            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant">
              {props.createdAt && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[11px]">schedule</span>
                  {relativeTime(props.createdAt)}
                </span>
              )}
              {props.viewCount != null && props.viewCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[11px]">visibility</span>
                  {props.viewCount}
                </span>
              )}
            </div>
            <span className="material-symbols-outlined text-primary text-xs group-hover:-translate-x-1 transition-transform">arrow_back</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
