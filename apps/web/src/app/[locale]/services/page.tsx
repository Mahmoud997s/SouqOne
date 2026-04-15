'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useCarServices } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';
import { useTranslations } from 'next-intl';

export default function ServicesPage() {
  const t = useTranslations('pages');
  const tl = useTranslations('listings');

  const SERVICE_CATS = [
    { value: '', label: t('all') },
    { value: 'MAINTENANCE', label: t('servicesCatMaintenance') },
    { value: 'CLEANING', label: t('servicesCatCleaning') },
    { value: 'INSPECTION', label: t('servicesCatInspection') },
    { value: 'BODYWORK', label: t('servicesCatBodywork') },
    { value: 'TOWING', label: t('servicesCatTowing') },
    { value: 'MODIFICATION', label: t('servicesCatModification') },
    { value: 'KEYS_LOCKS', label: t('servicesCatKeys') },
    { value: 'ACCESSORIES_INSTALL', label: t('servicesCatAccessories') },
  ];

  const TYPE_LABELS: Record<string, string> = {
    MAINTENANCE: t('servicesTypeMaintenance'), CLEANING: t('servicesTypeCleaning'), INSPECTION: t('servicesTypeInspection'),
    BODYWORK: t('servicesTypeBodywork'), TOWING: t('servicesTypeTowing'), MODIFICATION: t('servicesTypeModification'),
    KEYS_LOCKS: t('servicesTypeKeys'), ACCESSORIES_INSTALL: t('servicesTypeAccessories'), OTHER_SERVICE: t('servicesTypeOther'),
  };

  const PROVIDER_LABELS: Record<string, string> = { WORKSHOP: t('servicesProviderWorkshop'), INDIVIDUAL: t('servicesProviderIndividual'), MOBILE: t('servicesProviderMobile'), COMPANY: t('servicesProviderCompany') };

  return (
    <ListingPageShell
      title={t('servicesTitle')}
      countLabel={t('servicesCount')}
      searchPlaceholder={t('servicesSearch')}
      addHref="/add-listing/service"
      addLabel={t('servicesAdd')}
      addBtnClass="btn-warning"
      heroIcon="home_repair_service"
      heroSubtitle={t('servicesSubtitle')}
      basePath="/services"
      categories={SERVICE_CATS}
      filterParamKey="serviceType"
      useDataHook={useCarServices}
      emptyTitle={t('servicesEmpty')}
      emptyDescription={tl('tryDifferentSearch')}
      renderCard={(svc) => (
        <Link key={svc.id} href={`/services/${svc.id}`} className="glass-card rounded-xl overflow-hidden group">
          <div className="aspect-[16/9] bg-surface-container-low relative overflow-hidden">
            {svc.images?.[0] ? (
              <Image src={getImageUrl(svc.images[0].url) || ''} alt={svc.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30"><span className="text-4xl">🔧</span></div>
            )}
            <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.service}`}>
              {TYPE_LABELS[svc.serviceType] || svc.serviceType}
            </span>
            {svc.isHomeService && (
              <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.mobile} flex items-center gap-1`}>
                <span className="material-symbols-outlined text-xs">home</span> {t('servicesMobile')}
              </span>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-sm text-on-surface line-clamp-2 mb-1">{svc.title}</h3>
            <p className="text-xs text-on-surface-variant mb-3">{svc.providerName} • {PROVIDER_LABELS[svc.providerType] || svc.providerType}</p>
            <div className="flex items-center justify-between">
              {(svc.priceFrom || svc.priceTo) ? (
                <span className="text-sm font-black text-primary">
                  {svc.priceFrom && `${parseFloat(svc.priceFrom).toFixed(3)}`}
                  {svc.priceFrom && svc.priceTo && ' - '}
                  {svc.priceTo && `${parseFloat(svc.priceTo).toFixed(3)}`}
                  <span className="text-[11px] font-medium text-on-surface-variant me-1">{tl('currency')}</span>
                </span>
              ) : (
                <span className="text-xs text-on-surface-variant">{t('callForPrice')}</span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                <span className="material-symbols-outlined text-xs">location_on</span> {svc.governorate}
              </span>
            </div>
          </div>
        </Link>
      )}
    />
  );
}
