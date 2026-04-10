'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useTransportService, useCreateConversation } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

const TYPE_LABELS: Record<string, string> = {
  CARGO: 'نقل بضائع', FURNITURE: 'نقل أثاث', DELIVERY: 'توصيل طرود',
  HEAVY_TRANSPORT: 'نقل ثقيل', TRUCK_RENTAL: 'تأجير شاحنات', OTHER_TRANSPORT: 'أخرى',
};
const PRICING_LABELS: Record<string, string> = { FIXED: 'سعر ثابت', PER_KM: 'لكل كم', PER_TRIP: 'لكل رحلة', HOURLY: 'بالساعة', NEGOTIABLE_PRICE: 'قابل للتفاوض' };

export default function TransportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: item, isLoading, error } = useTransportService(id);
  const [activeImg, setActiveImg] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();

  function handleMessage() {
    requireAuth(async () => {
      if (!item) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'TRANSPORT', entityId: item.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المحادثة');
      }
    }, 'سجّل الدخول لإرسال رسالة');
  }

  if (isLoading) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ListingSkeleton count={1} /></main></>;
  if (error || !item) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ErrorState message="خدمة النقل غير موجودة" /></main><Footer /></>;

  const images = item.images || [];

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4 md:px-8" dir="rtl">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/transport" className="hover:text-primary">خدمات النقل</Link>
          <span>›</span>
          <span className="text-on-surface font-bold">{TYPE_LABELS[item.transportType] || item.transportType}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="aspect-[16/9] bg-surface-container-low relative">
                {images[activeImg]?.url ? (
                  <img src={getImageUrl(images[activeImg].url) || ''} alt={item.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30"><span className="material-symbols-outlined text-7xl">local_shipping</span></div>
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

            {item.description && (
              <div className="glass-card rounded-xl p-6 mt-4">
                <h2 className="font-bold text-lg mb-3">الوصف</h2>
                <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{item.description}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-600 text-white">{TYPE_LABELS[item.transportType]}</span>
                {item.hasInsurance && <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-600 text-white flex items-center gap-1"><span className="material-symbols-outlined text-xs">shield</span> تأمين</span>}
                {item.hasTracking && <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500 text-white flex items-center gap-1"><span className="material-symbols-outlined text-xs">my_location</span> تتبع</span>}
              </div>
              <h1 className="text-xl font-black text-on-surface mb-1">{item.title}</h1>
              <p className="text-sm text-on-surface-variant mb-4">{item.providerName}</p>

              <div className="space-y-2 text-sm mb-4">
                {item.basePrice && (
                  <div className="flex justify-between"><span className="text-on-surface-variant">السعر الأساسي</span><span className="font-black text-primary">{parseFloat(item.basePrice).toFixed(3)} ر.ع.</span></div>
                )}
                {item.pricePerKm && (
                  <div className="flex justify-between"><span className="text-on-surface-variant">سعر الكيلومتر</span><span className="font-bold">{parseFloat(item.pricePerKm).toFixed(3)} ر.ع.</span></div>
                )}
                <div className="flex justify-between"><span className="text-on-surface-variant">نوع التسعير</span><span className="font-bold">{PRICING_LABELS[item.pricingType] || item.pricingType}</span></div>
                {item.vehicleType && <div className="flex justify-between"><span className="text-on-surface-variant">نوع المركبة</span><span className="font-bold">{item.vehicleType}</span></div>}
                {item.vehicleCapacity && <div className="flex justify-between"><span className="text-on-surface-variant">سعة الحمولة</span><span className="font-bold">{item.vehicleCapacity}</span></div>}
              </div>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {item.viewCount}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(item.createdAt).toLocaleDateString('ar-OM')}</span>
              </div>

              <div className="space-y-2">
                {user?.id !== item.user?.id && (
                  <button onClick={handleMessage} disabled={createConv.isPending}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-on-surface text-surface rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                    <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? 'جاري...' : 'تواصل عبر الشات'}
                  </button>
                )}
                {item.contactPhone && (
                  <a href={`tel:${item.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white rounded-lg font-bold text-sm"><span className="material-symbols-outlined text-lg">call</span> اتصل</a>
                )}
                {item.whatsapp && (
                  <a href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-lg font-bold text-sm hover:bg-[#25D366]/90 transition-colors">واتساب</a>
                )}
              </div>
            </div>

            <div className="glass-card rounded-xl p-5">
              <h2 className="font-bold text-sm mb-3">الموقع</h2>
              <p className="text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base text-on-surface-variant">location_on</span> {item.governorate}{item.city ? ` - ${item.city}` : ''}</p>
              {item.latitude && item.longitude && (
                <div className="mt-3">
                  <MapView latitude={item.latitude} longitude={item.longitude} title={item.title} sellerPhone={item.contactPhone} />
                </div>
              )}
            </div>

            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                {item.user.avatarUrl ? (
                  <img src={getImageUrl(item.user.avatarUrl) || ''} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {(item.user.displayName || item.user.username)?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{item.user.displayName || item.user.username}</p>
                  {item.user.isVerified && <span className="text-[11px] text-primary font-bold">موثّق ✓</span>}
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
