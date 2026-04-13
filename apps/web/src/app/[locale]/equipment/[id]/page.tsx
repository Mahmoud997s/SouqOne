'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useEquipmentListing } from '@/lib/api/equipment';
import { useCreateConversation } from '@/lib/api/chat';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/toast';

const EQUIP_TYPE_LABELS: Record<string, string> = {
  EXCAVATOR: 'حفار', CRANE: 'رافعة', LOADER: 'لودر', BULLDOZER: 'بلدوزر', FORKLIFT: 'رافعة شوكية',
  CONCRETE_MIXER: 'خلاطة خرسانة', GENERATOR: 'مولد كهربائي', COMPRESSOR: 'ضاغط هواء',
  SCAFFOLDING: 'سقالات', WELDING_MACHINE: 'ماكينة لحام', TRUCK: 'شاحنة', DUMP_TRUCK: 'قلاب',
  WATER_TANKER: 'صهريج مياه', LIGHT_EQUIPMENT: 'معدات خفيفة', OTHER_EQUIPMENT: 'أخرى',
};

const LISTING_TYPE_LABELS: Record<string, string> = { EQUIPMENT_SALE: 'للبيع', EQUIPMENT_RENT: 'للإيجار' };
const LISTING_TYPE_COLORS: Record<string, string> = { EQUIPMENT_SALE: 'bg-blue-600', EQUIPMENT_RENT: 'bg-violet-600' };
const CONDITION_LABELS: Record<string, string> = { NEW: 'جديد', LIKE_NEW: 'كالجديد', GOOD: 'جيد', USED: 'مستعمل', FAIR: 'مقبول', POOR: 'ضعيف' };

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: eq, isLoading, error } = useEquipmentListing(id);
  const createConv = useCreateConversation();
  const [currentImg, setCurrentImg] = useState(0);

  if (isLoading) return <><Navbar /><div className="pt-28 flex justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div></>;
  if (error || !eq) return <><Navbar /><div className="pt-28 text-center"><p className="text-on-surface-variant">الإعلان غير موجود</p><Link href="/equipment" className="text-primary font-bold mt-4 inline-block">العودة</Link></div></>;

  const images = eq.images ?? [];
  const mainImage = images[currentImg]?.url;
  const isOwner = user?.id === eq.userId;
  const isSale = eq.listingType === 'EQUIPMENT_SALE';

  async function handleChat() {
    if (!user) { addToast('error', 'سجل دخول أولاً'); return; }
    try {
      const conv = await createConv.mutateAsync({ entityType: 'EQUIPMENT_LISTING', entityId: eq!.id });
      router.push(`/chat/${conv.id}`);
    } catch { addToast('error', 'حدث خطأ في بدء المحادثة'); }
  }

  const specs = [
    { label: 'النوع', value: EQUIP_TYPE_LABELS[eq.equipmentType], icon: 'construction' },
    eq.make && { label: 'الماركة', value: eq.make, icon: 'factory' },
    eq.model && { label: 'الموديل', value: eq.model, icon: 'tag' },
    eq.year && { label: 'سنة الصنع', value: String(eq.year), icon: 'calendar_today' },
    { label: 'الحالة', value: CONDITION_LABELS[eq.condition] || eq.condition, icon: 'verified' },
    eq.capacity && { label: 'السعة/الحمولة', value: eq.capacity, icon: 'weight' },
    eq.power && { label: 'القدرة', value: eq.power, icon: 'bolt' },
    eq.weight && { label: 'الوزن', value: eq.weight, icon: 'scale' },
    eq.hoursUsed != null && { label: 'ساعات التشغيل', value: `${eq.hoursUsed.toLocaleString()} ساعة`, icon: 'schedule' },
  ].filter(Boolean) as { label: string; value: string; icon: string }[];

  return (
    <>
      <Navbar />
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none} .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <div className="min-h-screen bg-surface-container-low/30 dark:bg-surface-container-lowest">
        <main className="pt-24 pb-32 lg:pb-16 max-w-6xl mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
            <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <Link href="/equipment" className="hover:text-primary transition-colors">المعدات</Link>
            <span className="material-symbols-outlined text-xs">chevron_left</span>
            <span className="text-on-surface font-bold truncate max-w-[200px]">{eq.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left col */}
            <div className="lg:col-span-8 space-y-4">
              {/* Image gallery */}
              {images.length > 0 && (
                <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10">
                  <div className="relative aspect-[16/10] bg-gray-900">
                    {mainImage ? <Image src={mainImage} alt={eq.title} fill className="object-contain" sizes="(max-width:1024px) 100vw, 66vw" priority /> : (
                      <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-7xl text-white/20">construction</span></div>
                    )}
                    <span className={`absolute top-3 right-3 text-white text-xs font-black px-3 py-1 rounded-lg ${LISTING_TYPE_COLORS[eq.listingType]}`}>{LISTING_TYPE_LABELS[eq.listingType]}</span>
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

              {/* Title + badge */}
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
                <h1 className="text-xl md:text-2xl font-black text-on-surface mb-2">{eq.title}</h1>
                <div className="flex flex-wrap gap-2 mb-3">
                  {eq.withOperator && <span className="text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-xs">person</span>مع مشغل</span>}
                  {eq.deliveryAvailable && <span className="text-[11px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-xs">local_shipping</span>توصيل</span>}
                  {eq.isPriceNegotiable && <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1"><span className="material-symbols-outlined text-xs">handshake</span>قابل للتفاوض</span>}
                </div>
                <p className="text-sm text-on-surface-variant whitespace-pre-line">{eq.description}</p>
              </div>

              {/* Specs */}
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
                <h2 className="font-black text-base text-on-surface mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-primary">settings</span>المواصفات</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map(s => (
                    <div key={s.label} className="bg-surface-container-low/50 dark:bg-surface-container-high/30 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] mb-1"><span className="material-symbols-outlined text-xs">{s.icon}</span>{s.label}</div>
                      <p className="font-bold text-sm text-on-surface">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              {eq.governorate && (
                <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
                  <h2 className="font-black text-base text-on-surface mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-primary">location_on</span>الموقع</h2>
                  <p className="text-sm text-on-surface-variant">{eq.governorate}{eq.city ? ` - ${eq.city}` : ''}</p>
                </div>
              )}
            </div>

            {/* Right col (sticky) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-28 lg:self-start">
              {/* Price card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
                <h2 className="font-black text-base text-on-surface mb-3">السعر</h2>
                {isSale ? (
                  <p className="text-2xl font-black text-primary">{eq.price ? `${Number(eq.price).toLocaleString()} ${eq.currency}` : 'اتصل للسعر'}</p>
                ) : (
                  <div className="space-y-2">
                    {eq.dailyPrice && <div className="flex justify-between"><span className="text-sm text-on-surface-variant">يومي</span><span className="font-black text-primary">{Number(eq.dailyPrice).toLocaleString()} {eq.currency}</span></div>}
                    {eq.weeklyPrice && <div className="flex justify-between"><span className="text-sm text-on-surface-variant">أسبوعي</span><span className="font-black text-primary">{Number(eq.weeklyPrice).toLocaleString()} {eq.currency}</span></div>}
                    {eq.monthlyPrice && <div className="flex justify-between"><span className="text-sm text-on-surface-variant">شهري</span><span className="font-black text-primary">{Number(eq.monthlyPrice).toLocaleString()} {eq.currency}</span></div>}
                    {eq.minRentalDays && <p className="text-[11px] text-on-surface-variant mt-1">أقل مدة إيجار: {eq.minRentalDays} يوم</p>}
                  </div>
                )}
              </div>

              {/* CTA */}
              {!isOwner && (
                <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10 space-y-3">
                  <button onClick={handleChat} className="w-full bg-primary text-on-primary py-3 rounded-xl font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-base">chat</span>تواصل مع المعلن
                  </button>
                  {eq.contactPhone && (
                    <a href={`tel:${eq.contactPhone}`} className="w-full bg-primary text-on-primary py-3 rounded-xl font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">call</span>{eq.contactPhone}
                    </a>
                  )}
                  {eq.whatsapp && (
                    <a href={`https://wa.me/${eq.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="w-full bg-green-600 text-white py-3 rounded-xl font-black text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">chat_bubble</span>واتساب
                    </a>
                  )}
                </div>
              )}

              {/* Seller card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10">
                <h2 className="font-black text-sm text-on-surface mb-3">المعلن</h2>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                    {eq.user.avatarUrl ? <Image src={eq.user.avatarUrl} alt="" width={44} height={44} className="rounded-full object-cover" /> : <span className="material-symbols-outlined text-primary">person</span>}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-on-surface">{eq.user.displayName || eq.user.username}</p>
                    {eq.user.governorate && <p className="text-[11px] text-on-surface-variant">{eq.user.governorate}</p>}
                  </div>
                  {eq.user.isVerified && <span className="material-symbols-outlined text-primary text-base mr-auto">verified</span>}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-on-surface-variant px-2">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span>{eq.viewCount} مشاهدة</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span>{new Date(eq.createdAt).toLocaleDateString('ar-OM')}</span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sticky CTA */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 bg-surface-container-lowest/95 dark:bg-surface-container/95 backdrop-blur-md border-t border-outline-variant/10 lg:hidden z-40">
          <div className="flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-primary font-black text-base truncate">
                {isSale ? (eq.price ? `${Number(eq.price).toLocaleString()} ${eq.currency}` : 'اتصل') : (eq.dailyPrice ? `${Number(eq.dailyPrice).toLocaleString()}/يوم` : 'اتصل')}
              </p>
            </div>
            <button onClick={handleChat} className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-black text-sm flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">chat</span>تواصل
            </button>
            {eq.contactPhone && (
              <a href={`tel:${eq.contactPhone}`} className="bg-primary/10 text-primary px-4 py-2.5 rounded-xl hover:bg-primary hover:text-on-primary transition-all">
                <span className="material-symbols-outlined text-base">call</span>
              </a>
            )}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
