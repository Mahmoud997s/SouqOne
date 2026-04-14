'use client';

import { Link } from '@/i18n/navigation';
import { useTrips } from '@/lib/api';
import { BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';
import { useTranslations } from 'next-intl';

export default function TripsPage() {
  const t = useTranslations('pages');
  const tl = useTranslations('listings');

  const TRIP_CATS = [
    { value: '', label: t('all') },
    { value: 'BUS_SUBSCRIPTION', label: t('tripsCatBus') },
    { value: 'SCHOOL_TRANSPORT', label: t('tripsCatSchool') },
    { value: 'TOURISM', label: t('tripsCatTourism') },
    { value: 'CORPORATE', label: t('tripsCatCorporate') },
    { value: 'CARPOOLING', label: t('tripsCatCarpooling') },
  ];

  const TYPE_LABELS: Record<string, string> = {
    BUS_SUBSCRIPTION: t('tripsTypeBus'), SCHOOL_TRANSPORT: t('tripsTypeSchool'), TOURISM: t('tripsTypeTourism'),
    CORPORATE: t('tripsTypeCorporate'), CARPOOLING: t('tripsTypeCarpooling'), OTHER_TRIP: t('tripsTypeOther'),
  };

  const SCHEDULE_LABELS: Record<string, string> = { DAILY: t('tripsScheduleDaily'), WEEKLY: t('tripsScheduleWeekly'), MONTHLY: t('tripsScheduleMonthly'), ONE_TIME: t('tripsScheduleOneTime'), ON_DEMAND: t('tripsScheduleOnDemand') };

  return (
    <ListingPageShell
      title={t('tripsTitle')}
      countLabel={t('tripsCount')}
      searchPlaceholder={t('tripsSearch')}
      addHref="/add-listing/trip"
      addLabel={t('tripsAdd')}
      addBtnClass="btn-success"
      heroIcon="directions_bus"
      heroSubtitle={t('tripsSubtitle')}
      basePath="/trips"
      categories={TRIP_CATS}
      filterParamKey="tripType"
      useDataHook={useTrips}
      emptyTitle={t('tripsEmpty')}
      emptyDescription={tl('tryDifferentSearch')}
      renderCard={(trip) => (
        <Link key={trip.id} href={`/trips/${trip.id}`} className="glass-card rounded-xl overflow-hidden p-5 relative">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.trip}`}>{TYPE_LABELS[trip.tripType] || trip.tripType}</span>
            <span className={`px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.schedule}`}>{SCHEDULE_LABELS[trip.scheduleType] || trip.scheduleType}</span>
          </div>
          <h3 className="font-bold text-sm text-on-surface line-clamp-2 mb-3">{trip.title}</h3>

          <div className="flex items-center gap-3 bg-surface-container-lowest rounded-lg p-3 mb-3 border border-outline-variant/10">
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">{t('tripsFrom')}</p>
              <p className="font-bold text-sm">{trip.routeFrom}</p>
            </div>
            <span className="material-symbols-outlined text-primary shrink-0">swap_horiz</span>
            <div className="text-center">
              <p className="text-xs text-on-surface-variant">{t('tripsTo')}</p>
              <p className="font-bold text-sm">{trip.routeTo}</p>
            </div>
          </div>

          {trip.routeStops.length > 0 && (
            <p className="text-[11px] text-on-surface-variant mb-2">{t('tripsStops')} {trip.routeStops.join(' → ')}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div>
              {trip.pricePerTrip && <span className="text-sm font-black text-primary">{parseFloat(trip.pricePerTrip).toFixed(3)} <span className="text-[11px] font-medium text-on-surface-variant">{t('tripsPerTrip')}</span></span>}
              {trip.priceMonthly && <span className="text-xs text-on-surface-variant me-2">{t('tripsOrMonthly', { price: parseFloat(trip.priceMonthly).toFixed(3) })}</span>}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
              {trip.availableSeats && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">group</span> {t('tripsSeats', { count: trip.availableSeats })}</span>}
              {trip.governorate && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span> {trip.governorate}</span>}
            </div>
          </div>
        </Link>
      )}
    />
  );
}
