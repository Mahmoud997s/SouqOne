'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { usePart, useCreateConversation } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

const COND_LABELS: Record<string, string> = { NEW: 'جديد', USED: 'مستعمل', REFURBISHED: 'مجدد' };
const CAT_LABELS: Record<string, string> = { ENGINE: 'محرك', BODY: 'هيكل', ELECTRICAL: 'كهرباء', SUSPENSION: 'تعليق', BRAKES: 'فرامل', INTERIOR: 'داخلية', TIRES: 'إطارات', BATTERIES: 'بطاريات', OILS: 'زيوت', ACCESSORIES: 'إكسسوارات', OTHER: 'أخرى' };

export default function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: part, isLoading, error } = usePart(id);
  const [activeImg, setActiveImg] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();

  function handleMessage() {
    requireAuth(async () => {
      if (!part) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'SPARE_PART', entityId: part.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء المحادثة');
      }
    }, 'سجّل الدخول لإرسال رسالة');
  }

  if (isLoading) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ListingSkeleton count={1} /></main></>;
  if (error || !part) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ErrorState message="قطعة الغيار غير موجودة" /></main><Footer /></>;

  const images = part.images || [];
  const mainImage = images[activeImg]?.url;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4 md:px-8" dir="rtl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-6">
          <Link href="/parts" className="hover:text-primary">قطع غيار</Link>
          <span>›</span>
          <span className="text-on-surface font-bold">{CAT_LABELS[part.partCategory] || part.partCategory}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Images - 3 cols */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-surface-container-low relative">
                {mainImage ? (
                  <img src={getImageUrl(mainImage) || ''} alt={part.title} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30"><span className="text-6xl">🔩</span></div>
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
          </div>

          {/* Info - 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            {/* Price card */}
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${part.condition === 'NEW' ? 'bg-green-500 text-white' : part.condition === 'REFURBISHED' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'}`}>
                  {COND_LABELS[part.condition]}
                </span>
                {part.isOriginal && <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-primary text-white">أصلي OEM</span>}
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-surface-container-low text-on-surface-variant">{CAT_LABELS[part.partCategory]}</span>
              </div>
              <h1 className="text-xl font-black text-on-surface mb-4">{part.title}</h1>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-black text-primary">{parseFloat(part.price).toFixed(3)}</span>
                <span className="text-sm text-on-surface-variant">ر.ع.</span>
                {part.isPriceNegotiable && <span className="text-xs text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-lg">قابل للتفاوض</span>}
              </div>

              <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {part.viewCount} مشاهدة</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(part.createdAt).toLocaleDateString('ar-OM')}</span>
              </div>

              {/* Contact buttons */}
              <div className="space-y-2">
                {user?.id !== part.seller?.id && (
                  <button onClick={handleMessage} disabled={createConv.isPending}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-on-surface text-surface rounded-lg font-bold text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                    <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? 'جاري...' : 'تواصل عبر الشات'}
                  </button>
                )}
                {part.contactPhone && (
                  <a href={`tel:${part.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-on-primary rounded-lg font-bold text-sm">
                    <span className="material-symbols-outlined text-lg">call</span> اتصل بالبائع
                  </a>
                )}
                {part.whatsapp && (
                  <a href={`https://wa.me/${part.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white rounded-lg font-bold text-sm hover:bg-[#25D366]/90 transition-colors">
                    واتساب
                  </a>
                )}
              </div>
            </div>

            {/* Seller card */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-3">
                {part.seller.avatarUrl ? (
                  <img src={getImageUrl(part.seller.avatarUrl) || ''} alt="" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {(part.seller.displayName || part.seller.username)?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{part.seller.displayName || part.seller.username}</p>
                  {part.seller.governorate && <p className="text-xs text-on-surface-variant flex items-center gap-1"><span className="material-symbols-outlined text-xs">location_on</span>{part.seller.governorate}</p>}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="glass-card rounded-xl p-5">
              <h2 className="font-bold text-sm mb-3">تفاصيل القطعة</h2>
              <div className="space-y-2 text-sm">
                {part.partNumber && (
                  <div className="flex justify-between"><span className="text-on-surface-variant">رقم القطعة</span><span className="font-bold">{part.partNumber}</span></div>
                )}
                {part.compatibleMakes.length > 0 && (
                  <div className="flex justify-between"><span className="text-on-surface-variant">الماركات</span><span className="font-bold">{part.compatibleMakes.join(', ')}</span></div>
                )}
                {part.yearFrom && (
                  <div className="flex justify-between"><span className="text-on-surface-variant">السنوات</span><span className="font-bold">{part.yearFrom}{part.yearTo ? ` - ${part.yearTo}` : '+'}</span></div>
                )}
                {part.governorate && (
                  <div className="flex justify-between"><span className="text-on-surface-variant">الموقع</span><span className="font-bold">{part.governorate}{part.city ? ` - ${part.city}` : ''}</span></div>
                )}
              </div>
              {part.latitude && part.longitude && (
                <div className="mt-3">
                  <MapView latitude={part.latitude} longitude={part.longitude} title={part.title} sellerPhone={part.contactPhone} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {part.description && (
          <div className="glass-card rounded-xl p-6 mt-6">
            <h2 className="font-bold text-lg mb-3">الوصف</h2>
            <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{part.description}</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
