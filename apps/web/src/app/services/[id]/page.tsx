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

  if (isLoading) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ListingSkeleton count={1} /></main></>;
  if (error || !svc) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ErrorState message="الخدمة غير موجودة" /></main><Footer /></>;

  const images = svc.images || [];

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4 md:px-8" dir="rtl">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/services" className="hover:text-primary">خدمات سيارات</Link>
          <span>›</span>
          <span className="text-on-surface font-bold">{TYPE_LABELS[svc.serviceType] || svc.serviceType}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="aspect-[16/9] bg-surface-container-low relative">
                {images[activeImg]?.url ? (
                  <img src={getImageUrl(images[activeImg].url) || ''} alt={svc.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30"><span className="text-6xl">🔧</span></div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((img, i) => (
                    <button key={img.id} onClick={() => setActiveImg(i)}
                      className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${i === activeImg ? 'border-primary' : 'border-transparent'}`}>
                      <img src={getImageUrl(img.url) || ''} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {svc.description && (
              <div className="glass-card rounded-xl p-6 mt-4">
                <h2 className="font-bold text-lg mb-3">الوصف</h2>
                <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{svc.description}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white">{TYPE_LABELS[svc.serviceType]}</span>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-surface-container-low text-on-surface-variant">{PROVIDER_LABELS[svc.providerType]}</span>
                {svc.isHomeService && <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-purple-600 text-white flex items-center gap-1"><span className="material-symbols-outlined text-xs">home</span> متنقلة</span>}
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

              <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {svc.viewCount}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(svc.createdAt).toLocaleDateString('ar-OM')}</span>
              </div>

              <div className="space-y-2">
                {user?.id !== svc.user?.id && (
                  <button onClick={handleMessage} disabled={createConv.isPending}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-on-surface text-surface rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                    <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? 'جاري...' : 'تواصل عبر الشات'}
                  </button>
                )}
                {svc.contactPhone && (
                  <a href={`tel:${svc.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-purple-600 text-white rounded-lg font-bold text-sm"><span className="material-symbols-outlined text-lg">call</span> اتصل</a>
                )}
                {svc.whatsapp && (
                  <a href={`https://wa.me/${svc.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-lg font-bold text-sm hover:bg-[#25D366]/90 transition-colors">واتساب</a>
                )}
                {svc.website && (
                  <a href={svc.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-surface-container-low text-on-surface rounded-lg font-bold text-sm"><span className="material-symbols-outlined text-lg">language</span> زيارة الموقع</a>
                )}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-bold text-sm mb-3">أوقات العمل</h2>
              {svc.workingHoursOpen && svc.workingHoursClose && (
                <p className="flex items-center gap-2 text-sm mb-2"><span className="material-symbols-outlined text-base text-on-surface-variant">schedule</span> {svc.workingHoursOpen} - {svc.workingHoursClose}</p>
              )}
              {svc.workingDays.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {svc.workingDays.map(d => (
                    <span key={d} className="px-2.5 py-1 bg-surface-container-low rounded-lg text-[11px] font-bold text-on-surface-variant">{DAY_LABELS[d] || d}</span>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-bold text-sm mb-3">الموقع</h2>
              <p className="text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base text-on-surface-variant">location_on</span> {svc.governorate}{svc.city ? ` - ${svc.city}` : ''}</p>
              {svc.address && <p className="text-xs text-on-surface-variant mt-1">{svc.address}</p>}
              {svc.latitude && svc.longitude && (
                <div className="mt-3">
                  <MapView latitude={svc.latitude} longitude={svc.longitude} title={svc.title} sellerPhone={svc.contactPhone} />
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                {svc.user.avatarUrl ? (
                  <img src={getImageUrl(svc.user.avatarUrl) || ''} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {(svc.user.displayName || svc.user.username)?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{svc.user.displayName || svc.user.username}</p>
                  {svc.user.isVerified && <span className="text-[11px] text-primary font-bold">موثّق ✓</span>}
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
