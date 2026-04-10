'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useCarService, useCreateConversation } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

const TYPE_LABELS: Record<string, string> = {
  MAINTENANCE: 'صيانة وإصلاح', CLEANING: 'تلميع وتنظيف', INSPECTION: 'فحص سيارات',
  BODYWORK: 'سمكرة ودهان', TOWING: 'سطحة ونجدة', MODIFICATION: 'تعديل وتيونينج',
  KEYS_LOCKS: 'مفاتيح وأقفال', ACCESSORIES_INSTALL: 'تركيب إكسسوارات', OTHER_SERVICE: 'أخرى',
};
const PROVIDER_LABELS: Record<string, string> = { WORKSHOP: 'ورشة', INDIVIDUAL: 'فرد', MOBILE: 'خدمة متنقلة', COMPANY: 'شركة' };
const DAY_LABELS: Record<string, string> = { SAT: 'السبت', SUN: 'الأحد', MON: 'الإثنين', TUE: 'الثلاثاء', WED: 'الأربعاء', THU: 'الخميس', FRI: 'الجمعة' };

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: svc, isLoading, error } = useCarService(id);
  const [activeImg, setActiveImg] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();

  function handleMessage() {
    requireAuth(async () => {
      if (!svc) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'CAR_SERVICE', entityId: svc.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المحادثة');
      }
    }, 'سجّل الدخول لإرسال رسالة');
  }

  if (isLoading) return <><Navbar /><div className="min-h-screen bg-background"><div className="h-40 bg-gradient-to-bl from-primary via-primary-container to-brand-navy" /><main className="max-w-5xl mx-auto px-4 md:px-8 -mt-16"><ListingSkeleton count={1} /></main></div></>;
  if (error || !svc) return <><Navbar /><div className="min-h-screen bg-background pt-28"><main className="max-w-5xl mx-auto px-4"><ErrorState message="الخدمة غير موجودة" /></main></div><Footer /></>;

  const images = svc.images || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-primary via-primary-container to-brand-navy relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link href="/services" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">home_repair_service</span> خدمات سيارات
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <span className="text-white font-bold">{TYPE_LABELS[svc.serviceType] || svc.serviceType}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Images */}
            <div className="lg:col-span-3">
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="aspect-[16/9] bg-surface-container-low dark:bg-surface-container-high relative">
                  {images[activeImg]?.url ? (
                    <img src={getImageUrl(images[activeImg].url) || ''} alt={svc.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                      <span className="material-symbols-outlined text-7xl">home_repair_service</span>
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-3 overflow-x-auto">
                    {images.map((img, i) => (
                      <button key={img.id} onClick={() => setActiveImg(i)}
                        className={`w-16 h-16 overflow-hidden shrink-0 border-2 transition-all ${i === activeImg ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/20 dark:border-outline-variant/30'}`}>
                        <img src={getImageUrl(img.url) || ''} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {svc.description && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm mt-6">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-black text-on-surface">الوصف</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{svc.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Price */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2.5 py-1 text-[11px] font-black bg-primary/10 dark:bg-primary/20 text-primary">{TYPE_LABELS[svc.serviceType]}</span>
                    <span className="px-2.5 py-1 text-[11px] font-black bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant">{PROVIDER_LABELS[svc.providerType]}</span>
                    {svc.isHomeService && <span className="px-2.5 py-1 text-[11px] font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><span className="material-symbols-outlined text-xs">home</span> متنقلة</span>}
                  </div>
                  <h1 className="text-xl font-black text-on-surface mb-1">{svc.title}</h1>
                  <p className="text-sm text-on-surface-variant mb-4">{svc.providerName}</p>

                  {(svc.priceFrom || svc.priceTo) && (
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-black text-primary">
                        {svc.priceFrom && parseFloat(svc.priceFrom).toFixed(3)}
                        {svc.priceFrom && svc.priceTo && ' - '}
                        {svc.priceTo && parseFloat(svc.priceTo).toFixed(3)}
                      </span>
                      <span className="text-sm text-on-surface-variant">ر.ع.</span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-4 border-t border-outline-variant/10 dark:border-outline-variant/20">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {svc.viewCount}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(svc.createdAt).toLocaleDateString('ar-OM')}</span>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-2.5">
                  {user?.id !== svc.user?.id && (
                    <button onClick={handleMessage} disabled={createConv.isPending}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-on-surface text-surface font-black text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                      <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? 'جاري...' : 'تواصل عبر الشات'}
                    </button>
                  )}
                  {svc.contactPhone && (
                    <a href={`tel:${svc.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary font-black text-sm hover:brightness-110 transition-all">
                      <span className="material-symbols-outlined text-lg">call</span> اتصل
                    </a>
                  )}
                  {svc.whatsapp && (
                    <a href={`https://wa.me/${svc.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                      <span className="material-symbols-outlined text-lg">chat</span> واتساب
                    </a>
                  )}
                  {svc.website && (
                    <a href={svc.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-black text-sm hover:bg-surface-container dark:hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-lg">language</span> زيارة الموقع
                    </a>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">schedule</span>
                  <h3 className="font-black text-on-surface text-sm">أوقات العمل</h3>
                </div>
                <div className="p-6">
                  {svc.workingHoursOpen && svc.workingHoursClose && (
                    <p className="flex items-center gap-2 text-sm mb-3 font-bold text-on-surface">
                      <span className="material-symbols-outlined text-primary text-base">schedule</span>
                      {svc.workingHoursOpen} - {svc.workingHoursClose}
                    </p>
                  )}
                  {svc.workingDays.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {svc.workingDays.map(d => (
                        <span key={d} className="px-3 py-1.5 bg-surface-container-low dark:bg-surface-container-high text-[11px] font-black text-on-surface-variant">{DAY_LABELS[d] || d}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <h3 className="font-black text-on-surface text-sm">الموقع</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">pin_drop</span>
                    {svc.governorate}{svc.city ? ` - ${svc.city}` : ''}
                  </p>
                  {svc.address && <p className="text-xs text-on-surface-variant mt-2 mr-7">{svc.address}</p>}
                  {svc.latitude && svc.longitude && (
                    <div className="mt-4">
                      <MapView latitude={svc.latitude} longitude={svc.longitude} title={svc.title} sellerPhone={svc.contactPhone} />
                    </div>
                  )}
                </div>
              </div>

              {/* User */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  <h3 className="font-black text-on-surface text-sm">مقدم الخدمة</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3">
                    {svc.user.avatarUrl ? (
                      <img src={getImageUrl(svc.user.avatarUrl) || ''} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-black text-lg shrink-0">
                        {(svc.user.displayName || svc.user.username)?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-black text-on-surface text-sm">{svc.user.displayName || svc.user.username}</p>
                      {svc.user.isVerified && <span className="text-[11px] text-primary font-black flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">verified</span> موثّق</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
