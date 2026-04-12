'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';
import { FUEL_LABELS, TRANSMISSION_LABELS, CONDITION_BADGE, PILL_COLORS } from '@/lib/constants/mappings';
import { VerifiedBadge } from '@/components/verified-badge';
import { relativeTime } from '@/lib/time-utils';
import { useFavoriteIds, useToggleFavorite } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

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
  const { isAuthenticated } = useAuth();
  const { data: favIds } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const serverFav = favIds?.includes(`LISTING:${props.id}`) ?? false;
  const [localFav, setLocalFav] = useState(serverFav);
  const [animating, setAnimating] = useState(false);

  useEffect(() => { setLocalFav(serverFav); }, [serverFav]);

  const isWanted = props.listingType === 'WANTED';
  const priceText = isWanted
    ? (Number(props.price) > 0 ? `الميزانية: ${formatPrice(props.price, props.currency)}` : 'مطلوب')
    : props.listingType === 'RENTAL'
      ? formatPrice(props.dailyPrice || props.price, props.currency, '/يوم')
      : formatPrice(props.price, props.currency);

  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setLocalFav(!localFav);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 350);
    toggleFav.mutate({ entityType: 'LISTING', entityId: props.id });
  };

  return (
    <article
      className="h-full rounded-xl overflow-hidden bg-surface-container-lowest group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300 border border-outline-variant/10"
      data-testid="listing-card"
    >
      <Link href={`/cars/${props.id}`} className="h-full flex flex-col">

        {/* ── Image ── */}
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
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
              <span className="material-symbols-outlined text-3xl sm:text-4xl">directions_car</span>
              <span className="text-[9px] font-medium">لا توجد صورة</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* ── Favorite button (top-left) ── */}
          {isAuthenticated && (
            <button
              onClick={handleFav}
              className="absolute top-2 left-2 z-10 w-8 h-8 flex items-center justify-center"
              aria-label={localFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <span
                className={`material-symbols-outlined text-[22px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 ${
                  localFav ? 'text-red-500 scale-100' : 'text-white scale-100'
                } ${animating ? 'animate-[heartPop_0.35s_ease-out]' : ''}`}
                style={{ fontVariationSettings: localFav ? "'FILL' 1" : "'FILL' 0" }}
              >
                favorite
              </span>
            </button>
          )}

          {/* ── Condition / Wanted badge (top-right) ── */}
          {isWanted ? (
            <span className="absolute top-2 right-2 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-orange-500 text-white">
              مطلوب
            </span>
          ) : badge && (
            <span className={`absolute top-2 right-2 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${badge.cls}`}>
              {badge.label}
            </span>
          )}

          {/* ── Price (bottom-right on image) ── */}
          <div className="absolute bottom-2 right-2">
            <span className={`px-2 py-0.5 rounded text-[11px] sm:text-xs font-black tracking-tight shadow-sm ${
              isWanted ? 'bg-orange-500 text-white' : 'bg-primary text-on-primary'
            }`}>
              {priceText}
            </span>
          </div>

          {/* ── Distance (bottom-left on image) ── */}
          {props.distance != null && (
            <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white rounded px-1.5 py-0.5 flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold">
              <span className="material-symbols-outlined text-[10px]">near_me</span>
              {props.distance < 1 ? `${Math.round(props.distance * 1000)} م` : `${props.distance} كم`}
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">

          {/* Title */}
          <h3 className="text-xs sm:text-[13px] font-black leading-snug line-clamp-1">{props.title}</h3>

          {/* Meta: location · make model year */}
          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant leading-none">
            {props.governorate && (
              <>
                <span className="material-symbols-outlined text-[10px] sm:text-[11px]">location_on</span>
                <span>{props.governorate}</span>
                <span className="text-outline-variant/40 mx-0.5">·</span>
              </>
            )}
            <span className="truncate">{props.make} {props.model} {props.year}</span>
          </div>

          {/* Badges: verified + rental + negotiable */}
          {(props.isVerified || props.listingType === 'RENTAL' || props.isPriceNegotiable) && (
            <div className="flex items-center gap-1 flex-wrap">
              {props.isVerified && <VerifiedBadge />}
              {props.listingType === 'RENTAL' && (
                <span className={`inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded ${PILL_COLORS.green}`}>
                  <span className="material-symbols-outlined text-[9px] sm:text-[10px]">car_rental</span>
                  للإيجار
                </span>
              )}
              {props.isPriceNegotiable && (
                <span className={`inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded ${PILL_COLORS.info}`}>
                  <span className="material-symbols-outlined text-[9px] sm:text-[10px]">handshake</span>
                  قابل للتفاوض
                </span>
              )}
            </div>
          )}

          {/* Specs Grid — always 3 columns */}
          <div className="grid grid-cols-3 gap-1">
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded py-1 sm:py-1.5 px-0.5">
              <span className="material-symbols-outlined text-primary text-[12px] sm:text-[13px]">speed</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-on-surface leading-none">
                {props.mileage != null ? props.mileage.toLocaleString('en-US') : '0'}
              </span>
              <span className="text-[8px] sm:text-[9px] text-on-surface-variant">كم</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded py-1 sm:py-1.5 px-0.5">
              <span className="material-symbols-outlined text-primary text-[12px] sm:text-[13px]">local_gas_station</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-on-surface leading-none">
                {props.fuelType ? (FUEL_LABELS[props.fuelType] ?? props.fuelType) : 'بنزين'}
              </span>
              <span className="text-[8px] sm:text-[9px] text-on-surface-variant">الوقود</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded py-1 sm:py-1.5 px-0.5">
              <span className="material-symbols-outlined text-primary text-[12px] sm:text-[13px]">settings</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-on-surface leading-none">
                {props.transmission ? (TRANSMISSION_LABELS[props.transmission] ?? props.transmission) : 'أوتوماتيك'}
              </span>
              <span className="text-[8px] sm:text-[9px] text-on-surface-variant">ناقل الحركة</span>
            </div>
          </div>

          {/* Footer: time + views · arrow */}
          <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-outline-variant/10">
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-on-surface-variant">
              {props.createdAt && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px] sm:text-[11px]">schedule</span>
                  {relativeTime(props.createdAt)}
                </span>
              )}
              {props.viewCount != null && props.viewCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px] sm:text-[11px]">visibility</span>
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
