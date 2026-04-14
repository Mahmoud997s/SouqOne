'use client';

import { Link } from '@/i18n/navigation';
import { useTransportServices } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';
import { useTranslations } from 'next-intl';

export default function TransportPage() {
  const t = useTranslations('pages');
  const tl = useTranslations('listings');

  const TRANSPORT_CATS = [
    { value: '', label: t('all') },
    { value: 'CARGO', label: t('transportCatCargo') },
    { value: 'FURNITURE', label: t('transportCatFurniture') },
    { value: 'DELIVERY', label: t('transportCatDelivery') },
    { value: 'HEAVY_TRANSPORT', label: t('transportCatHeavy') },
    { value: 'TRUCK_RENTAL', label: t('transportCatTruckRental') },
  ];

  const TYPE_LABELS: Record<string, string> = {
    CARGO: t('transportCatCargo'), FURNITURE: t('transportCatFurniture'), DELIVERY: t('transportCatDelivery'),
    HEAVY_TRANSPORT: t('transportCatHeavy'), TRUCK_RENTAL: t('transportCatTruckRental'), OTHER_TRANSPORT: t('transportTypeOther'),
  };

  return (
    <ListingPageShell
      title={t('transportTitle')}
      countLabel={t('transportCount')}
      searchPlaceholder={t('transportSearch')}
      addHref="/add-listing/transport"
      addLabel={t('transportAdd')}
      addBtnClass="btn-warning"
      heroIcon="local_shipping"
      heroSubtitle={t('transportSubtitle')}
      basePath="/transport"
      categories={TRANSPORT_CATS}
      filterParamKey="transportType"
      useDataHook={useTransportServices}
      emptyTitle={t('transportEmpty')}
      emptyDescription={tl('tryDifferentSearch')}
      renderCard={(item) => (
        <Link key={item.id} href={`/transport/${item.id}`} className="glass-card rounded-xl overflow-hidden group">
          <div className="aspect-[16/9] bg-surface-container-low relative overflow-hidden">
            {item.images?.[0] ? (
              <img src={getImageUrl(item.images[0].url) || ''} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30"><span className="material-symbols-outlined text-5xl">local_shipping</span></div>
            )}
            <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.transport}`}>
              {TYPE_LABELS[item.transportType] || item.transportType}
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-sm text-on-surface line-clamp-2 mb-1">{item.title}</h3>
            <p className="text-xs text-on-surface-variant mb-3">{item.providerName}</p>
            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mb-3">
              {item.hasInsurance && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-primary">shield</span> {t('transportInsurance')}</span>}
              {item.hasTracking && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-primary">my_location</span> {t('transportTracking')}</span>}
              {item.vehicleType && <span>{item.vehicleType}</span>}
            </div>
            <div className="flex items-center justify-between">
              {item.basePrice ? (
                <span className="text-sm font-black text-primary">{parseFloat(item.basePrice).toFixed(3)} <span className="text-[11px] font-medium text-on-surface-variant">{tl('currency')}</span></span>
              ) : (
                <span className="text-xs text-on-surface-variant">{t('callForPrice')}</span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-on-surface-variant"><span className="material-symbols-outlined text-xs">location_on</span> {item.governorate}</span>
            </div>
          </div>
        </Link>
      )}
    />
  );
}
