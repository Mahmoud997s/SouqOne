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
import { VerifiedBadge } from '@/components/verified-badge';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import { haversineDistance } from '@/lib/geo-utils';
import { getImageUrl } from '@/lib/image-utils';
import { FUEL_LABELS, TRANSMISSION_LABELS, CONDITION_LABELS, DRIVE_LABELS, CANCEL_LABELS } from '@/lib/constants/mappings';
import { relativeTime } from '@/lib/time-utils';

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

  const [selectedImage, setSelectedImage] = useState(0);
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

  if (isLoading) return <><Navbar /><DetailSkeleton /></>;
  if (isError || !car) return <><Navbar /><div className="pt-28 px-8"><ErrorState onRetry={() => refetch()} /></div></>;

  const images = car.images?.length ? car.images : [];
  const currentImg = getImageUrl(images[selectedImage]?.url);
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
      <main className="pt-28 pb-24 lg:pb-16 max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/listings" className="hover:text-primary transition-colors">السوق</Link>
          <span className="material-symbols-outlined text-xs">chevron_left</span>
          <span className="text-on-surface font-bold line-clamp-1">{car.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ── Left Column: Images + Specs ── */}
          <div className="lg:col-span-8 space-y-8">
            {/* Main Image */}
            <div className="relative overflow-hidden aspect-[16/10] bg-surface-container-low">
              {currentImg ? (
                <img src={currentImg} alt={car.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-7xl">directions_car</span>
                </div>
              )}


              {car.condition && (
                <span className="absolute top-4 right-4 badge-verified">{condMap[car.condition] ?? car.condition}</span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {images.map((img, i) => (
                  <button
                    key={img.id || i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-20 h-20 overflow-hidden transition-all ${
                      i === selectedImage ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={getImageUrl(img.url) || ''} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Vehicle Specifications */}
            <section className="bg-surface-container-lowest border border-outline-variant/10 p-6 md:p-8">
              <h2 className="text-xl font-black mb-6">المواصفات</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {specs.map((s) => (
                  <div key={s.label} className="bg-surface-container p-4 text-center">
                    <span className="material-symbols-outlined text-primary text-2xl mb-2 block">{s.icon}</span>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="font-black text-on-surface text-sm">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Detail Table */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                {detailRows.map((row) => (
                  <div key={row.label}>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest">{row.label}</p>
                    <p className="font-bold text-on-surface text-sm">{row.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Description */}
            {car.description && (
              <section className="bg-surface-container-lowest border border-outline-variant/10 p-6 md:p-8">
                <h2 className="text-xl font-black mb-4">الوصف</h2>
                <p className="text-on-surface-variant leading-relaxed whitespace-pre-line">{car.description}</p>
              </section>
            )}

            {/* Location Map */}
            {car.latitude && car.longitude && (
              <section className="bg-surface-container-lowest border border-outline-variant/10 p-6 md:p-8">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  الموقع
                </h2>
                <LocationSection car={car} />
              </section>
            )}
          </div>

          {/* ── Right Column: Price + Seller + Actions ── */}
          <div className="lg:col-span-4 space-y-6">
            {/* Price Card */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-6 md:p-8 shadow-sm">
              <h1 className="text-2xl font-black text-on-surface mb-2">{car.title}</h1>
              <p className="text-on-surface-variant text-sm mb-4">{car.year} · {car.make} {car.model}</p>

              {isRental ? (
                <>
                  {/* Rental Prices */}
                  <div className="space-y-2 mb-4">
                    {car.dailyPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-sm">يومي</span>
                        <span className="text-2xl font-black text-primary">{Number(car.dailyPrice).toLocaleString('en-US')} <small className="text-sm font-bold text-on-surface-variant">ر.ع./يوم</small></span>
                      </div>
                    )}
                    {car.weeklyPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-sm">أسبوعي</span>
                        <span className="font-bold text-on-surface">{Number(car.weeklyPrice).toLocaleString('en-US')} <small className="text-xs text-on-surface-variant">ر.ع.</small></span>
                      </div>
                    )}
                    {car.monthlyPrice && (
                      <div className="flex justify-between items-center">
                        <span className="text-on-surface-variant text-sm">شهري</span>
                        <span className="font-bold text-on-surface">{Number(car.monthlyPrice).toLocaleString('en-US')} <small className="text-xs text-on-surface-variant">ر.ع.</small></span>
                      </div>
                    )}
                  </div>

                  {/* Rental Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {car.withDriver && <span className="bg-emerald-500 text-white text-xs font-black px-3 py-1.5">مع سائق</span>}
                    {car.deliveryAvailable && <span className="bg-on-surface text-surface text-xs font-black px-3 py-1.5">توصيل متاح</span>}
                    {car.insuranceIncluded && <span className="bg-tertiary-container text-tertiary-fixed-dim text-xs font-black px-3 py-1.5">تأمين شامل</span>}
                    {car.cancellationPolicy && <span className="bg-surface-container text-on-surface-variant text-xs font-black px-3 py-1.5">{cancelMap[car.cancellationPolicy] ?? car.cancellationPolicy}</span>}
                  </div>

                  {/* Rental Info */}
                  <div className="bg-surface-container p-3 mb-4 space-y-1 text-xs text-on-surface-variant">
                    {car.minRentalDays && <p>أقل مدة: <strong className="text-on-surface">{car.minRentalDays} يوم</strong></p>}
                    {car.kmLimitPerDay && <p>حد الكيلومترات: <strong className="text-on-surface">{car.kmLimitPerDay} كم/يوم</strong></p>}
                    {car.depositAmount && <p>تأمين: <strong className="text-on-surface">{Number(car.depositAmount).toLocaleString('en-US')} ر.ع.</strong></p>}
                  </div>

                  {/* Date Picker */}
                  {!isOwner && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">من</label>
                          <input
                            type="date"
                            value={startDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-1">إلى</label>
                          <input
                            type="date"
                            value={endDate}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm"
                          />
                        </div>
                      </div>

                      {priceCalc && (
                        <div className="bg-primary/5 border border-primary/20 p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-on-surface-variant">{priceCalc.breakdown}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-on-surface">المجموع</span>
                            <span className="text-xl font-black text-primary">{priceCalc.totalPrice.toLocaleString('en-US')} ر.ع.</span>
                          </div>
                          {priceCalc.depositAmount && (
                            <p className="text-xs text-on-surface-variant mt-1">+ تأمين {priceCalc.depositAmount.toLocaleString('en-US')} ر.ع. (مسترد)</p>
                          )}
                        </div>
                      )}

                      {/* Booked dates warning */}
                      {availability && availability.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 p-3">
                          <p className="text-xs font-bold text-amber-700 mb-1">فترات محجوزة:</p>
                          {availability.map((a, i) => (
                            <p key={i} className="text-xs text-amber-600">
                              {new Date(a.startDate).toLocaleDateString('ar-OM')} — {new Date(a.endDate).toLocaleDateString('ar-OM')}
                            </p>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={handleBooking}
                        disabled={createBooking.isPending || !startDate || !endDate}
                        className="btn-green w-full py-3.5 text-lg font-black hover:brightness-110 transition-colors disabled:opacity-60 shadow-ambient"
                      >
                        {createBooking.isPending ? 'جارٍ الحجز...' : 'احجز الآن'}
                      </button>
                    </div>
                  )}

                  {isOwner && (
                    <Link href={`/edit-listing/${car.id}`} className="bg-on-surface text-surface w-full py-3.5 text-center block text-lg font-black hover:bg-primary hover:text-on-primary transition-colors">
                      تعديل الإعلان
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <p className="text-3xl font-black text-primary mb-1" style={{ fontFamily: 'var(--font-body)' }}>
                    {priceFormatted} <small className="text-base font-bold text-on-surface-variant">{car.currency}</small>
                  </p>
                  {car.isPriceNegotiable && (
                    <p className="text-primary text-sm font-bold mb-4">قابل للتفاوض</p>
                  )}

                  {isOwner ? (
                    <Link href={`/edit-listing/${car.id}`} className="bg-on-surface text-surface w-full py-3.5 text-center block text-lg font-black hover:bg-primary hover:text-on-primary transition-colors">
                      تعديل الإعلان
                    </Link>
                  ) : (
                    <button onClick={handleBuyNow} disabled={createConv.isPending} className="bg-primary text-on-primary w-full py-3.5 text-lg font-black hover:brightness-110 transition-colors shadow-ambient">
                      {createConv.isPending ? 'جارٍ التواصل...' : 'اشترِ الآن'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-6 md:p-8">
              <h3 className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-4">معلومات البائع</h3>
              <Link href={`/seller/${car.seller.id}`} className="flex items-center gap-4 mb-4 group">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {(car.seller.displayName || car.seller.username)[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-black text-on-surface group-hover:text-primary transition-colors">
                    {car.seller.displayName || car.seller.username}
                  </p>
                  {car.seller.isVerified && <VerifiedBadge label="بائع موثق" />}
                  {car.seller.governorate && (
                    <p className="text-xs text-on-surface-variant mt-1">{car.seller.governorate}</p>
                  )}
                </div>
              </Link>

              {!isOwner && (
                <div className="flex gap-3">
                  <button
                    onClick={handleMessage}
                    disabled={createConv.isPending}
                    className="flex-1 bg-surface-container py-3 font-black text-sm text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">chat</span>
                    {createConv.isPending ? 'جارٍ...' : 'مراسلة'}
                  </button>
                  {car.seller.phone && (
                    <a
                      href={`tel:${car.seller.phone}`}
                      className="flex-1 bg-surface-container py-3 font-black text-sm text-on-surface hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">call</span>
                      اتصال
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Social Proof — Urgency Bar */}
            <div className="bg-surface-container-lowest border border-outline-variant/10 p-5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-lg text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                  <span className="font-bold text-on-surface">{car.viewCount}</span>
                  <span>مشاهدة</span>
                </div>
                <span className="text-outline-variant">·</span>
                <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                  <span className="material-symbols-outlined text-lg text-primary">schedule</span>
                  <span>{relativeTime(car.createdAt)}</span>
                </div>
              </div>
              {car.viewCount >= 10 && (
                <div className="mt-3 flex items-center gap-2 bg-tertiary-container/30 dark:bg-tertiary-container/10 text-on-tertiary-container dark:text-tertiary-fixed-dim px-3 py-2 rounded-lg text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span>
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
              <h2 className="text-2xl font-black">إعلانات مشابهة</h2>
              <Link href={`/listings?search=${car.make}`} className="text-primary font-bold border-b-2 border-primary pb-1 hover:brightness-110 transition-colors">
                عرض الكل
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden glass-nav border-t border-outline-variant/10">
          <div className="flex items-center gap-2 px-4 py-3 max-w-lg mx-auto">
            {/* Price */}
            <div className="shrink-0">
              <span className="text-lg font-black text-primary leading-none">{priceFormatted}</span>
              <span className="text-[10px] text-on-surface-variant mr-1">{car.currency === 'OMR' ? 'ر.ع' : car.currency}</span>
            </div>

            <div className="flex-1 flex items-center gap-2 justify-end">
              {/* Chat */}
              <button
                onClick={handleMessage}
                disabled={createConv.isPending}
                className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high px-4 py-2.5 rounded-xl text-sm font-bold text-on-surface transition-all"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                مراسلة
              </button>

              {/* Primary CTA */}
              {isRental ? (
                <button
                  onClick={handleBooking}
                  disabled={createBooking.isPending || !startDate || !endDate}
                  className="btn-green px-5 py-2.5 text-sm font-black shadow-ambient disabled:opacity-60"
                >
                  احجز
                </button>
              ) : (
                <button
                  onClick={handleBuyNow}
                  disabled={createConv.isPending}
                  className="btn-editorial px-5 py-2.5 text-sm font-black shadow-ambient"
                >
                  اشترِ الآن
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
