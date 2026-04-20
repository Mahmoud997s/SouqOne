'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useEquipmentListing } from '@/lib/api/equipment';
import { useCreateConversation } from '@/lib/api/chat';
import { BookingCard } from '@/components/booking-card';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/toast';
import { useTranslations } from 'next-intl';
import { getImageUrl } from '@/lib/image-utils';

interface ImgItem { id: string; url: string }

function Lightbox({ images, startIndex, onClose }: { images: ImgItem[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') next();
      if (e.key === 'ArrowRight') prev();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose, prev, next]);
  return (
    <div className="fixed inset-0 z-[9999] bg-[#060e1e] flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/10">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-white/80 text-xl">close</span>
        </button>
        <span className="text-white/60 text-sm font-bold tracking-wider">{idx + 1} / {images.length}</span>
        <div className="w-10" />
      </div>
      <div className="flex-1 relative min-h-0">
        <Image src={images[idx].url} alt={`صورة ${idx + 1}`} fill className="object-contain" sizes="100vw" />
      </div>
      <button onClick={prev} className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors">
        <span className="material-symbols-outlined text-white text-2xl">chevron_right</span>
      </button>
      <button onClick={next} className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors">
        <span className="material-symbols-outlined text-white text-2xl">chevron_left</span>
      </button>
      <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar justify-center border-t border-white/10">
        {images.map((img, i) => (
          <button key={img.id} onClick={() => setIdx(i)} className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === idx ? 'border-primary scale-105' : 'border-white/10 opacity-40 hover:opacity-70'}`}>
            <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
          </button>
        ))}
      </div>
    </div>
  );
}

function PhotoGrid({ images, title, onOpen }: { images: ImgItem[]; title: string; onOpen: (i: number) => void }) {
  if (images.length === 0) return (
    <div className="rounded-2xl overflow-hidden bg-surface-container-high hidden md:flex items-center justify-center" style={{ height: 360 }}>
      <span className="material-symbols-outlined text-7xl text-on-surface-variant/30">construction</span>
    </div>
  );
  return (
    <div className="hidden md:block relative">
      <div className="grid gap-1 rounded-2xl overflow-hidden" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '185px 185px' }}>
        <button onClick={() => onOpen(0)} className="relative col-span-1 row-span-2 overflow-hidden group" style={{ gridRow: '1 / 3', gridColumn: '1 / 2' }}>
          <Image src={images[0].url} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="50vw" />
        </button>
        {images.slice(1, 5).map((img, i) => (
          <button key={img.id} onClick={() => onOpen(i + 1)} className="relative overflow-hidden group bg-surface-container">
            <Image src={img.url} alt={`${title} ${i + 2}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="25vw" />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-black text-xl">+{images.length - 5}</span>
              </div>
            )}
          </button>
        ))}
      </div>
      <button onClick={() => onOpen(0)} className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[12px] font-medium text-on-surface shadow-sm hover:bg-white transition-colors cursor-pointer z-10 flex items-center gap-1.5">
        <span className="material-symbols-outlined text-sm">grid_view</span>
        عرض كل الصور ({images.length})
      </button>
    </div>
  );
}

function MobileSwiper({ images, title, onOpen }: { images: ImgItem[]; title: string; onOpen: (i: number) => void }) {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef(0);
  function handleTouchStart(e: React.TouchEvent) { touchStart.current = e.changedTouches[0].clientX; }
  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setIdx(i => Math.min(i + 1, images.length - 1));
      else setIdx(i => Math.max(i - 1, 0));
    }
  }
  if (images.length === 0) return (
    <div className="md:hidden h-64 bg-surface-container-low flex items-center justify-center">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">construction</span>
    </div>
  );
  return (
    <div className="md:hidden relative h-64 overflow-hidden bg-black" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Image src={images[idx].url} alt={title} fill className="object-cover" sizes="100vw" />
      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">{idx + 1} / {images.length}</div>
      <button onClick={() => onOpen(idx)} className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
        <span className="material-symbols-outlined text-sm">grid_view</span>الكل
      </button>
      {images.length > 1 && (
        <div className="absolute bottom-10 inset-x-0 flex justify-center gap-1">
          {images.slice(0, 8).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function Divider() { return <div className="my-6" />; }
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-on-surface tracking-tight">{children}</h2>
      <div className="mt-1 h-[3px] w-8 rounded-full bg-primary" />
    </div>
  );
}
function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 260;
  return (
    <div>
      <p className={`text-[13px] text-on-surface-variant leading-relaxed whitespace-pre-line ${!expanded && isLong ? 'line-clamp-3' : ''}`}>{text}</p>
      {isLong && (
        <button onClick={() => setExpanded(e => !e)} className="text-[12px] text-primary font-medium mt-2 cursor-pointer hover:underline block w-full text-center">
          {expanded ? 'إخفاء' : 'عرض المزيد'}
        </button>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-16 animate-pulse">
        <div className="h-4 w-48 bg-surface-container-high rounded mb-4" />
        <div className="h-6 w-2/3 bg-surface-container-high rounded mb-2" />
        <div className="rounded-2xl bg-surface-container-high mb-6" style={{ height: 360 }} />
        <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 300px' }}>
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-4 bg-surface-container-high rounded" />)}</div>
          <div className="h-56 bg-surface-container-high rounded-2xl" />
        </div>
      </div>
    </>
  );
}

export default function EquipmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { data: eq, isLoading, error } = useEquipmentListing(id);
  const createConv = useCreateConversation();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const tp = useTranslations('pages');
  const EQUIP_TYPE_LABELS: Record<string, string> = {
    EXCAVATOR: tp('equipDetailExcavator'), CRANE: tp('equipDetailCrane'), LOADER: tp('equipDetailLoader'), BULLDOZER: tp('equipDetailBulldozer'), FORKLIFT: tp('equipDetailForklift'),
    CONCRETE_MIXER: tp('equipDetailConcreteMixer'), GENERATOR: tp('equipDetailGenerator'), COMPRESSOR: tp('equipDetailCompressor'),
    SCAFFOLDING: tp('equipDetailScaffolding'), WELDING_MACHINE: tp('equipDetailWeldingMachine'), TRUCK: tp('equipDetailTruck'), DUMP_TRUCK: tp('equipDetailDumpTruck'),
    WATER_TANKER: tp('equipDetailWaterTanker'), LIGHT_EQUIPMENT: tp('equipDetailLightEquipment'), OTHER_EQUIPMENT: tp('equipDetailOther'),
  };
  const LISTING_TYPE_LABELS: Record<string, string> = { EQUIPMENT_SALE: tp('equipDetailSale'), EQUIPMENT_RENT: tp('equipDetailRent') };
  const CONDITION_LABELS: Record<string, string> = { NEW: tp('equipDetailCondNew'), LIKE_NEW: tp('equipDetailCondLikeNew'), GOOD: tp('equipDetailCondGood'), USED: tp('equipDetailCondUsed'), FAIR: tp('equipDetailCondFair'), POOR: tp('equipDetailCondPoor') };

  if (isLoading) return <PageSkeleton />;
  if (error || !eq) return <><Navbar /><div className="min-h-screen pt-28 text-center"><p className="text-on-surface-variant">{tp('equipDetailNotFound')}</p><Link href="/equipment" className="text-primary font-bold mt-4 inline-block">{tp('equipDetailBack')}</Link></div></>;

  const images: ImgItem[] = (eq.images ?? []).map(img => ({ id: img.id, url: getImageUrl(img.url) || img.url })).filter(i => i.url);
  const isOwner = user?.id === eq.userId;
  const isSale = eq.listingType === 'EQUIPMENT_SALE';
  const sellerName = eq.user.displayName || eq.user.username;

  async function handleChat() {
    if (!user) { addToast('error', tp('equipDetailLoginFirst')); return; }
    try {
      const conv = await createConv.mutateAsync({ entityType: 'EQUIPMENT_LISTING', entityId: eq!.id });
      router.push(`/messages/${conv.id}`);
    } catch { addToast('error', tp('equipDetailErrorConversation')); }
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: eq!.title, url });
    else { navigator.clipboard.writeText(url); addToast('success', tp('carLinkCopied')); }
  }

  const specs = [
    { label: tp('equipDetailType'), value: EQUIP_TYPE_LABELS[eq.equipmentType], icon: 'construction' },
    eq.make && { label: tp('equipDetailMake'), value: eq.make, icon: 'factory' },
    eq.model && { label: tp('equipDetailModel'), value: eq.model, icon: 'tag' },
    eq.year && { label: tp('equipDetailYear'), value: String(eq.year), icon: 'calendar_today' },
    { label: tp('equipDetailCondition'), value: CONDITION_LABELS[eq.condition] || eq.condition, icon: 'verified' },
    eq.capacity && { label: tp('equipDetailCapacity'), value: eq.capacity, icon: 'weight' },
    eq.power && { label: tp('equipDetailPower'), value: eq.power, icon: 'bolt' },
    eq.weight && { label: tp('equipDetailWeight'), value: eq.weight, icon: 'scale' },
    eq.hoursUsed != null && { label: tp('equipDetailHours'), value: tp('equipDetailHoursValue', { hours: eq.hoursUsed.toLocaleString() }), icon: 'schedule' },
  ].filter(Boolean) as { label: string; value: string; icon: string }[];

  return (
    <>
      <Navbar />
      {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}

      <div className="bg-background min-h-screen">
        <main className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-28 lg:pb-16">

          {/* ══ TOP BAR ══ */}
          <div className="flex items-center justify-between mb-5">
            <nav className="flex items-center gap-1 text-[12px] text-on-surface-variant flex-wrap">
              <Link href="/" className="text-primary hover:underline">{tp('equipDetailHome')}</Link>
              <span className="mx-0.5">›</span>
              <Link href="/equipment" className="text-primary hover:underline">{tp('equipDetailEquipment')}</Link>
              <span className="mx-0.5">›</span>
              <span className="truncate max-w-[200px]">{eq.title}</span>
            </nav>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleShare} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-outline-variant/40 text-[12px] text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer">
                <span className="material-symbols-outlined text-base">ios_share</span>
                <span className="hidden sm:inline">مشاركة</span>
              </button>
              <button onClick={() => setSaved(s => !s)} className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[12px] transition-all cursor-pointer ${saved ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant/40 text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5'}`}>
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                <span className="hidden sm:inline">{saved ? 'محفوظ' : 'حفظ'}</span>
              </button>
            </div>
          </div>

          {/* ══ TITLE ══ */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`px-3 py-0.5 rounded-full text-[11px] font-medium border ${
                isSale
                  ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
                  : 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800'
              }`}>
                {LISTING_TYPE_LABELS[eq.listingType]}
              </span>
              {eq.withOperator && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">engineering</span>{tp('equipDetailWithOperator')}
                </span>
              )}
              {eq.deliveryAvailable && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">local_shipping</span>{tp('equipDetailDelivery')}
                </span>
              )}
              {eq.isPriceNegotiable && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">handshake</span>{tp('equipDetailNegotiable')}
                </span>
              )}
            </div>
            <h1 className="text-[24px] font-bold text-on-surface mb-1 leading-tight">{eq.title}</h1>
            <div className="flex items-center gap-2 flex-wrap text-[12px] text-on-surface-variant">
              {eq.governorate && <span>{eq.governorate}{eq.city ? `، ${eq.city}` : ''}، عُمان</span>}
              {eq.viewCount > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span>{eq.viewCount} مشاهدة</span>
                </>
              )}
            </div>
          </div>

          {/* ══ Mobile Swiper ══ */}
          <div className="md:hidden -mx-4 mb-5">
            <MobileSwiper images={images} title={eq.title} onOpen={setLightboxIdx} />
          </div>

          {/* ══ PHOTO GRID ══ */}
          <div className="mb-8">
            <PhotoGrid images={images} title={eq.title} onOpen={setLightboxIdx} />
          </div>

          {/* ══ TWO-COLUMN ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

            {/* LEFT */}
            <div>
              {/* Seller Row */}
              <div className="flex items-center gap-3 py-1 pb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  {eq.user.avatarUrl ? (
                    <Image src={getImageUrl(eq.user.avatarUrl) || eq.user.avatarUrl} alt={sellerName} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{sellerName[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface flex items-center gap-1">
                    {sellerName}
                    {eq.user.isVerified && <span className="material-symbols-outlined text-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {eq.user.governorate && <span className="text-[11px] text-on-surface-variant">{eq.user.governorate}</span>}
                    {eq.user.createdAt && (
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
                        عضو منذ {new Date(eq.user.createdAt).toLocaleDateString('ar-OM', { year: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-[2px] w-50 rounded-full bg-primary mt-1 mx-auto" />
              <Divider />

              {/* Description */}
              {eq.description && (
                <>
                  <SectionTitle>وصف الإعلان</SectionTitle>
                  <ExpandableText text={eq.description} />
                  <Divider />
                </>
              )}

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { icon: 'verified', title: 'حالة المعدة', sub: CONDITION_LABELS[eq.condition] || eq.condition, show: true },
                  { icon: eq.deliveryAvailable ? 'local_shipping' : 'location_on', title: eq.deliveryAvailable ? 'توصيل متاح' : 'استلام شخصي', sub: eq.deliveryAvailable ? 'يمكن توصيل المعدة لموقعك' : 'يجب استلام المعدة من موقع المالك', show: true },
                  { icon: 'engineering', title: 'مع مشغّل', sub: 'يشمل مشغّل متخصص', show: !!eq.withOperator },
                  { icon: 'timer', title: 'الحد الأدنى للإيجار', sub: `${eq.minRentalDays} ${eq.minRentalDays === 1 ? 'يوم' : 'أيام'}`, show: !isSale && !!eq.minRentalDays },
                  { icon: 'handshake', title: 'السعر قابل للتفاوض', sub: 'يمكن التفاوض على السعر', show: !!eq.isPriceNegotiable },
                ].filter(h => h.show).map((h, i) => (
                  <div key={i} className="flex items-start gap-4 p-3 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/25 transition-all duration-200">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-lg">{h.icon}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-on-surface">{h.title}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{h.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Divider />

              {/* Specs */}
              <div>
                <SectionTitle>{tp('equipDetailSpecs')}</SectionTitle>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {specs.map(s => (
                    <div key={s.label} className="relative rounded-2xl p-4 text-center overflow-hidden border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 hover:from-primary/8 hover:to-primary/15 transition-all duration-200">
                      <span className="material-symbols-outlined text-primary text-xl mb-1 block">{s.icon}</span>
                      <p className="text-[15px] font-semibold text-on-surface leading-tight">{s.value}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wide">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              {eq.features && eq.features.length > 0 && (
                <>
                  <Divider />
                  <SectionTitle>{tp('equipDetailFeatures')}</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {eq.features.map(f => (
                      <span key={f} className="bg-primary/5 dark:bg-primary/10 text-primary text-[12px] font-medium px-3 py-1.5 rounded-full border border-primary/15 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>{f}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* Location */}
              {eq.governorate && (
                <>
                  <Divider />
                  <div>
                    <SectionTitle>{tp('equipDetailLocation')}</SectionTitle>
                    <p className="text-[12px] text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                      {eq.governorate}{eq.city ? `، ${eq.city}` : ''}، عُمان
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* RIGHT — Contact Card */}
            <div className="hidden lg:block sticky top-20">
              <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                <div className="h-[3px] w-full bg-primary" />
                <div className="p-5">
                  {/* Price */}
                  <div className="mb-4">
                  {isSale ? (
                    eq.price ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[22px] font-bold text-on-surface">{Number(eq.price).toLocaleString()}</span>
                        <span className="text-[13px] text-on-surface-variant">{eq.currency}</span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-on-surface-variant">{tp('equipDetailCallForPrice')}</span>
                    )
                  ) : (
                    <div className="space-y-1.5">
                      {eq.dailyPrice && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-[12px] text-on-surface-variant">{tp('equipDetailDaily')}</span>
                          <span className="font-bold text-[15px] text-on-surface">{Number(eq.dailyPrice).toLocaleString()} <span className="text-[11px] text-on-surface-variant font-normal">{eq.currency}</span></span>
                        </div>
                      )}
                      {eq.weeklyPrice && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-[12px] text-on-surface-variant">{tp('equipDetailWeekly')}</span>
                          <span className="font-bold text-[15px] text-on-surface">{Number(eq.weeklyPrice).toLocaleString()} <span className="text-[11px] text-on-surface-variant font-normal">{eq.currency}</span></span>
                        </div>
                      )}
                      {eq.monthlyPrice && (
                        <div className="flex justify-between items-baseline">
                          <span className="text-[12px] text-on-surface-variant">{tp('equipDetailMonthly')}</span>
                          <span className="font-bold text-[15px] text-on-surface">{Number(eq.monthlyPrice).toLocaleString()} <span className="text-[11px] text-on-surface-variant font-normal">{eq.currency}</span></span>
                        </div>
                      )}
                      {eq.minRentalDays && <p className="text-[11px] text-on-surface-variant pt-1">{tp('equipDetailMinRental', { days: eq.minRentalDays })}</p>}
                    </div>
                  )}
                </div>
                  {/* Quick Details */}
                  <div className="border border-outline-variant/15 rounded-xl overflow-hidden mb-4 text-[12px]">
                    {[
                      { label: 'النوع', value: LISTING_TYPE_LABELS[eq.listingType] },
                      { label: 'الحالة', value: CONDITION_LABELS[eq.condition] || eq.condition },
                      eq.governorate ? { label: 'المحافظة', value: eq.governorate } : null,
                      { label: 'المشاهدات', value: `${eq.viewCount} مشاهدة` },
                      eq.createdAt ? { label: 'تاريخ النشر', value: new Date(eq.createdAt).toLocaleDateString('ar-OM', { year: 'numeric', month: 'short', day: 'numeric' }) } : null,
                    ].filter(Boolean).map((row, i, arr) => (
                      <div key={i} className={`flex justify-between px-3 py-2 ${i % 2 === 0 ? 'bg-surface-container-low/40' : ''} ${i < arr.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                        <span className="text-on-surface-variant">{row!.label}</span>
                        <span className="font-medium text-on-surface text-left">{row!.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-outline-variant/15 mb-4" />
                  {!isOwner && (
                    <div className="space-y-2.5">
                      <button onClick={handleChat} disabled={createConv.isPending}
                        className="w-full h-12 rounded-xl bg-primary text-on-primary text-[14px] font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-sm shadow-primary/30 disabled:opacity-60 cursor-pointer">
                        <span className="material-symbols-outlined text-lg">chat</span>
                        {createConv.isPending ? 'جاري...' : tp('equipDetailContactSeller')}
                      </button>
                      {(eq.contactPhone || eq.user.phone) && (
                        <a href={`tel:${eq.contactPhone || eq.user.phone}`}
                          className="w-full h-11 rounded-xl border border-outline-variant/30 text-on-surface text-[13px] font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                          <span className="material-symbols-outlined text-lg">call</span>اتصال
                        </a>
                      )}
                      {eq.whatsapp && (
                        <a href={`https://wa.me/${eq.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                          className="w-full h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          واتساب
                        </a>
                      )}
                    </div>
                  )}
                  {isOwner && (
                    <Link href={`/edit-listing/equipment/${eq.id}`}
                      className="w-full h-11 rounded-xl bg-on-surface text-surface text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-colors">
                      <span className="material-symbols-outlined text-lg">edit</span>تعديل الإعلان
                    </Link>
                  )}
                  {/* Seller Mini-Card */}
                  <div className="pt-4 border-t border-outline-variant/15 mt-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 bg-surface-container-high flex items-center justify-center flex-shrink-0">
                        {eq.user.avatarUrl ? (
                          <Image src={getImageUrl(eq.user.avatarUrl) || eq.user.avatarUrl} alt={sellerName} width={40} height={40} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{sellerName[0]?.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-[13px] font-semibold text-on-surface truncate">{sellerName}</p>
                          {eq.user.isVerified && (
                            <span className="material-symbols-outlined text-primary text-sm flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant">{eq.user.isVerified ? 'بائع موثّق' : 'مُعلن'} · {eq.governorate || 'عُمان'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mb-3">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">visibility</span>
                        {eq.viewCount} مشاهدة
                      </span>
                      {eq.createdAt && (
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {(() => { const diff = Date.now() - new Date(eq.createdAt).getTime(); const mins = Math.floor(diff / 60000); const hrs = Math.floor(diff / 3600000); const days = Math.floor(diff / 86400000); return days >= 1 ? `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}` : hrs >= 1 ? `منذ ${hrs} ${hrs === 1 ? 'ساعة' : 'ساعات'}` : `منذ ${mins} دقيقة`; })()}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-emerald-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                        نشط
                      </span>
                    </div>
                    <div className="text-center">
                      <button className="text-[10px] text-on-surface-variant hover:text-error cursor-pointer underline underline-offset-2 transition-colors">
                        الإبلاغ عن هذا الإعلان
                      </button>
                    </div>
                  </div>
                </div>

                {/* Booking Card for EQUIPMENT_RENT */}
                {!isSale && (
                  <BookingCard
                    entityType="EQUIPMENT"
                    entityId={eq.id}
                    title={eq.title}
                    dailyPrice={eq.dailyPrice}
                    weeklyPrice={eq.weeklyPrice}
                    monthlyPrice={eq.monthlyPrice}
                    minRentalDays={eq.minRentalDays}
                    currency={eq.currency}
                    isOwner={isOwner}
                    onMessage={handleChat}
                    isMessagePending={createConv.isPending}
                  />
                )}
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ══ MOBILE STICKY BAR ══ */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-background/95 backdrop-blur-sm border-t border-outline-variant/30 px-4 py-3 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-baseline gap-1 mb-2">
            {isSale
              ? eq.price && <span className="text-[15px] font-semibold text-on-surface">{Number(eq.price).toLocaleString()} {eq.currency}</span>
              : eq.dailyPrice && <span className="text-[15px] font-semibold text-on-surface">{Number(eq.dailyPrice).toLocaleString()} {eq.currency}{tp('equipDetailPerDay')}</span>
            }
          </div>
          <div className="flex gap-2">
            <button onClick={handleChat} disabled={createConv.isPending}
              className="flex-1 h-10 rounded-xl bg-primary text-on-primary text-[13px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-60">
              <span className="material-symbols-outlined text-base">chat</span>
              {createConv.isPending ? 'جاري...' : tp('equipDetailContact')}
            </button>
            {(eq.contactPhone || eq.user.phone) && (
              <a href={`tel:${eq.contactPhone || eq.user.phone}`}
                className="h-10 px-4 rounded-xl border border-outline-variant/30 text-on-surface text-[13px] font-medium flex items-center justify-center gap-1.5 hover:border-primary hover:text-primary">
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
