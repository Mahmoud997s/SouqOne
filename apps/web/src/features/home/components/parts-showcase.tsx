'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CardSkeleton } from '@/components/loading-skeleton';
import { getImageUrl } from '@/lib/image-utils';
import { useFavoriteIds, useToggleFavorite } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import type { SparePartItem } from '@/lib/api/parts';

interface PartsShowcaseProps {
  items: SparePartItem[];
  isLoading: boolean;
}

const CONDITION_DOT: Record<string, string> = {
  NEW: 'bg-emerald-500', USED: 'bg-slate-400', REFURBISHED: 'bg-sky-500',
};

function PartFavButton({ id }: { id: string }) {
  const { isAuthenticated } = useAuth();
  const { data: favIds } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const isFav = favIds?.includes(`SPARE_PART:${id}`) ?? false;
  if (!isAuthenticated) return null;
  return (
    <button
      onClick={e => { e.preventDefault(); toggleFav.mutate({ entityType: 'SPARE_PART', entityId: id }); }}
      className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center"
    >
      <span
        className={`material-symbols-outlined text-[18px] sm:text-[20px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 ${isFav ? 'text-red-500' : 'text-white'}`}
        style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}
      >favorite</span>
    </button>
  );
}

export function PartsShowcase({ items, isLoading }: PartsShowcaseProps) {
  const t = useTranslations('home');
  const tl = useTranslations('listings');
  const tm = useTranslations('mappings');

  function condLabel(c: string) {
    if (c === 'NEW') return tm('conditionNew');
    if (c === 'REFURBISHED') return tm('conditionRefurbished');
    return tm('conditionUsed');
  }

  return (
    <section className="bg-surface-container-low dark:bg-surface-dim py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-wrap justify-between items-end gap-2 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="h-6 sm:h-8 w-1 bg-primary" />
              <h2 className="text-base sm:text-xl md:text-3xl font-black">{t('latestParts')}</h2>
            </div>
            <p className="text-on-surface-variant text-xs sm:text-sm">{t('latestPartsDesc')}</p>
          </div>
          <Link href="/parts" className="text-primary font-bold text-xs sm:text-sm hover:underline transition-colors">
            {t('viewAll')}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {items.map((part) => {
              const img = part.images?.find((i) => i.isPrimary) ?? part.images?.[0];
              const imgUrl = getImageUrl(img?.url);
              const cur = part.currency === 'OMR' ? tl('currency') : part.currency;
              return (
                <Link key={part.id} href={`/sale/part/${part.id}`} className="group h-full flex flex-col bg-surface-container-lowest dark:bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300">
                  {/* ── Image ── */}
                  <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={part.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl sm:text-5xl text-on-surface-variant/20">settings</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {/* Fav button top-left */}
                    <PartFavButton id={part.id} />

                    {/* Condition + OEM top-right side by side */}
                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5">
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CONDITION_DOT[part.condition] || 'bg-slate-400'}`} />
                        {condLabel(part.condition)}
                      </span>
                      {part.isOriginal && (
                        <span className="px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
                          {tl('oem')}
                        </span>
                      )}
                    </div>

                    {/* Verified bottom-left */}
                    {part.seller?.isVerified && (
                      <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-blue-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
                        <span className="material-symbols-outlined text-[13px] sm:text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                      </span>
                    )}

                    {/* Price bottom-right */}
                    {part.price && (
                      <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
                        <span className="px-1.5 sm:px-2 py-px sm:py-0.5 rounded text-[9px] sm:text-xs font-black bg-primary text-on-primary shadow-sm">
                          {part.price} {cur}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Body ── */}
                  <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">
                    <h3 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1">{part.title}</h3>
                    <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[10px] text-on-surface-variant">
                      {part.governorate && (
                        <span className="flex items-center gap-px shrink-0">
                          <span className="material-symbols-outlined text-[9px] sm:text-[11px]">location_on</span>
                          {part.governorate}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">settings</span>
            <p className="font-medium">{t('noPartsNow')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
