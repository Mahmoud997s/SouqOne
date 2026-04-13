'use client';

import { Link } from '@/i18n/navigation';
import { useTrips } from '@/lib/api';
import { BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';

const TRIP_CATS = [
  { value: '', label: 'الكل' },
  { value: 'BUS_SUBSCRIPTION', label: 'اشتراكات باصات' },
  { value: 'SCHOOL_TRANSPORT', label: 'توصيل مدارس' },
  { value: 'TOURISM', label: 'رحلات سياحية' },
  { value: 'CORPORATE', label: 'توصيل موظفين' },
  { value: 'CARPOOLING', label: 'مشاركة رحلات' },
];

const TYPE_LABELS: Record<string, string> = {
  BUS_SUBSCRIPTION: 'اشتراك باص', SCHOOL_TRANSPORT: 'توصيل مدارس', TOURISM: 'رحلة سياحية',
  CORPORATE: 'توصيل موظفين', CARPOOLING: 'مشاركة رحلة', OTHER_TRIP: 'أخرى',
};

const SCHEDULE_LABELS: Record<string, string> = { DAILY: 'يومي', WEEKLY: 'أسبوعي', MONTHLY: 'شهري', ONE_TIME: 'مرة واحدة', ON_DEMAND: 'عند الطلب' };

export default function TripsPage() {
  return (
    <ListingPageShell
      title="رحلات واشتراكات"
      countLabel="رحلة"
      searchPlaceholder="ابحث عن رحلة أو وجهة..."
      addHref="/add-listing/trip"
      addLabel="+ أضف رحلة"
      addBtnClass="btn-success"
      heroIcon="directions_bus"
      heroSubtitle="اشتراكات باصات ورحلات يومية وتوصيل مدارس"
      basePath="/trips"
      categories={TRIP_CATS}
      filterParamKey="tripType"
      useDataHook={useTrips}
      emptyTitle="لا توجد رحلات"
      emptyDescription="جرب البحث بكلمات مختلفة"
      renderCard={(trip) => (
        <Link key={trip.id} href={`/trips/${trip.id}`} className="glass-card rounded-xl overflow-hidden p-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.trip}`}>{TYPE_LABELS[trip.tripType] || trip.tripType}</span>
            <span className={`px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.schedule}`}>{SCHEDULE_LABELS[trip.scheduleType] || trip.scheduleType}</span>
          </div>
          <h3 className="font-bold text-sm text-on-surface line-clamp-2 mb-3">{trip.title}</h3>

          <div className="flex items-center gap-3 bg-surface-container-lowest rounded-lg p-3 mb-3 border border-outline-variant/10">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">من</p>
              <p className="font-bold text-sm">{trip.routeFrom}</p>
            </div>
            <span className="material-symbols-outlined text-primary shrink-0">swap_horiz</span>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">إلى</p>
              <p className="font-bold text-sm">{trip.routeTo}</p>
            </div>
          </div>

          {trip.routeStops.length > 0 && (
            <p className="text-[11px] text-on-surface-variant mb-2">محطات: {trip.routeStops.join(' → ')}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              {trip.pricePerTrip && <span className="text-sm font-black text-primary">{parseFloat(trip.pricePerTrip).toFixed(3)} <span className="text-[11px] font-medium text-on-surface-variant">ر.ع./رحلة</span></span>}
              {trip.priceMonthly && <span className="text-xs text-on-surface-variant mr-2">أو {parseFloat(trip.priceMonthly).toFixed(3)} شهري</span>}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
              {trip.availableSeats && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">group</span> {trip.availableSeats} مقعد</span>}
              {trip.governorate && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span> {trip.governorate}</span>}
            </div>
          </div>
        </Link>
      )}
    />
  );
}
