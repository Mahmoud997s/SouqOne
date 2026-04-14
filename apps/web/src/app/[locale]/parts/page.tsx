'use client';

import { Link } from '@/i18n/navigation';
import { useParts } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { partConditionBadge, BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';
import { useTranslations } from 'next-intl';

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
      gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      useDataHook={useParts}
      emptyTitle={t('partsEmpty')}
      emptyDescription={tl('tryDifferentSearch')}
      renderCard={(part) => (
        <Link key={part.id} href={`/parts/${part.id}`} className="glass-card rounded-xl overflow-hidden group">
          <div className="aspect-[4/3] bg-surface-container-low relative overflow-hidden">
            {part.images?.[0] ? (
              <img src={getImageUrl(part.images[0].url) || ''} alt={part.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                <span className="text-4xl">🔩</span>
              </div>
            )}
            {badges[part.condition] && (
              <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-black ${badges[part.condition].cls}`}>
                {badges[part.condition].label}
              </span>
            )}
            {part.isOriginal && (
              <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.original}`}>{t('partsOriginal')}</span>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-sm text-on-surface line-clamp-2 mb-2">{part.title}</h3>
            {part.compatibleMakes.length > 0 && (
              <p className="text-[11px] text-on-surface-variant mb-2 line-clamp-1">
                {t('partsCompatible', { makes: part.compatibleMakes.join(', ') })}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-primary">{parseFloat(part.price).toFixed(3)} <span className="text-xs font-medium text-on-surface-variant">{tl('currency')}</span></span>
              {part.governorate && (
                <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-xs">location_on</span> {part.governorate}
                </span>
              )}
            </div>
          </div>
        </Link>
      )}
    />
  );
}
