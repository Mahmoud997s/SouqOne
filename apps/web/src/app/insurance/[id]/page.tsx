'use client';

import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useInsuranceOffer, useCreateConversation } from '@/lib/api';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

const TYPE_LABELS: Record<string, string> = {
  CAR_COMPREHENSIVE: 'تأمين شامل', CAR_THIRD_PARTY: 'ضد الغير', MARINE: 'تأمين بحري',
  HEAVY_EQUIPMENT: 'تأمين معدات', FINANCING: 'تمويل سيارات', LEASING: 'تأجير تمويلي',
};

export default function InsuranceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: offer, isLoading, error } = useInsuranceOffer(id);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();

  function handleMessage() {
    requireAuth(async () => {
      if (!offer) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'INSURANCE', entityId: offer.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المحادثة');
      }
    }, 'سجّل الدخول لإرسال رسالة');
  }

  if (isLoading) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ListingSkeleton count={1} /></main></>;
  if (error || !offer) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ErrorState message="العرض غير موجود" /></main><Footer /></>;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4 md:px-8" dir="rtl">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/insurance" className="hover:text-primary">تأمين وتمويل</Link>
          <span>›</span>
          <span className="text-on-surface font-bold">{TYPE_LABELS[offer.offerType] || offer.offerType}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            {/* Main info */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl">shield</span>
                </div>
                <div>
                  <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-600 text-white mb-1 inline-block">
                    {TYPE_LABELS[offer.offerType]}
                  </span>
                  <p className="text-sm text-on-surface-variant">{offer.providerName}</p>
                </div>
              </div>
              <h1 className="text-xl font-black text-on-surface mb-4">{offer.title}</h1>

              {offer.priceFrom && (
                <div className="bg-primary/5 rounded-xl p-4 mb-4">
                  <p className="text-xs text-on-surface-variant mb-1">يبدأ من</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary">{parseFloat(offer.priceFrom).toFixed(3)}</span>
                    <span className="text-sm text-on-surface-variant">ر.ع.</span>
                  </div>
                </div>
              )}

              {offer.coverageType && (
                <div className="mb-4">
                  <p className="text-xs text-on-surface-variant mb-1">نوع التغطية</p>
                  <p className="font-bold text-sm">{offer.coverageType}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {offer.description && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-bold text-lg mb-3">تفاصيل العرض</h2>
                <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{offer.description}</p>
              </div>
            )}

            {/* Features */}
            {offer.features.length > 0 && (
              <div className="glass-card rounded-xl p-6">
                <h2 className="font-bold text-lg mb-4">المميزات</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {offer.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-3 bg-surface-container-low rounded-lg p-3">
                      <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">check_circle</span>
                      <span className="text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {/* Contact */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="font-bold text-sm mb-4">تواصل مع المزود</h2>
              <div className="space-y-2">
                {user?.id !== offer.user?.id && (
                  <button onClick={handleMessage} disabled={createConv.isPending}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-on-surface text-surface rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                    <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? 'جاري...' : 'تواصل عبر الشات'}
                  </button>
                )}
                {offer.contactPhone && (
                  <a href={`tel:${offer.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm">
                    <span className="material-symbols-outlined text-lg">call</span> اتصل
                  </a>
                )}
                {offer.whatsapp && (
                  <a href={`https://wa.me/${offer.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-lg font-bold text-sm hover:bg-[#25D366]/90 transition-colors">
                    واتساب
                  </a>
                )}
                {offer.website && (
                  <a href={offer.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-surface-container-low text-on-surface rounded-lg font-bold text-sm">
                    <span className="material-symbols-outlined text-lg">language</span> زيارة الموقع
                  </a>
                )}
                {offer.termsUrl && (
                  <a href={offer.termsUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-on-surface-variant text-xs hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-sm">open_in_new</span> الشروط والأحكام
                  </a>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {offer.viewCount} مشاهدة</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(offer.createdAt).toLocaleDateString('ar-OM')}</span>
              </div>
              {offer.governorate && (
                <p className="text-sm flex items-center gap-2 mt-3"><span className="material-symbols-outlined text-base text-on-surface-variant">location_on</span> {offer.governorate}</p>
              )}
              {offer.latitude && offer.longitude && (
                <div className="mt-3">
                  <MapView latitude={offer.latitude} longitude={offer.longitude} title={offer.title} sellerPhone={offer.contactPhone} />
                </div>
              )}
            </div>

            {/* User */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {(offer.user.displayName || offer.user.username)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm">{offer.user.displayName || offer.user.username}</p>
                  {offer.user.isVerified && <span className="text-[11px] text-primary font-bold">موثّق ✓</span>}
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
