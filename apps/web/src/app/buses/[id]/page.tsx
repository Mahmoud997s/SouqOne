'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useBusListing, type BusListingItem } from '@/lib/api/buses';
import { useAuth } from '@/providers/auth-provider';
import { useCreateConversation } from '@/lib/api';
import { useToast } from '@/components/toast';

const BUS_TYPE_LABELS: Record<string, string> = {
  MINI_BUS: 'ميني باص', MEDIUM_BUS: 'باص متوسط', LARGE_BUS: 'باص كبير',
  COASTER: 'كوستر', SCHOOL_BUS: 'باص مدرسة',
};
const TYPE_LABELS: Record<string, string> = {
  BUS_SALE: 'للبيع', BUS_SALE_WITH_CONTRACT: 'بيع مع عقد',
  BUS_RENT: 'للإيجار', BUS_CONTRACT: 'طلب نقل',
};
const TYPE_COLORS: Record<string, string> = {
  BUS_SALE: 'bg-blue-600', BUS_SALE_WITH_CONTRACT: 'bg-emerald-600',
  BUS_RENT: 'bg-violet-600', BUS_CONTRACT: 'bg-orange-600',
};
const FUEL_MAP: Record<string, string> = { DIESEL: 'ديزل', PETROL: 'بنزين', HYBRID: 'هايبرد', ELECTRIC: 'كهربائي' };
const TRANS_MAP: Record<string, string> = { AUTOMATIC: 'أوتوماتيك', MANUAL: 'عادي' };
const COND_MAP: Record<string, string> = { NEW: 'جديد', LIKE_NEW: 'شبه جديد', USED: 'مستعمل', GOOD: 'جيد', FAIR: 'مقبول', POOR: 'ضعيف' };
const CONTRACT_MAP: Record<string, string> = { SCHOOL: 'مدرسة', COMPANY: 'شركة', GOVERNMENT: 'حكومي', TOURISM: 'سياحة', OTHER_CONTRACT: 'أخرى' };

function relativeTime(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `منذ ${m} دقيقة`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} ساعة`;
  const days = Math.floor(h / 24);
  if (days < 30) return `منذ ${days} يوم`;
  return `منذ ${Math.floor(days / 30)} شهر`;
}

export default function BusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: bus, isLoading, error } = useBusListing(id);

  if (isLoading) return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 max-w-6xl mx-auto px-4" dir="rtl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-container-low rounded-xl w-1/3" />
          <div className="h-80 bg-surface-container-low rounded-2xl" />
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8 space-y-4"><div className="h-40 bg-surface-container-low rounded-2xl" /><div className="h-40 bg-surface-container-low rounded-2xl" /></div>
            <div className="col-span-4 space-y-4"><div className="h-60 bg-surface-container-low rounded-2xl" /></div>
          </div>
        </div>
      </main>
    </>
  );

  if (error || !bus) return (
    <>
      <Navbar />
      <main className="pt-24 pb-16 max-w-6xl mx-auto px-4 text-center" dir="rtl">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">error</span>
        <p className="text-on-surface-variant text-lg mt-4 font-bold">إعلان الحافلة غير موجود</p>
        <Link href="/buses" className="inline-block mt-4 bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-black">العودة لسوق الحافلات</Link>
      </main>
    </>
  );

  return <BusDetailContent bus={bus} />;
}

function BusDetailContent({ bus }: { bus: BusListingItem }) {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const createConv = useCreateConversation();
  const [currentImg, setCurrentImg] = useState(0);

  const isOwner = user?.id === bus.userId;
  const isContract = bus.busListingType === 'BUS_CONTRACT';
  const hasContract = bus.busListingType === 'BUS_SALE_WITH_CONTRACT';
  const isRent = bus.busListingType === 'BUS_RENT';

  async function handleMessage() {
    if (!user) { router.push('/auth/login'); return; }
    try {
      const conv = await createConv.mutateAsync({ entityType: 'BUS_LISTING', entityId: bus.id });
      router.push(`/chat/${conv.id}`);
    } catch { addToast('error', 'حدث خطأ في بدء المحادثة'); }
  }

  const images = bus.images ?? [];
  const mainImage = images[currentImg]?.url;

  return (
    <>
      <Navbar />
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none} .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div className="min-h-screen bg-surface-container-low/30 dark:bg-surface-container-lowest">
        <main className="pt-24 pb-32 lg:pb-16 max-w-6xl mx-auto px-4 md:px-8" dir="rtl" style={{ scrollBehavior: 'smooth' }}>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <Link href="/buses" className="hover:text-primary transition-colors">الحافلات</Link>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <span className="text-on-surface font-bold truncate max-w-[200px]">{bus.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ── Left Column ── */}
            <div className="lg:col-span-8 space-y-4">
              {/* Image Gallery */}
              {!isContract && images.length > 0 && (
                <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm">
                  <div className="relative aspect-[16/9] bg-black">
                    {mainImage ? (
                      <Image src={mainImage} alt={bus.title} fill className="object-contain" sizes="(max-width:1024px) 100vw, 66vw" priority />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-7xl text-white/20">directions_bus</span></div>
                    )}
                    <span className={`absolute top-3 right-3 text-white text-xs font-black px-3 py-1 rounded-lg ${TYPE_COLORS[bus.busListingType] || 'bg-primary'}`}>
                      {TYPE_LABELS[bus.busListingType]}
                    </span>
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-1.5 p-2 overflow-x-auto scrollbar-hide">
                      {images.map((img, i) => (
                        <button key={img.id} onClick={() => setCurrentImg(i)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === currentImg ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                          <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Specs Grid */}
              {!isContract && (
                <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">info</span>
                    <h2 className="font-black text-on-surface text-xs">المواصفات</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-outline-variant/5">
                    {[
                      { icon: 'directions_bus', label: 'النوع', value: BUS_TYPE_LABELS[bus.busType] },
                      { icon: 'factory', label: 'الماركة', value: bus.make },
                      { icon: 'badge', label: 'الموديل', value: bus.model },
                      { icon: 'calendar_month', label: 'السنة', value: bus.year },
                      { icon: 'groups', label: 'السعة', value: `${bus.capacity} راكب` },
                      bus.mileage ? { icon: 'speed', label: 'المسافة', value: `${bus.mileage.toLocaleString()} كم` } : null,
                      bus.fuelType ? { icon: 'local_gas_station', label: 'الوقود', value: FUEL_MAP[bus.fuelType] } : null,
                      bus.transmission ? { icon: 'settings', label: 'ناقل الحركة', value: TRANS_MAP[bus.transmission] } : null,
                      { icon: 'verified', label: 'الحالة', value: COND_MAP[bus.condition] || bus.condition },
                    ].filter(Boolean).map((s, i) => (
                      <div key={i} className="bg-surface-container-lowest dark:bg-surface-container p-3 flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-primary text-base">{s!.icon}</span>
                        <div>
                          <p className="text-[10px] text-on-surface-variant">{s!.label}</p>
                          <p className="text-xs font-black text-on-surface">{s!.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contract Details (for BUS_SALE_WITH_CONTRACT) */}
              {hasContract && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-emerald-200/60 dark:border-emerald-800/30 flex items-center gap-1.5 bg-emerald-100/50 dark:bg-emerald-900/20">
                    <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400 text-base">assignment</span>
                    <h2 className="font-black text-emerald-800 dark:text-emerald-300 text-xs">عقد مرفق — دخل مضمون</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {bus.contractType && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">business</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">نوع العقد</p>
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">{CONTRACT_MAP[bus.contractType] || bus.contractType}</p>
                      </div>
                    )}
                    {bus.contractClient && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">person</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">العميل</p>
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">{bus.contractClient}</p>
                      </div>
                    )}
                    {bus.contractMonthly && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">payments</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">راتب شهري</p>
                        <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">{Number(bus.contractMonthly).toLocaleString()} ر.ع.</p>
                      </div>
                    )}
                    {bus.contractDuration && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">event</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">مدة العقد</p>
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">{bus.contractDuration} شهر</p>
                      </div>
                    )}
                  </div>
                  {bus.contractMonthly && bus.price && (
                    <div className="px-4 pb-4">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-xs text-emerald-700 dark:text-emerald-300 font-bold">العائد الاستثماري التقديري</span>
                        <span className="text-sm font-black text-emerald-800 dark:text-emerald-200">
                          {((Number(bus.contractMonthly) * 12 / Number(bus.price)) * 100).toFixed(1)}% سنوياً
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contract Request Details */}
              {isContract && (
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-800/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-orange-200/60 dark:border-orange-800/30 flex items-center gap-1.5 bg-orange-100/50 dark:bg-orange-900/20">
                    <span className="material-symbols-outlined text-orange-700 dark:text-orange-400 text-base">request_quote</span>
                    <h2 className="font-black text-orange-800 dark:text-orange-300 text-xs">تفاصيل طلب النقل</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {bus.requestPassengers && (
                      <div className="bg-white dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-100 dark:border-orange-800/20">
                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-lg block mb-0.5">groups</span>
                        <p className="text-[9px] text-orange-500">عدد الركاب</p>
                        <p className="text-sm font-black text-orange-800 dark:text-orange-200">{bus.requestPassengers}</p>
                      </div>
                    )}
                    {bus.requestSchedule && (
                      <div className="bg-white dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-100 dark:border-orange-800/20">
                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-lg block mb-0.5">schedule</span>
                        <p className="text-[9px] text-orange-500">الجدول</p>
                        <p className="text-xs font-black text-orange-800 dark:text-orange-200">{bus.requestSchedule}</p>
                      </div>
                    )}
                    {bus.requestRoute && (
                      <div className="bg-white dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-100 dark:border-orange-800/20 sm:col-span-1 col-span-2">
                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-lg block mb-0.5">route</span>
                        <p className="text-[9px] text-orange-500">المسار</p>
                        <p className="text-xs font-black text-orange-800 dark:text-orange-200">{bus.requestRoute}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Features */}
              {bus.features.length > 0 && (
                <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">star</span>
                    <h2 className="font-black text-on-surface text-xs">المميزات</h2>
                  </div>
                  <div className="p-4 flex flex-wrap gap-2">
                    {bus.features.map(f => (
                      <span key={f} className="bg-primary/5 dark:bg-primary/10 text-primary text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>{f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {bus.description && (
                <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">description</span>
                    <h2 className="font-black text-on-surface text-xs">الوصف</h2>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-line">{bus.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Right Column ── */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28 lg:self-start">
              {/* Price Card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="p-4">
                  <h1 className="text-lg font-black text-on-surface mb-0.5 leading-tight">{bus.title}</h1>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-md ${TYPE_COLORS[bus.busListingType] || 'bg-primary'}`}>
                      {TYPE_LABELS[bus.busListingType]}
                    </span>
                    {!isContract && (
                      <span className="text-xs text-on-surface-variant">{BUS_TYPE_LABELS[bus.busType]} · {bus.capacity} راكب</span>
                    )}
                  </div>

                  {/* Sale Price */}
                  {(bus.busListingType === 'BUS_SALE' || hasContract) && bus.price && (
                    <div className="mb-3">
                      <p className="text-2xl font-black text-primary">{Number(bus.price).toLocaleString('en-US')} <span className="text-sm text-on-surface-variant font-bold">ر.ع.</span></p>
                      {bus.isPriceNegotiable && (
                        <p className="text-xs text-primary font-bold flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">swap_horiz</span>قابل للتفاوض</p>
                      )}
                    </div>
                  )}

                  {/* Contract Revenue */}
                  {hasContract && bus.contractMonthly && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-3 mb-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="material-symbols-outlined text-emerald-600 text-sm">trending_up</span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">دخل العقد</span>
                      </div>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{Number(bus.contractMonthly).toLocaleString()} <span className="text-[10px] font-bold">ر.ع./شهر</span></p>
                    </div>
                  )}

                  {/* Rental Prices */}
                  {isRent && (
                    <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/30 rounded-xl overflow-hidden mb-3">
                      {bus.dailyPrice && (
                        <div className="flex justify-between items-center px-3 py-2.5 border-b border-violet-100/60 dark:border-violet-800/20">
                          <span className="text-xs text-violet-800 dark:text-violet-300 font-bold">يومي</span>
                          <span className="text-lg font-black text-violet-700 dark:text-violet-300">{Number(bus.dailyPrice).toLocaleString()} <span className="text-[10px]">ر.ع.</span></span>
                        </div>
                      )}
                      {bus.monthlyPrice && (
                        <div className="flex justify-between items-center px-3 py-2.5">
                          <span className="text-xs text-violet-800 dark:text-violet-300 font-bold">شهري</span>
                          <span className="font-black text-on-surface text-sm">{Number(bus.monthlyPrice).toLocaleString()} <span className="text-[10px] text-on-surface-variant">ر.ع.</span></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Rental Badges */}
                  {isRent && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {bus.withDriver && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-black px-2.5 py-1 rounded-md">
                          <span className="material-symbols-outlined text-[11px]">person</span>مع سائق
                        </span>
                      )}
                      {bus.deliveryAvailable && (
                        <span className="inline-flex items-center gap-1 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 text-[11px] font-black px-2.5 py-1 rounded-md">
                          <span className="material-symbols-outlined text-[11px]">local_shipping</span>توصيل
                        </span>
                      )}
                      {bus.minRentalDays && (
                        <span className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-800/40 text-violet-700 dark:text-violet-300 text-[11px] font-black px-2.5 py-1 rounded-md">
                          <span className="material-symbols-outlined text-[11px]">timer</span>أقل مدة: {bus.minRentalDays} يوم
                        </span>
                      )}
                    </div>
                  )}

                  {/* CTA Buttons */}
                  {!isOwner ? (
                    <div className="space-y-2">
                      <button onClick={handleMessage} disabled={createConv.isPending}
                        className="w-full bg-primary text-on-primary py-3 rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-1.5">
                        <span className="material-symbols-outlined text-base">chat</span>
                        {createConv.isPending ? 'جارٍ...' : 'تواصل مع المعلن'}
                      </button>
                      {bus.contactPhone && (
                        <a href={`tel:${bus.contactPhone}`}
                          className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 hover:bg-primary hover:text-on-primary">
                          <span className="material-symbols-outlined text-sm">call</span>اتصال: {bus.contactPhone}
                        </a>
                      )}
                      {bus.whatsapp && (
                        <a href={`https://wa.me/${bus.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="w-full bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 hover:brightness-110">
                          <span className="text-sm">واتساب</span>
                        </a>
                      )}
                    </div>
                  ) : (
                    <Link href={`/edit-listing/bus/${bus.id}`}
                      className="w-full bg-on-surface text-surface py-2.5 rounded-xl text-center block text-sm font-black hover:bg-primary hover:text-on-primary transition-colors">
                      تعديل الإعلان
                    </Link>
                  )}
                </div>
              </div>

              {/* Seller Card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-outline-variant/10 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-base">storefront</span>
                  <h3 className="font-black text-on-surface text-xs">معلومات المعلن</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                      {(bus.user.displayName || bus.user.username)[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-on-surface text-sm truncate">{bus.user.displayName || bus.user.username}</p>
                      {bus.user.governorate && (
                        <p className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[11px] text-primary">location_on</span>{bus.user.governorate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant/10 shadow-sm p-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                    <span className="font-black text-on-surface">{bus.viewCount}</span>
                    <span>مشاهدة</span>
                  </div>
                  <span className="text-outline-variant/20">|</span>
                  <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                    <span>{relativeTime(bus.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />

      {/* Mobile sticky CTA */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-surface-container-lowest/95 dark:bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-w-lg mx-auto">
            <div className="shrink-0">
              {bus.price ? (
                <div>
                  <span className="text-lg font-black text-primary leading-none">{Number(bus.price).toLocaleString('en-US')}</span>
                  <span className="text-[10px] text-on-surface-variant mr-1">ر.ع.</span>
                </div>
              ) : bus.dailyPrice ? (
                <div>
                  <span className="text-lg font-black text-primary leading-none">{Number(bus.dailyPrice).toLocaleString('en-US')}</span>
                  <span className="text-[10px] text-on-surface-variant mr-1">ر.ع./يوم</span>
                </div>
              ) : null}
            </div>
            <div className="flex-1 flex items-center gap-2 justify-end">
              <button onClick={handleMessage} disabled={createConv.isPending}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-black shadow-lg hover:brightness-110 transition-all flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">chat</span>
                تواصل
              </button>
              {bus.contactPhone && (
                <a href={`tel:${bus.contactPhone}`}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">call</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
