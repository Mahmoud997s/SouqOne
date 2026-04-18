'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';
import { conditionBadge, fuelLabels, transmissionLabels } from '@/lib/constants/mappings';
import { relativeTimeT } from '@/lib/time-utils';
import { useFavoriteIds, useToggleFavorite } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations, useLocale } from 'next-intl';

const CONDITION_DOT: Record<string, string> = {
  NEW: 'bg-emerald-500', LIKE_NEW: 'bg-teal-500', USED: 'bg-slate-400',
  GOOD: 'bg-sky-500', FAIR: 'bg-amber-500', POOR: 'bg-red-500',
};

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
  isPremium?: boolean;
}

function formatPrice(price: string | number, currencyLabel: string, suffix?: string) {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  const formatted = `${num.toLocaleString('en-US')} ${currencyLabel}`;
  return suffix ? `${formatted}${suffix}` : formatted;
}

export function VehicleCard(props: VehicleCardProps) {
  const t = useTranslations('listings');
  const tm = useTranslations('mappings');
  const tt = useTranslations('time');
  const locale = useLocale();
  const imgSrc = getImageUrl(props.imageUrl);
  const badges = conditionBadge(tm);
  const fuels = fuelLabels(tm);
  const transmissions = transmissionLabels(tm);
  const badge = props.condition ? badges[props.condition] : null;
  const { isAuthenticated } = useAuth();
  const { data: favIds } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const serverFav = favIds?.includes(`LISTING:${props.id}`) ?? false;
  const [localFav, setLocalFav] = useState(serverFav);
  const [animating, setAnimating] = useState(false);

  useEffect(() => { setLocalFav(serverFav); }, [serverFav]);

  const currencyLabel = props.currency === 'OMR' ? t('currency') : props.currency;
  const isWanted = props.listingType === 'WANTED';
  const priceText = isWanted
    ? (Number(props.price) > 0 ? `${t('budget')}: ${formatPrice(props.price, currencyLabel)}` : t('wanted'))
    : props.listingType === 'RENTAL'
      ? formatPrice(props.dailyPrice || props.price, currencyLabel, t('perDay'))
      : formatPrice(props.price, currencyLabel);

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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant/30">
              <span className="material-symbols-outlined text-3xl sm:text-4xl">directions_car</span>
              <span className="text-[9px] font-medium">{t('noImage')}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

          {/* ── Favorite button (top-left) ── */}
          {isAuthenticated && (
            <button
              onClick={handleFav}
              className="absolute top-2 left-2 z-10 w-8 h-8 flex items-center justify-center"
              aria-label={localFav ? t('removeFromFavorites') : t('addToFavorites')}
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

          {/* ── Top-right: WANTED wins, else condition (neutral + dot) ── */}
          {isWanted ? (
            <span className="absolute top-2 right-2 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-orange-500 text-white">
              {t('wanted')}
            </span>
          ) : badge && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CONDITION_DOT[props.condition!] || 'bg-slate-400'}`} />
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

          {/* ── Premium star (top-left, after fav) ── */}
          {props.isPremium && (
            <span className="absolute top-2 left-10 bg-amber-500 text-white rounded px-1 py-0.5 text-[10px] font-black shadow-sm z-10 leading-none">
              ★
            </span>
          )}

          {/* ── Distance (bottom-left on image) ── */}
          {props.distance != null && (
            <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white rounded px-1.5 py-0.5 flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold">
              <span className="material-symbols-outlined text-[10px]">near_me</span>
              {props.distance < 1 ? `${Math.round(props.distance * 1000)} ${t('meters')}` : `${props.distance} ${t('km')}`}
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">

          {/* Title */}
          <h3 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1">{props.title}</h3>

          {/* Meta: location · make model year */}
          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant leading-none">
            {props.governorate && (
              <>
                <span className="material-symbols-outlined text-[10px] sm:text-[11px]">location_on</span>
                <span>{props.governorate}</span>
                <span className="text-outline-variant/40 mx-0.5">·</span>
              </>
            )}
            <span dir="ltr" className="truncate">{props.make} {props.model} {props.year}</span>
          </div>

          {/* Meta tags: single inline row — no colors */}
          {(props.isVerified || props.listingType === 'RENTAL' || props.isPriceNegotiable || (isWanted && badge)) && (
            <div className="flex items-center flex-wrap gap-x-1.5 text-[9px] sm:text-[10px] text-on-surface-variant">
              {isWanted && badge && (
                <span className="inline-flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CONDITION_DOT[props.condition!] || 'bg-slate-400'}`} />
                  {badge.label}
                </span>
              )}
              {isWanted && badge && (props.isVerified || props.listingType === 'RENTAL' || props.isPriceNegotiable) && (
                <span className="text-outline-variant/40">·</span>
              )}
              {props.isVerified && (
                <span className="inline-flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  {t('verified')}
                </span>
              )}
              {props.isVerified && (props.listingType === 'RENTAL' || props.isPriceNegotiable) && (
                <span className="text-outline-variant/40">·</span>
              )}
              {props.listingType === 'RENTAL' && (
                <span>{t('forRent')}</span>
              )}
              {props.listingType === 'RENTAL' && props.isPriceNegotiable && (
                <span className="text-outline-variant/40">·</span>
              )}
              {props.isPriceNegotiable && (
                <span>{t('negotiable')}</span>
              )}
            </div>
          )}

          {/* Specs — inline row on mobile, grid boxes on sm+ */}
          <div className="hidden">
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-primary text-[10px]">speed</span>
              {props.mileage != null ? props.mileage.toLocaleString('en-US') : '0'} {t('km')}
            </span>
            <span className="text-outline-variant/30">·</span>
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-primary text-[10px]">local_gas_station</span>
              {props.fuelType ? (fuels[props.fuelType] ?? props.fuelType) : t('petrol')}
            </span>
            <span className="text-outline-variant/30">·</span>
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-primary text-[10px]">settings</span>
              {props.transmission ? (transmissions[props.transmission] ?? props.transmission) : t('automatic')}
            </span>
          </div>
          <div className="hidden sm:grid grid-cols-3 gap-1">
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded py-1 sm:py-1.5 px-0.5">
              <span className="material-symbols-outlined text-primary text-[11px] sm:text-[13px]">speed</span>
              <span className="text-[8px] sm:text-[10px] font-bold text-on-surface leading-none">
                {props.mileage != null ? props.mileage.toLocaleString('en-US') : '0'}
              </span>
              <span className="text-[7px] sm:text-[9px] text-on-surface-variant">{t('km')}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded py-1 sm:py-1.5 px-0.5">
              <span className="material-symbols-outlined text-primary text-[11px] sm:text-[13px]">local_gas_station</span>
              <span className="text-[8px] sm:text-[10px] font-bold text-on-surface leading-none">
                {props.fuelType ? (fuels[props.fuelType] ?? props.fuelType) : t('petrol')}
              </span>
              <span className="text-[7px] sm:text-[9px] text-on-surface-variant">{t('fuel')}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 bg-surface-container-low rounded py-1 sm:py-1.5 px-0.5">
              <span className="material-symbols-outlined text-primary text-[11px] sm:text-[13px]">settings</span>
              <span className="text-[8px] sm:text-[10px] font-bold text-on-surface leading-none">
                {props.transmission ? (transmissions[props.transmission] ?? props.transmission) : t('automatic')}
              </span>
              <span className="text-[7px] sm:text-[9px] text-on-surface-variant">{t('transmission')}</span>
            </div>
          </div>

          {/* Footer: time + views · arrow */}
          <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-outline-variant/10">
            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-on-surface-variant">
              {props.createdAt && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px] sm:text-[11px]">schedule</span>
                  {relativeTimeT(props.createdAt, tt, locale)}
                </span>
              )}
              {props.viewCount != null && props.viewCount > 0 && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[10px] sm:text-[11px]">visibility</span>
                  {props.viewCount}
                </span>
              )}
            </div>
            <span className="material-symbols-outlined icon-flip text-primary text-xs rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform">arrow_back</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
