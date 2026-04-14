'use client';

import { Link } from '@/i18n/navigation';
import { useInsuranceOffers } from '@/lib/api';
import { BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';
import { useTranslations } from 'next-intl';

export default function InsurancePage() {
  const t = useTranslations('pages');
  const tl = useTranslations('listings');

  const INS_CATS = [
    { value: '', label: t('all') },
    { value: 'CAR_COMPREHENSIVE', label: t('insuranceCatComprehensive') },
    { value: 'CAR_THIRD_PARTY', label: t('insuranceCatThirdParty') },
    { value: 'MARINE', label: t('insuranceCatMarine') },
    { value: 'HEAVY_EQUIPMENT', label: t('insuranceCatEquipment') },
    { value: 'FINANCING', label: t('insuranceCatFinancing') },
    { value: 'LEASING', label: t('insuranceCatLeasing') },
  ];

  const TYPE_LABELS: Record<string, string> = {
    CAR_COMPREHENSIVE: t('insuranceCatComprehensive'), CAR_THIRD_PARTY: t('insuranceCatThirdParty'), MARINE: t('insuranceCatMarine'),
    HEAVY_EQUIPMENT: t('insuranceCatEquipment'), FINANCING: t('insuranceCatFinancing'), LEASING: t('insuranceCatLeasing'),
  };

  return (
    <ListingPageShell
      title={t('insuranceTitle')}
      countLabel={t('insuranceCount')}
      searchPlaceholder={t('insuranceSearch')}
      addHref="/add-listing/insurance"
      addLabel={t('insuranceAdd')}
      addBtnClass="btn-success"
      heroIcon="shield"
      heroSubtitle={t('insuranceSubtitle')}
      basePath="/insurance"
      categories={INS_CATS}
      filterParamKey="offerType"
      useDataHook={useInsuranceOffers}
      emptyTitle={t('insuranceEmpty')}
      emptyDescription={tl('tryDifferentSearch')}
      renderCard={(offer) => (
        <Link key={offer.id} href={`/insurance/${offer.id}`} className="glass-card rounded-xl overflow-hidden p-5 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">shield</span>
            </div>
            <div className="flex-1">
              <span className={`px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.insurance}`}>
                {TYPE_LABELS[offer.offerType] || offer.offerType}
              </span>
            </div>
          </div>
          <h3 className="font-bold text-sm text-on-surface line-clamp-2 mb-1">{offer.title}</h3>
          <p className="text-xs text-on-surface-variant mb-3">{offer.providerName}</p>

          {offer.features.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {offer.features.slice(0, 3).map((f: string, i: number) => (
                <p key={i} className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-xs text-primary shrink-0">check_circle</span> {f}
                </p>
              ))}
              {offer.features.length > 3 && (
                <p className="text-[11px] text-on-surface-variant">{t('insuranceMoreFeatures', { count: offer.features.length - 3 })}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
            {offer.priceFrom ? (
              <span className="text-sm font-black text-primary">
                {t('insuranceStartsFrom', { price: parseFloat(offer.priceFrom).toFixed(3) })} <span className="text-[11px] font-medium text-on-surface-variant">{tl('currency')}</span>
              </span>
            ) : (
              <span className="text-xs text-on-surface-variant">{t('callForPrice')}</span>
            )}
            {offer.governorate && (
              <span className="flex items-center gap-1 text-[11px] text-on-surface-variant"><span className="material-symbols-outlined text-xs">location_on</span> {offer.governorate}</span>
            )}
          </div>
        </Link>
      )}
    />
  );
}
