'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useTrip, useCreateConversation } from '@/lib/api';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

const TYPE_LABELS: Record<string, string> = {
  BUS_SUBSCRIPTION: 'اشتراك باص', SCHOOL_TRANSPORT: 'توصيل مدارس', TOURISM: 'رحلة سياحية',
  CORPORATE: 'توصيل موظفين', CARPOOLING: 'مشاركة رحلة', OTHER_TRIP: 'أخرى',
};
const SCHEDULE_LABELS: Record<string, string> = { SCHEDULE_DAILY: 'يومي', SCHEDULE_WEEKLY: 'أسبوعي', SCHEDULE_MONTHLY: 'شهري', ONE_TIME: 'مرة واحدة' };
const DAY_LABELS: Record<string, string> = { SAT: 'السبت', SUN: 'الأحد', MON: 'الإثنين', TUE: 'الثلاثاء', WED: 'الأربعاء', THU: 'الخميس', FRI: 'الجمعة' };

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: trip, isLoading, error } = useTrip(id);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();

  function handleMessage() {
    requireAuth(async () => {
      if (!trip) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'TRIP', entityId: trip.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المحادثة');
      }
    }, 'سجّل الدخول لإرسال رسالة');
  }

  if (isLoading) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ListingSkeleton count={1} /></main></>;
  if (error || !trip) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ErrorState message="الرحلة غير موجودة" /></main><Footer /></>;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4 md:px-8" dir="rtl">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/trips" className="hover:text-primary">رحلات</Link>
          <span>›</span>
          <span className="text-on-surface font-bold">{TYPE_LABELS[trip.tripType] || trip.tripType}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Route card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-teal-600 text-white">{TYPE_LABELS[trip.tripType]}</span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-surface-container-low text-on-surface-variant">{SCHEDULE_LABELS[trip.scheduleType]}</span>
              </div>
              <h1 className="text-xl font-black text-on-surface mb-4">{trip.title}</h1>

              <div className="bg-surface-container-low rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <p className="text-xs text-on-surface-variant mb-1">نقطة الانطلاق</p>
                    <p className="font-black text-lg">{trip.routeFrom}</p>
                  </div>
                  <div className="flex flex-col items-center px-4">
                    <span className="material-symbols-outlined text-xl text-primary">swap_horiz</span>
                    {trip.routeStops.length > 0 && (
                      <p className="text-[11px] text-on-surface-variant mt-1">{trip.routeStops.length} محطات</p>
                    )}
                  </div>
                  <div className="text-center flex-1">
                    <p className="text-xs text-on-surface-variant mb-1">الوجهة</p>
                    <p className="font-black text-lg">{trip.routeTo}</p>
                  </div>
                </div>
                {trip.routeStops.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-outline-variant/20">
                    <p className="text-xs text-on-surface-variant mb-2">محطات التوقف:</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.routeStops.map((stop, i) => (
                        <span key={i} className="px-3 py-1.5 bg-surface-container rounded-lg text-xs font-bold">{stop}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-bold text-lg mb-4">الجدول الزمني</h2>
              <div className="space-y-3">
                {trip.operatingDays.length > 0 && (
                  <div>
                    <p className="text-xs text-on-surface-variant mb-2">أيام التشغيل</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trip.operatingDays.map(d => (
                        <span key={d} className="px-3 py-1.5 bg-surface-container-low rounded-lg text-xs font-bold">{DAY_LABELS[d] || d}</span>
                      ))}
                    </div>
                  </div>
                )}
                {trip.departureTimes.length > 0 && (
                  <div>
                    <p className="text-xs text-on-surface-variant mb-2">أوقات المغادرة</p>
                    <div className="flex flex-wrap gap-2">
                      {trip.departureTimes.map((t, i) => (
                        <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">schedule</span> {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {(trip.startDate || trip.endDate) && (
                  <div className="flex gap-4">
                    {trip.startDate && <div><p className="text-xs text-on-surface-variant">من تاريخ</p><p className="font-bold text-sm">{new Date(trip.startDate).toLocaleDateString('ar-OM')}</p></div>}
                    {trip.endDate && <div><p className="text-xs text-on-surface-variant">إلى تاريخ</p><p className="font-bold text-sm">{new Date(trip.endDate).toLocaleDateString('ar-OM')}</p></div>}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {trip.description && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-bold text-lg mb-3">الوصف</h2>
                <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{trip.description}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* Pricing */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-bold text-sm mb-3">الأسعار</h2>
              <div className="space-y-3">
                {trip.pricePerTrip && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">{parseFloat(trip.pricePerTrip).toFixed(3)}</span>
                    <span className="text-sm text-on-surface-variant">ر.ع. / رحلة</span>
                  </div>
                )}
                {trip.priceMonthly && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">{parseFloat(trip.priceMonthly).toFixed(3)}</span>
                    <span className="text-sm text-on-surface-variant">ر.ع. / شهر</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-4 mb-4">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {trip.viewCount}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(trip.createdAt).toLocaleDateString('ar-OM')}</span>
                {trip.availableSeats && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">group</span> {trip.availableSeats} مقعد</span>}
              </div>

              <div className="space-y-2">
                {user?.id !== trip.user?.id && (
                  <button onClick={handleMessage} disabled={createConv.isPending}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-on-surface text-surface rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                    <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? 'جاري...' : 'تواصل عبر الشات'}
                  </button>
                )}
                {trip.contactPhone && (
                  <a href={`tel:${trip.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-teal-600 text-white rounded-lg font-bold text-sm"><span className="material-symbols-outlined text-lg">call</span> اتصل</a>
                )}
                {trip.whatsapp && (
                  <a href={`https://wa.me/${trip.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-lg font-bold text-sm hover:bg-[#25D366]/90 transition-colors">واتساب</a>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="glass-card rounded-xl p-5">
              <h2 className="font-bold text-sm mb-3">التفاصيل</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-on-surface-variant">المزود</span><span className="font-bold">{trip.providerName}</span></div>
                {trip.vehicleType && <div className="flex justify-between"><span className="text-on-surface-variant">نوع المركبة</span><span className="font-bold">{trip.vehicleType}</span></div>}
                {trip.capacity && <div className="flex justify-between"><span className="text-on-surface-variant">السعة</span><span className="font-bold">{trip.capacity} مقعد</span></div>}
                {trip.governorate && <div className="flex justify-between"><span className="text-on-surface-variant">الموقع</span><span className="font-bold flex items-center gap-1"><span className="material-symbols-outlined text-sm">location_on</span> {trip.governorate}{trip.city ? ` - ${trip.city}` : ''}</span></div>}
              </div>
              {trip.latitude && trip.longitude && (
                <div className="mt-3">
                  <MapView latitude={trip.latitude} longitude={trip.longitude} title={trip.title} sellerPhone={trip.contactPhone} />
                </div>
              )}
            </div>

            {/* Features */}
            {trip.features.length > 0 && (
              <div className="glass-card rounded-xl p-5">
                <h2 className="font-bold text-sm mb-3">المميزات</h2>
                <div className="flex flex-wrap gap-2">
                  {trip.features.map((f, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-bold">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* User */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {(trip.user.displayName || trip.user.username)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm">{trip.user.displayName || trip.user.username}</p>
                  {trip.user.isVerified && <span className="text-[11px] text-primary font-bold">موثّق ✓</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
