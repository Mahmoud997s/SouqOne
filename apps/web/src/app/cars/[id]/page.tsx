'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { DetailSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useListing, useListings, useCreateConversation, useCreateBooking, useBookingAvailability, useCalculatePrice } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { SellerCard } from '@/components/seller-card';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import { haversineDistance } from '@/lib/geo-utils';
import { getImageUrl } from '@/lib/image-utils';
import { FUEL_LABELS, TRANSMISSION_LABELS, CONDITION_LABELS, DRIVE_LABELS, CANCEL_LABELS } from '@/lib/constants/mappings';
import { relativeTime } from '@/lib/time-utils';
import { ImageCarousel } from '@/components/ui/image-carousel';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

const fuelMap = FUEL_LABELS;
const transMap = TRANSMISSION_LABELS;
const condMap = CONDITION_LABELS;
const driveMap = DRIVE_LABELS;
const cancelMap = CANCEL_LABELS;

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: car, isLoading, isError, refetch } = useListing(id);
  const createConv = useCreateConversation();
  const { data: similar } = useListings(car ? { limit: '4', search: car.make, listingType: car.listingType ?? 'SALE' } : {});

  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const { addToast } = useToast();
  const createBooking = useCreateBooking();

  // Rental state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const isRental = car?.listingType === 'RENTAL';
  const { data: availability } = useBookingAvailability(isRental ? id : '');
  const { data: priceCalc } = useCalculatePrice(isRental ? id : '', startDate, endDate);

  const isOwner = user && car?.seller?.id === user.id;

  function handleMessage() {
    requireAuth(async () => {
      if (!car) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'LISTING', entityId: car.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المحادثة');
      }
    }, 'سجّل الدخول لإرسال رسالة');
  }

  function handleBuyNow() {
    requireAuth(async () => {
      if (!car) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'LISTING', entityId: car.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المحادثة');
      }
    }, 'سجّل الدخول لإتمام الشراء');
  }

  function handleBooking() {
    requireAuth(async () => {
      if (!car || !startDate || !endDate) {
        addToast('error', 'يرجى اختيار تاريخ البداية والنهاية');
        return;
      }
      try {
        const booking = await createBooking.mutateAsync({
          listingId: car.id,
          startDate,
          endDate,
        });
        addToast('success', 'تم إرسال طلب الحجز بنجاح!');
        router.push(`/bookings/${booking.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء الحجز');
      }
    }, 'سجّل الدخول لإتمام الحجز');
  }

  if (isLoading) return <><Navbar /><div className="min-h-screen bg-background"><div className="h-40 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447]" /><main className="max-w-6xl mx-auto px-4 md:px-8 -mt-16"><DetailSkeleton /></main></div></>;
  if (isError || !car) return <><Navbar /><div className="min-h-screen bg-background pt-28"><main className="max-w-6xl mx-auto px-4 md:px-8"><ErrorState onRetry={() => refetch()} /></main></div><Footer /></>;

  const images = car.images?.length ? car.images : [];
  const priceFormatted = Number(car.price).toLocaleString('en-US');

  const specs = [
    { icon: 'speed', label: 'المسافة', value: car.mileage ? `${car.mileage.toLocaleString('en-US')} كم` : '—' },
    { icon: 'local_gas_station', label: 'المحرك', value: car.engineSize || '—' },
    { icon: 'settings', label: 'ناقل الحركة', value: car.transmission ? (transMap[car.transmission] ?? car.transmission) : '—' },
    { icon: 'bolt', label: 'القوة', value: car.horsepower ? `${car.horsepower} حصان` : '—' },
  ];

  const detailRows = [
    { label: 'سنة الصنع', value: car.year },
    { label: 'اللون الخارجي', value: car.exteriorColor || '—' },
    { label: 'اللون الداخلي', value: car.interior || '—' },
    { label: 'نوع الوقود', value: car.fuelType ? (fuelMap[car.fuelType] ?? car.fuelType) : '—' },
    { label: 'نوع الدفع', value: car.driveType ? (driveMap[car.driveType] ?? car.driveType) : '—' },
    { label: 'الأبواب', value: car.doors || '—' },
    { label: 'المقاعد', value: car.seats || '—' },
    { label: 'نوع الهيكل', value: car.bodyType || '—' },
    { label: 'الحالة', value: car.condition ? (condMap[car.condition] ?? car.condition) : '—' },
  ];

  const filteredSimilar = similar?.items?.filter((s) => s.id !== car.id).slice(0, 4) ?? [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-6xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-24 lg:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link href="/listings" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">storefront</span> السوق
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <span className="text-white font-bold line-clamp-1">{car.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── Left Column: Images + Specs ── */}
            <div className="lg:col-span-8 space-y-6">
              {/* Image Gallery */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <ImageCarousel
                  images={images.map(img => ({ id: img.id, url: getImageUrl(img.url) || '' }))}
                  alt={car.title}
                  badge={car.condition ? (
                    <span className="bg-surface-container-lowest/90 dark:bg-surface-container/90 backdrop-blur-sm text-on-surface text-xs font-black px-3 py-1.5">{condMap[car.condition] ?? car.condition}</span>
                  ) : undefined}
                />
              </div>

              {/* Vehicle Specifications */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tune</span>
                  <h2 className="font-black text-on-surface">المواصفات</h2>
                </div>
                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {specs.map((s) => (
                      <div key={s.label} className="bg-surface-container-low/50 dark:bg-surface-container-high/30 p-4 text-center">
                        <span className="material-symbols-outlined text-primary text-2xl mb-2 block">{s.icon}</span>
                        <p className="text-xs text-on-surface-variant mb-1">{s.label}</p>
                        <p className="font-black text-on-surface text-sm">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Detail Table */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    {detailRows.map((row) => (
                      <div key={row.label} className="flex justify-between items-center py-3 border-b border-outline-variant/10 dark:border-outline-variant/20">
                        <span className="text-sm text-on-surface-variant">{row.label}</span>
                        <span className="font-black text-on-surface text-sm">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Features / Amenities */}
              {car.features && car.features.length > 0 && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">stars</span>
                    <h2 className="font-black text-on-surface">كماليات السيارة</h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                      {car.features.map((feat: string) => (
                        <span key={feat} className="inline-flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-primary px-3 py-1.5 text-xs font-black">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {car.description && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-black text-on-surface">الوصف</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">{car.description}</p>
                  </div>
                </div>
              )}

              {/* Location Map */}
              {car.latitude && car.longitude && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    <h2 className="font-black text-on-surface">الموقع</h2>
                  </div>
                  <div className="p-6">
                    <LocationSection car={car} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column: Price + Seller + Actions ── */}
            <div className="lg:col-span-4 space-y-4">
              {/* Price Card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 md:p-5">
                  <h1 className="text-lg md:text-xl font-black text-on-surface mb-0.5 leading-tight">{car.title}</h1>
                  <p className="text-on-surface-variant text-xs mb-4 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-primary">directions_car</span>
                    {car.year} · {car.make} {car.model}
                  </p>

                  {isRental ? (
                    <>
                      {/* Rental Prices */}
                      <div className="bg-blue-50/80 dark:bg-blue-950/30 rounded-xl overflow-hidden mb-3 border border-blue-100 dark:border-blue-900/30">
                        {car.dailyPrice && (
                          <div className="flex justify-between items-center px-3 py-2.5 border-b border-blue-100/60 dark:border-blue-900/20">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">today</span>
                              <span className="text-blue-900 dark:text-blue-200 text-xs font-bold">يومي</span>
                            </div>
                            <span className="text-lg font-black text-blue-700 dark:text-blue-300">{Number(car.dailyPrice).toLocaleString('en-US')} <small className="text-[10px] font-bold text-blue-500 dark:text-blue-400">ر.ع./يوم</small></span>
                          </div>
                        )}
                        {car.weeklyPrice && (
                          <div className="flex justify-between items-center px-3 py-2.5 border-b border-blue-100/60 dark:border-blue-900/20">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-sm">date_range</span>
                              <span className="text-blue-800 dark:text-blue-300 text-xs font-bold">أسبوعي</span>
                            </div>
                            <span className="font-black text-on-surface text-sm">{Number(car.weeklyPrice).toLocaleString('en-US')} <small className="text-[10px] text-on-surface-variant font-bold">ر.ع.</small></span>
                          </div>
                        )}
                        {car.monthlyPrice && (
                          <div className="flex justify-between items-center px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-sm">calendar_month</span>
                              <span className="text-blue-800 dark:text-blue-300 text-xs font-bold">شهري</span>
                            </div>
                            <span className="font-black text-on-surface text-sm">{Number(car.monthlyPrice).toLocaleString('en-US')} <small className="text-[10px] text-on-surface-variant font-bold">ر.ع.</small></span>
                          </div>
                        )}
                      </div>

                      {/* Rental Badges */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {car.deliveryAvailable && (
                          <span className="inline-flex items-center gap-1 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[11px] font-black px-2.5 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[11px]">local_shipping</span>توصيل متاح
                          </span>
                        )}
                        {car.insuranceIncluded && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 dark:bg-blue-800/40 text-blue-700 dark:text-blue-300 text-[11px] font-black px-2.5 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[11px]">shield</span>تأمين شامل
                          </span>
                        )}
                        {car.withDriver && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-black px-2.5 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[11px]">person</span>مع سائق
                          </span>
                        )}
                        {car.cancellationPolicy && (
                          <span className="inline-flex items-center gap-1 bg-orange-100 dark:bg-orange-800/40 text-orange-700 dark:text-orange-300 text-[11px] font-black px-2.5 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[11px]">event_busy</span>{cancelMap[car.cancellationPolicy] ?? car.cancellationPolicy}
                          </span>
                        )}
                      </div>

                      {/* Rental Info */}
                      {(car.minRentalDays || car.kmLimitPerDay || car.depositAmount) && (
                        <div className="grid grid-cols-3 gap-1.5 mb-4">
                          {car.minRentalDays && (
                            <div className="bg-violet-50 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-800/30 rounded-lg p-2 text-center">
                              <span className="material-symbols-outlined text-violet-600 dark:text-violet-400 text-base block mb-0.5">timer</span>
                              <p className="text-[9px] text-violet-500 dark:text-violet-400 font-medium">أقل مدة</p>
                              <p className="text-xs font-black text-violet-800 dark:text-violet-200">{car.minRentalDays} يوم</p>
                            </div>
                          )}
                          {car.kmLimitPerDay && (
                            <div className="bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800/30 rounded-lg p-2 text-center">
                              <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-base block mb-0.5">speed</span>
                              <p className="text-[9px] text-teal-500 dark:text-teal-400 font-medium">حد يومي</p>
                              <p className="text-xs font-black text-teal-800 dark:text-teal-200">{car.kmLimitPerDay} كم</p>
                            </div>
                          )}
                          {car.depositAmount && (
                            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800/30 rounded-lg p-2 text-center">
                              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-base block mb-0.5">account_balance_wallet</span>
                              <p className="text-[9px] text-amber-500 dark:text-amber-400 font-medium">تأمين</p>
                              <p className="text-xs font-black text-amber-800 dark:text-amber-200">{Number(car.depositAmount).toLocaleString('en-US')} ر.ع.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Date Picker */}
                      {!isOwner && (
                        <div className="space-y-2.5">
                          <p className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-xs text-primary">calendar_month</span>اختر موعد الإيجار</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">من</label>
                              <input
                                type="date"
                                value={startDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full bg-surface-container-low dark:bg-surface-container-high/50 border border-outline-variant/20 dark:border-outline-variant/30 rounded-lg py-2 px-2.5 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-xs transition-all"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">إلى</label>
                              <input
                                type="date"
                                value={endDate}
                                min={startDate || new Date().toISOString().split('T')[0]}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full bg-surface-container-low dark:bg-surface-container-high/50 border border-outline-variant/20 dark:border-outline-variant/30 rounded-lg py-2 px-2.5 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none text-xs transition-all"
                              />
                            </div>
                          </div>

                          {priceCalc && (
                            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-lg p-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-emerald-700 dark:text-emerald-300">{priceCalc.breakdown}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-black text-on-surface text-xs">المجموع</span>
                                <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{priceCalc.totalPrice.toLocaleString('en-US')} ر.ع.</span>
                              </div>
                              {priceCalc.depositAmount && (
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">+ تأمين {priceCalc.depositAmount.toLocaleString('en-US')} ر.ع. (مسترد)</p>
                              )}
                            </div>
                          )}

                          {/* Booked dates warning */}
                          {availability && availability.length > 0 && (
                            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/40 rounded-lg p-2.5">
                              <p className="text-[11px] font-black text-amber-700 dark:text-amber-400 mb-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-xs">event_busy</span>فترات محجوزة:</p>
                              {availability.map((a, i) => (
                                <p key={i} className="text-[10px] text-amber-600 dark:text-amber-400 mr-4">
                                  {new Date(a.startDate).toLocaleDateString('ar-OM')} — {new Date(a.endDate).toLocaleDateString('ar-OM')}
                                </p>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={handleBooking}
                            disabled={createBooking.isPending || !startDate || !endDate}
                            className="btn-green w-full py-3 rounded-xl text-sm font-black hover:brightness-110 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-base">event_available</span>
                            {createBooking.isPending ? 'جارٍ الحجز...' : 'احجز الآن'}
                          </button>
                        </div>
                      )}

                      {isOwner && (
                        <Link href={`/edit-listing/${car.id}`} className="bg-on-surface text-surface w-full py-2.5 rounded-xl text-center block text-sm font-black hover:bg-primary hover:text-on-primary transition-colors">
                          تعديل الإعلان
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-black text-primary mb-0.5" style={{ fontFamily: 'var(--font-body)' }}>
                        {priceFormatted} <small className="text-sm font-bold text-on-surface-variant">{car.currency}</small>
                      </p>
                      {car.isPriceNegotiable && (
                        <p className="text-primary text-xs font-bold mb-3 flex items-center gap-1"><span className="material-symbols-outlined text-xs">swap_horiz</span>قابل للتفاوض</p>
                      )}

                      {isOwner ? (
                        <Link href={`/edit-listing/${car.id}`} className="bg-on-surface text-surface w-full py-2.5 rounded-xl text-center block text-sm font-black hover:bg-primary hover:text-on-primary transition-colors">
                          تعديل الإعلان
                        </Link>
                      ) : (
                        <button onClick={handleBuyNow} disabled={createConv.isPending} className="bg-primary text-on-primary w-full py-3 rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-base">shopping_cart</span>
                          {createConv.isPending ? 'جارٍ التواصل...' : 'اشترِ الآن'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Seller Info */}
              <SellerCard
                name={car.seller.displayName || car.seller.username}
                avatarUrl={car.seller.avatarUrl}
                isVerified={car.seller.isVerified}
                location={car.seller.governorate}
                phone={car.seller.phone}
                sellerId={car.seller.id}
                whatsappText={`مرحباً، أنا مهتم بإعلانك: ${car.title}`}
                onMessage={handleMessage}
                messagePending={createConv.isPending}
                onShare={() => {
                  const url = window.location.href;
                  if (navigator.share) {
                    navigator.share({ title: car.title, text: `${car.title} - ${priceFormatted} ${car.currency === 'OMR' ? 'ر.ع' : car.currency}`, url });
                  } else {
                    navigator.clipboard.writeText(url);
                    addToast('success', 'تم نسخ الرابط');
                  }
                }}
                isOwner={!!isOwner}
              />

              {/* Social Proof — Urgency Bar */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm p-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                    <span className="font-black text-on-surface">{car.viewCount}</span>
                    <span>مشاهدة</span>
                  </div>
                  <span className="text-outline-variant/20">|</span>
                  <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                    <span>{relativeTime(car.createdAt)}</span>
                  </div>
                </div>
                {car.viewCount >= 10 && (
                  <div className="mt-2 flex items-center gap-1.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2.5 py-1.5 rounded-md text-[11px] font-black">
                    <span className="material-symbols-outlined text-xs">local_fire_department</span>
                    إعلان مطلوب — {car.viewCount} شخص شاهد هذا الإعلان
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Listings */}
          {filteredSimilar.length > 0 && (
            <section className="mt-16">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-on-surface">إعلانات مشابهة</h2>
                <Link href={`/listings?search=${car.make}`} className="text-primary font-bold border-b-2 border-primary pb-1 hover:brightness-110 transition-colors">
                  عرض الكل
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredSimilar.map((item) => {
                  const img = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
                  return (
                    <VehicleCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      make={item.make}
                      model={item.model}
                      year={item.year}
                      price={item.price}
                      currency={item.currency}
                      mileage={item.mileage}
                      fuelType={item.fuelType}
                      transmission={item.transmission}
                      imageUrl={img?.url}
                      viewCount={item.viewCount}
                      createdAt={item.createdAt}
                      isVerified={item.seller?.isVerified}
                      isPriceNegotiable={item.isPriceNegotiable}
                      listingType={item.listingType}
                      dailyPrice={item.dailyPrice}
                    />
                  );
                })}
              </div>
            </section>
          )}
        </main>

        {/* ── Sticky Mobile CTA Bar ── */}
        {!isOwner && (
          <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-surface-container-lowest/95 dark:bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/10 dark:border-outline-variant/20 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
              <div className="shrink-0">
                {isRental && car.dailyPrice ? (
                  <div>
                    <span className="text-lg font-black text-primary leading-none">{Number(car.dailyPrice).toLocaleString('en-US')}</span>
                    <span className="text-[10px] text-on-surface-variant mr-1">ر.ع./يوم</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-lg font-black text-primary leading-none">{priceFormatted}</span>
                    <span className="text-[10px] text-on-surface-variant mr-1">{car.currency === 'OMR' ? 'ر.ع' : car.currency}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 flex items-center gap-2 justify-end">
                {car.seller.phone && (
                  <a
                    href={`https://wa.me/${car.seller.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، أنا مهتم بإعلانك: ${car.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#25D366] text-white"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  </a>
                )}
                <button
                  onClick={handleMessage}
                  disabled={createConv.isPending}
                  className="flex items-center gap-1.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface px-4 py-2.5 rounded-xl text-sm font-black transition-all hover:bg-primary hover:text-on-primary"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  مراسلة
                </button>

                {isRental ? (
                  <button
                    onClick={handleBooking}
                    disabled={createBooking.isPending || !startDate || !endDate}
                    className="btn-green px-5 py-2.5 rounded-xl text-sm font-black shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">event_available</span>
                    احجز
                  </button>
                ) : (
                  <button
                    onClick={handleBuyNow}
                    disabled={createConv.isPending}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-black shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-base">shopping_cart</span>
                    اشترِ الآن
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

// قسم الموقع مع الخريطة + المسافة + Street View
function LocationSection({ car }: { car: { latitude: number | null; longitude: number | null; title: string; governorate: string | null; city: string | null; seller: { phone: string | null } } }) {
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [showStreetView, setShowStreetView] = useState(false);

  useEffect(() => {
    const cachedLat = sessionStorage.getItem('userLat');
    const cachedLng = sessionStorage.getItem('userLng');
    if (cachedLat && cachedLng) {
      setUserLat(parseFloat(cachedLat));
      setUserLng(parseFloat(cachedLng));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          sessionStorage.setItem('userLat', String(pos.coords.latitude));
          sessionStorage.setItem('userLng', String(pos.coords.longitude));
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  if (!car.latitude || !car.longitude) return null;

  const distance = userLat && userLng
    ? haversineDistance(userLat, userLng, car.latitude, car.longitude)
    : null;

  return (
    <div className="space-y-4">
      {/* المسافة + الموقع النصي */}
      <div className="flex flex-wrap items-center gap-4">
        {car.governorate && (
          <span className="text-sm text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base text-primary">apartment</span>
            {car.governorate}{car.city ? ` — ${car.city}` : ''}
          </span>
        )}
        {distance !== null && (
          <span className="bg-primary/10 text-primary px-3 py-1.5 text-xs font-black flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">near_me</span>
            {distance < 1 ? `${Math.round(distance * 1000)} م منك` : `${distance} كم منك`}
          </span>
        )}
      </div>

      {/* الخريطة */}
      <MapView
        latitude={car.latitude}
        longitude={car.longitude}
        title={car.title}
        showDirections={true}
        showShare={true}
        sellerPhone={car.seller?.phone}
      />

      {/* Street View */}
      <div>
        <button
          onClick={() => setShowStreetView(!showStreetView)}
          className="flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">streetview</span>
          {showStreetView ? 'إخفاء Street View' : 'عرض Street View'}
        </button>
        {showStreetView && (
          <div className="mt-3 h-[300px] overflow-hidden border border-outline-variant/10">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!4v0!6m8!1m7!1s!2m2!1d${car.latitude}!2d${car.longitude}!3f0!4f0!5f0.7820865974627469&output=svembed`}
              className="w-full h-full border-0"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </div>
  );
}
