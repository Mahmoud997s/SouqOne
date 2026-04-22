'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useParts, useFavoriteIds, useToggleFavorite } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { partConditionBadge } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';

export default function PartsPage() {
  const t = useTranslations('pages');
  const tm = useTranslations('mappings');
  const tl = useTranslations('listings');

  const PART_CATS = [
    { value: '', label: t('all') },
    { value: 'ENGINE', label: t('partsCatEngine') },
    { value: 'BODY', label: t('partsCatBody') },
    { value: 'ELECTRICAL', label: t('partsCatElectrical') },
    { value: 'SUSPENSION', label: t('partsCatSuspension') },
    { value: 'BRAKES', label: t('partsCatBrakes') },
    { value: 'INTERIOR', label: t('partsCatInterior') },
    { value: 'TIRES', label: t('partsCatTires') },
    { value: 'BATTERIES', label: t('partsCatBatteries') },
    { value: 'OILS', label: t('partsCatOils') },
    { value: 'ACCESSORIES', label: t('partsCatAccessories') },
  ];

  const badges = partConditionBadge(tm);

  return (
    <ListingPageShell
      title={t('partsTitle')}
      countLabel={t('partsCount')}
      searchPlaceholder={t('partsSearch')}
      addHref="/add-listing/parts"
      addLabel={t('partsAdd')}
      addBtnClass="btn-warning"
      heroIcon="build"
      heroSubtitle={t('partsSubtitle')}
      basePath="/parts"
      categories={PART_CATS}
      filterParamKey="partCategory"
      gridClassName="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4"
      useDataHook={useParts}
      emptyTitle={t('partsEmpty')}
      emptyDescription={tl('tryDifferentSearch')}
      renderCard={(part) => (
        <PartCard key={part.id} part={part} badges={badges} t={t} tl={tl} />
      )}
    />
  );
}

function PartCard({ part, badges, t, tl }: { part: any; badges: any; t: any; tl: any }) {
  const { isAuthenticated } = useAuth();
  const { data: favIds } = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const isFav = favIds?.includes(`SPARE_PART:${part.id}`) ?? false;
  const imgUrl = getImageUrl(part.images?.[0]?.url);
  const cond = badges[part.condition];
  const priceText = part.price ? `${parseFloat(part.price).toFixed(3)} ${tl('currency')}` : null;

  return (
    <article className="h-full rounded-xl overflow-hidden bg-surface-container-lowest group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300 border border-outline-variant/10">
      <Link href={`/sale/part/${part.id}`} className="h-full flex flex-col">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
          {imgUrl ? (
            <Image src={imgUrl} alt={part.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:640px) 50vw, 25vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl sm:text-5xl text-on-surface-variant/20">build</span>
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          {/* Fav */}
          {isAuthenticated && (
            <button onClick={e => { e.preventDefault(); toggleFav.mutate({ entityType: 'SPARE_PART', entityId: part.id }); }}
              className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center">
              <span className={`material-symbols-outlined text-[18px] sm:text-[20px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] transition-all duration-200 ${isFav ? 'text-red-500' : 'text-white'}`}
                style={{ fontVariationSettings: isFav ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
            </button>
          )}
          {/* Condition + OEM top-right */}
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5">
            {cond && (
              <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
                {cond.label}
              </span>
            )}
            {part.isOriginal && (
              <span className="px-1 sm:px-2 py-px sm:py-0.5 rounded text-[7px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
                {t('partsOriginal')}
              </span>
            )}
          </div>
          {/* Verified */}
          {part.seller?.isVerified && (
            <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 text-blue-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
              <span className="material-symbols-outlined text-[13px] sm:text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </span>
          )}
          {/* Price */}
          {priceText && (
            <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
              <span className="px-1.5 sm:px-2 py-px sm:py-0.5 rounded text-[9px] sm:text-xs font-black bg-primary text-on-primary shadow-sm">{priceText}</span>
            </div>
          )}
        </div>
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
    </article>
  );
}
