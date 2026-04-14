'use client';

import { use } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useTrip, useCreateConversation } from '@/lib/api';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import { SellerCard } from '@/components/seller-card';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: trip, isLoading, error } = useTrip(id);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();
  const tp = useTranslations('pages');
  const locale = useLocale();

  const TYPE_LABELS: Record<string, string> = {
    BUS_SUBSCRIPTION: tp('tripDetailTypeBusSub'), SCHOOL_TRANSPORT: tp('tripDetailTypeSchool'), TOURISM: tp('tripDetailTypeTourism'),
    CORPORATE: tp('tripDetailTypeCorporate'), CARPOOLING: tp('tripDetailTypeCarpooling'), OTHER_TRIP: tp('tripDetailTypeOther'),
  };
  const SCHEDULE_LABELS: Record<string, string> = { SCHEDULE_DAILY: tp('tripDetailScheduleDaily'), SCHEDULE_WEEKLY: tp('tripDetailScheduleWeekly'), SCHEDULE_MONTHLY: tp('tripDetailScheduleMonthly'), ONE_TIME: tp('tripDetailScheduleOneTime') };
  const DAY_LABELS: Record<string, string> = { SAT: tp('tripDetailDaySat'), SUN: tp('tripDetailDaySun'), MON: tp('tripDetailDayMon'), TUE: tp('tripDetailDayTue'), WED: tp('tripDetailDayWed'), THU: tp('tripDetailDayThu'), FRI: tp('tripDetailDayFri') };

  function handleMessage() {
    requireAuth(async () => {
      if (!trip) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'TRIP', entityId: trip.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : tp('tripDetailErrorConversation'));
      }
    }, tp('tripDetailLoginToMessage'));
  }

  if (isLoading) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ListingSkeleton count={1} /></main></>;
  if (error || !trip) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ErrorState message={tp('tripDetailNotFound')} /></main><Footer /></>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link href="/trips" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">directions_bus</span> {tp('tripDetailBreadcrumb')}
            </Link>
            <span className="material-symbols-outlined icon-flip text-xs">chevron_left</span>
            <span className="text-white font-bold">{TYPE_LABELS[trip.tripType] || trip.tripType}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Route Card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span className="px-2.5 py-1 text-[11px] font-black bg-primary/10 dark:bg-primary/20 text-primary">{TYPE_LABELS[trip.tripType]}</span>
                    <span className="px-2.5 py-1 text-[11px] font-black bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant">{SCHEDULE_LABELS[trip.scheduleType]}</span>
                  </div>
                  <h1 className="text-xl font-black text-on-surface mb-4">{trip.title}</h1>

                  <div className="bg-surface-container-low/50 dark:bg-surface-container-high/30 rounded-lg p-5 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-xs text-on-surface-variant mb-1">{tp('tripDetailDeparture')}</p>
                        <p className="font-black text-lg text-on-surface">{trip.routeFrom}</p>
                      </div>
                      <div className="flex flex-col items-center px-4">
                        <span className="material-symbols-outlined text-xl text-primary">swap_horiz</span>
                        {trip.routeStops.length > 0 && (
                          <p className="text-[11px] text-on-surface-variant mt-1">{tp('tripDetailStopsCount', { count: trip.routeStops.length })}</p>
                        )}
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-xs text-on-surface-variant mb-1">{tp('tripDetailDestination')}</p>
                        <p className="font-black text-lg text-on-surface">{trip.routeTo}</p>
                      </div>
                    </div>
                    {trip.routeStops.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-outline-variant/10 dark:border-outline-variant/20">
                        <p className="text-xs text-on-surface-variant mb-2">{tp('tripDetailStopsLabel')}</p>
                        <div className="flex flex-wrap gap-2">
                          {trip.routeStops.map((stop, i) => (
                            <span key={i} className="px-3 py-1.5 bg-surface-container dark:bg-surface-container-highest text-xs font-black text-on-surface">{stop}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <h2 className="font-black text-on-surface">{tp('tripDetailSchedule')}</h2>
                </div>
                <div className="p-6 space-y-4">
                  {trip.operatingDays.length > 0 && (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-2 font-bold">{tp('tripDetailOperatingDays')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {trip.operatingDays.map(d => (
                          <span key={d} className="px-3 py-1.5 bg-surface-container-low dark:bg-surface-container-high text-xs font-black text-on-surface-variant">{DAY_LABELS[d] || d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {trip.departureTimes.length > 0 && (
                    <div>
                      <p className="text-xs text-on-surface-variant mb-2 font-bold">{tp('tripDetailDepartureTimes')}</p>
                      <div className="flex flex-wrap gap-2">
                        {trip.departureTimes.map((t, i) => (
                          <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-black">
                            <span className="material-symbols-outlined text-sm">schedule</span> {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(trip.startDate || trip.endDate) && (
                    <div className="flex gap-6 pt-3 border-t border-outline-variant/10 dark:border-outline-variant/20">
                      {trip.startDate && <div><p className="text-xs text-on-surface-variant">{tp('tripDetailFromDate')}</p><p className="font-black text-sm text-on-surface">{new Date(trip.startDate).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')}</p></div>}
                      {trip.endDate && <div><p className="text-xs text-on-surface-variant">{tp('tripDetailToDate')}</p><p className="font-black text-sm text-on-surface">{new Date(trip.endDate).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')}</p></div>}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {trip.description && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-black text-on-surface">{tp('tripDetailDescription')}</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{trip.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pricing */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">payments</span>
                  <h3 className="font-black text-on-surface text-sm">{tp('tripDetailPricing')}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3 mb-4">
                    {trip.pricePerTrip && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-primary">{parseFloat(trip.pricePerTrip).toFixed(3)}</span>
                        <span className="text-sm text-on-surface-variant">{tp('tripDetailPerTrip')}</span>
                      </div>
                    )}
                    {trip.priceMonthly && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-primary">{parseFloat(trip.priceMonthly).toFixed(3)}</span>
                        <span className="text-sm text-on-surface-variant">{tp('tripDetailPerMonth')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-4 border-t border-outline-variant/10 dark:border-outline-variant/20 mb-4">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {trip.viewCount}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(trip.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')}</span>
                    {trip.availableSeats && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">group</span> {tp('tripDetailSeats', { count: trip.availableSeats })}</span>}
                  </div>

                  <div className="space-y-2.5">
                    {user?.id !== trip.user?.id && (
                      <button onClick={handleMessage} disabled={createConv.isPending}
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-on-surface text-surface font-black text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                        <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? tp('tripDetailChatPending') : tp('tripDetailChat')}
                      </button>
                    )}
                    {trip.contactPhone && (
                      <a href={`tel:${trip.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary font-black text-sm hover:brightness-110 transition-all">
                        <span className="material-symbols-outlined text-lg">call</span> {tp('tripDetailCall')}
                      </a>
                    )}
                    {trip.whatsapp && (
                      <a href={`https://wa.me/${trip.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                        <span className="material-symbols-outlined text-lg">chat</span> {tp('tripDetailWhatsapp')}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <h3 className="font-black text-on-surface text-sm">{tp('tripDetailDetails')}</h3>
                </div>
                <div className="p-6 space-y-2.5 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20"><span className="text-on-surface-variant">{tp('tripDetailProvider')}</span><span className="font-black text-on-surface">{trip.providerName}</span></div>
                  {trip.vehicleType && <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20"><span className="text-on-surface-variant">{tp('tripDetailVehicleType')}</span><span className="font-black text-on-surface">{trip.vehicleType}</span></div>}
                  {trip.capacity && <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20"><span className="text-on-surface-variant">{tp('tripDetailCapacityLabel')}</span><span className="font-black text-on-surface">{tp('tripDetailCapacity', { count: trip.capacity })}</span></div>}
                  {trip.governorate && <div className="flex justify-between items-center py-2"><span className="text-on-surface-variant">{tp('tripDetailLocation')}</span><span className="font-black text-on-surface flex items-center gap-1"><span className="material-symbols-outlined text-primary text-sm">location_on</span> {trip.governorate}{trip.city ? ` - ${trip.city}` : ''}</span></div>}
                </div>
                {trip.latitude && trip.longitude && (
                  <div className="px-6 pb-6">
                    <MapView latitude={trip.latitude} longitude={trip.longitude} title={trip.title} sellerPhone={trip.contactPhone} />
                  </div>
                )}
              </div>

              {/* Features */}
              {trip.features.length > 0 && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">stars</span>
                    <h3 className="font-black text-on-surface text-sm">{tp('tripDetailFeatures')}</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {trip.features.map((f, i) => (
                        <span key={i} className="px-3 py-1.5 bg-primary/10 dark:bg-primary/20 text-primary text-xs font-black">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* User */}
              <SellerCard
                title={tp('tripDetailServiceProvider')}
                name={trip.user.displayName || trip.user.username}
                avatarUrl={trip.user.avatarUrl}
                isVerified={trip.user.isVerified}
                onMessage={handleMessage}
                messagePending={createConv.isPending}
                onShare={() => {
                  const url = window.location.href;
                  if (navigator.share) navigator.share({ title: trip.title, url });
                  else navigator.clipboard.writeText(url);
                }}
              />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
