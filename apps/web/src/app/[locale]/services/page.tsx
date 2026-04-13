'use client';

import { Link } from '@/i18n/navigation';
import { useCarServices } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';

const SERVICE_CATS = [
  { value: '', label: 'الكل' },
  { value: 'MAINTENANCE', label: 'صيانة' },
  { value: 'CLEANING', label: 'تلميع' },
  { value: 'INSPECTION', label: 'فحص' },
  { value: 'BODYWORK', label: 'سمكرة' },
  { value: 'TOWING', label: 'سطحة' },
  { value: 'MODIFICATION', label: 'تعديل' },
  { value: 'KEYS_LOCKS', label: 'مفاتيح' },
  { value: 'ACCESSORIES_INSTALL', label: 'إكسسوارات' },
];

const TYPE_LABELS: Record<string, string> = {
  MAINTENANCE: 'صيانة وإصلاح', CLEANING: 'تلميع وتنظيف', INSPECTION: 'فحص سيارات',
  BODYWORK: 'سمكرة ودهان', TOWING: 'سطحة ونجدة', MODIFICATION: 'تعديل وتيونينج',
  KEYS_LOCKS: 'مفاتيح وأقفال', ACCESSORIES_INSTALL: 'تركيب إكسسوارات', OTHER_SERVICE: 'أخرى',
};

const PROVIDER_LABELS: Record<string, string> = { WORKSHOP: 'ورشة', INDIVIDUAL: 'فرد', MOBILE: 'خدمة متنقلة', COMPANY: 'شركة' };

export default function ServicesPage() {
  return (
    <ListingPageShell
      title="خدمات سيارات"
      countLabel="خدمة"
      searchPlaceholder="ابحث عن خدمة..."
      addHref="/add-listing/service"
      addLabel="+ أضف خدمة"
      addBtnClass="btn-warning"
      heroIcon="home_repair_service"
      heroSubtitle="اكتشف أفضل ورش الصيانة وخدمات السيارات في سلطنة عمان"
      basePath="/services"
      categories={SERVICE_CATS}
      filterParamKey="serviceType"
      useDataHook={useCarServices}
      emptyTitle="لا توجد خدمات"
      emptyDescription="جرب البحث بكلمات مختلفة"
      renderCard={(svc) => (
        <Link key={svc.id} href={`/services/${svc.id}`} className="glass-card rounded-xl overflow-hidden group">
          <div className="aspect-[16/9] bg-surface-container-low relative overflow-hidden">
            {svc.images?.[0] ? (
              <img src={getImageUrl(svc.images[0].url) || ''} alt={svc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30"><span className="text-4xl">🔧</span></div>
            )}
            <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.service}`}>
              {TYPE_LABELS[svc.serviceType] || svc.serviceType}
            </span>
            {svc.isHomeService && (
              <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.mobile} flex items-center gap-1`}>
                <span className="material-symbols-outlined text-xs">home</span> متنقلة
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
                  <span className="text-[11px] font-medium text-on-surface-variant mr-1">ر.ع.</span>
                </span>
              ) : (
                <span className="text-xs text-on-surface-variant">اتصل للسعر</span>
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
