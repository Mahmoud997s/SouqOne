'use client';

import { Link } from '@/i18n/navigation';
import { useTransportServices } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';

const TRANSPORT_CATS = [
  { value: '', label: 'الكل' },
  { value: 'CARGO', label: 'نقل بضائع' },
  { value: 'FURNITURE', label: 'نقل أثاث' },
  { value: 'DELIVERY', label: 'توصيل طرود' },
  { value: 'HEAVY_TRANSPORT', label: 'نقل ثقيل' },
  { value: 'TRUCK_RENTAL', label: 'تأجير شاحنات' },
];

const TYPE_LABELS: Record<string, string> = {
  CARGO: 'نقل بضائع', FURNITURE: 'نقل أثاث', DELIVERY: 'توصيل طرود',
  HEAVY_TRANSPORT: 'نقل ثقيل', TRUCK_RENTAL: 'تأجير شاحنات', OTHER_TRANSPORT: 'أخرى',
};

export default function TransportPage() {
  return (
    <ListingPageShell
      title="خدمات النقل"
      countLabel="خدمة"
      searchPlaceholder="ابحث عن خدمة نقل..."
      addHref="/add-listing/transport"
      addLabel="+ أضف خدمة نقل"
      addBtnClass="btn-warning"
      heroIcon="local_shipping"
      heroSubtitle="خدمات نقل البضائع والأثاث في جميع أنحاء سلطنة عمان"
      basePath="/transport"
      categories={TRANSPORT_CATS}
      filterParamKey="transportType"
      useDataHook={useTransportServices}
      emptyTitle="لا توجد خدمات نقل"
      emptyDescription="جرب البحث بكلمات مختلفة"
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
              {item.hasInsurance && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-primary">shield</span> تأمين</span>}
              {item.hasTracking && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs text-primary">my_location</span> تتبع</span>}
              {item.vehicleType && <span>{item.vehicleType}</span>}
            </div>
            <div className="flex items-center justify-between">
              {item.basePrice ? (
                <span className="text-sm font-black text-primary">{parseFloat(item.basePrice).toFixed(3)} <span className="text-[11px] font-medium text-on-surface-variant">ر.ع.</span></span>
              ) : (
                <span className="text-xs text-on-surface-variant">اتصل للسعر</span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-on-surface-variant"><span className="material-symbols-outlined text-xs">location_on</span> {item.governorate}</span>
            </div>
          </div>
        </Link>
      )}
    />
  );
}
