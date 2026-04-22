'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { getImageUrl } from '@/lib/image-utils';
import { conditionBadge } from '@/lib/constants/mappings';
import { useFavContext } from '@/providers/favorites-provider';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations, useLocale } from 'next-intl';
import { relativeTimeT } from '@/lib/time-utils';

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
  href?: string;
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
  const badge = props.condition ? badges[props.condition] : null;
  const { isAuthenticated } = useAuth();
  const { isFav: checkFav, toggleFav } = useFavContext();
  const serverFav = checkFav(`LISTING:${props.id}`);
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
      <Link href={props.href || `/sale/car/${props.id}`} className="h-full flex flex-col">

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
              className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center"
              aria-label={localFav ? t('removeFromFavorites') : t('addToFavorites')}
            >
              <span
                className={`material-symbols-outlined text-[18px] sm:text-[20px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 ${
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
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-orange-500 text-white">
              {t('wanted')}
            </span>
          ) : badge && (
            <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CONDITION_DOT[props.condition!] || 'bg-slate-400'}`} />
              {badge.label}
            </span>
          )}

          {/* ── Verified badge (bottom-left) ── */}
          {props.isVerified && (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-blue-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </span>
          )}

          {/* ── Price (bottom-right on image) ── */}
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
            <span className={`px-1.5 sm:px-2 py-px sm:py-0.5 rounded text-[9px] sm:text-xs font-black tracking-tight shadow-sm ${
              isWanted ? 'bg-orange-500 text-white' : 'bg-primary text-on-primary'
            }`}>
              {priceText}
            </span>
          </div>

        </div>

        {/* ── Body ── */}
        <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">

          {/* Title */}
          <h3 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1">{props.title}</h3>

          {/* listing type · date · location */}
          <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[10px] text-on-surface-variant">
            {props.listingType && (
              <span className={`shrink-0 font-bold ${props.listingType === 'RENTAL' ? 'text-teal-500' : props.listingType === 'WANTED' ? 'text-orange-500' : 'text-primary'}`}>
                {props.listingType === 'RENTAL' ? t('typeRental') : props.listingType === 'WANTED' ? t('wanted') : t('typeSale')}
              </span>
            )}
            {props.listingType && props.createdAt && <span className="text-outline/40">·</span>}
            {props.createdAt && (
              <span className="shrink-0">{relativeTimeT(props.createdAt, tt, locale)}</span>
            )}
            {props.createdAt && props.governorate && <span className="text-outline/40">·</span>}
            {props.governorate && (
              <span className="flex items-center gap-px shrink-0">
                <span className="material-symbols-outlined text-[9px] sm:text-[11px]">location_on</span>
                {props.governorate}
              </span>
            )}
          </div>

        </div>
      </Link>
    </article>
  );
}
