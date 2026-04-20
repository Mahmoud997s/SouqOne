'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useBusListing } from '@/lib/api/buses';
import { useAuth } from '@/providers/auth-provider';
import { useAuthModal } from '@/providers/auth-modal-provider';
import { useCreateConversation } from '@/lib/api';
import { BookingCard } from '@/components/booking-card';
import { useToast } from '@/components/toast';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations, useLocale } from 'next-intl';
import { fuelLabels, transmissionLabels, conditionLabels } from '@/lib/constants/mappings';
import { relativeTimeT } from '@/lib/time-utils';

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
      <span className="material-symbols-outlined text-7xl text-on-surface-variant/30">directions_bus</span>
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
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">directions_bus</span>
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

const TYPE_COLORS: Record<string, string> = {
  BUS_SALE: 'bg-blue-600', BUS_SALE_WITH_CONTRACT: 'bg-emerald-600',
  BUS_RENT: 'bg-violet-600', BUS_CONTRACT: 'bg-orange-600',
};

export default function BusDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: bus, isLoading, error } = useBusListing(id);
  const router = useRouter();
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const { addToast } = useToast();
  const createConv = useCreateConversation();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const tt = useTranslations('time');
  const locale = useLocale();
  const FUEL_MAP = fuelLabels(tm);
  const TRANS_MAP = transmissionLabels(tm);
  const COND_MAP = conditionLabels(tm);

  if (isLoading) return <PageSkeleton />;
  if (error || !bus) return (
    <>
      <Navbar />
      <main className="min-h-screen pt-28 max-w-5xl mx-auto px-4 text-center">
        <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">error</span>
        <p className="text-on-surface-variant text-lg mt-4 font-bold">{tp('busDetailNotFound')}</p>
        <Link href="/buses" className="inline-block mt-4 bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-black">{tp('busDetailBackToMarket')}</Link>
      </main>
    </>
  );
  const BUS_TYPE_LABELS: Record<string, string> = {
    MINI_BUS: tp('busesMini'), MEDIUM_BUS: tp('busesMedium'), LARGE_BUS: tp('busesLarge'),
    COASTER: tp('busesCoaster'), SCHOOL_BUS: tp('busesSchool'),
  };
  const TYPE_LABELS: Record<string, string> = {
    BUS_SALE: tp('busesTypeSale'), BUS_SALE_WITH_CONTRACT: tp('busesTypeSaleContract'),
    BUS_RENT: tp('busesTypeRent'), BUS_CONTRACT: tp('busesTypeContract'),
  };
  const CONTRACT_MAP: Record<string, string> = {
    SCHOOL: tp('busDetailContractSchool'), COMPANY: tp('busDetailContractCompany'),
    GOVERNMENT: tp('busDetailContractGov'), TOURISM: tp('busDetailContractTourism'), OTHER_CONTRACT: tp('busDetailContractOther'),
  };

  const isOwner = user?.id === bus.userId;
  const isContract = bus.busListingType === 'BUS_CONTRACT';
  const hasContract = bus.busListingType === 'BUS_SALE_WITH_CONTRACT';
  const isRent = bus.busListingType === 'BUS_RENT';
  const sellerName = bus.user.displayName || bus.user.username;
  const images: ImgItem[] = (bus.images ?? []).map(img => ({ id: img.id, url: img.url })).filter(i => i.url);

  async function handleMessage() {
    if (!user) { openAuth('login', { message: tp('busDetailLoginToMessage') }); return; }
    try {
      const conv = await createConv.mutateAsync({ entityType: 'BUS_LISTING', entityId: bus!.id });
      router.push(`/messages/${conv.id}`);
    } catch { addToast('error', tp('busDetailErrorConversation')); }
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: bus!.title, url });
    else { navigator.clipboard.writeText(url); addToast('success', tp('carLinkCopied')); }
  }

  return (
    <>
      <Navbar />
      {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}

      <div className="bg-background min-h-screen">
        <main className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-28 lg:pb-16">

          {/* ══ TOP BAR ══ */}
          <div className="flex items-center justify-between mb-5">
            <nav className="flex items-center gap-1 text-[12px] text-on-surface-variant flex-wrap">
              <Link href="/" className="text-primary hover:underline">{tp('busDetailHome')}</Link>
              <span className="mx-0.5">›</span>
              <Link href="/buses" className="text-primary hover:underline">{tp('busDetailBuses')}</Link>
              <span className="mx-0.5">›</span>
              <span className="truncate max-w-[160px]">{TYPE_LABELS[bus.busListingType]}</span>
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
              <span className={`px-3 py-0.5 rounded-full text-[11px] font-medium text-white ${TYPE_COLORS[bus.busListingType] || 'bg-primary'}`}>
                {TYPE_LABELS[bus.busListingType]}
              </span>
              {!isContract && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                  {BUS_TYPE_LABELS[bus.busType]} · {tp('busDetailCapacity', { count: bus.capacity })}
                </span>
              )}
              {bus.isPriceNegotiable && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300">
                  {tp('busDetailNegotiable')}
                </span>
              )}
            </div>
            <h1 className="text-[24px] font-bold text-on-surface mb-1 leading-tight">{bus.title}</h1>
            <div className="flex items-center gap-2 flex-wrap text-[12px] text-on-surface-variant">
              {bus.user.governorate && <span>{bus.user.governorate}، عُمان</span>}
              {bus.viewCount > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span>{bus.viewCount} مشاهدة</span>
                </>
              )}
              <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
              <span>{relativeTimeT(bus.createdAt, tt, locale)}</span>
            </div>
          </div>

          {/* ══ Mobile Swiper ══ */}
          {!isContract && (
            <div className="md:hidden -mx-4 mb-5">
              <MobileSwiper images={images} title={bus.title} onOpen={setLightboxIdx} />
            </div>
          )}

          {/* ══ PHOTO GRID ══ */}
          {!isContract && (
            <div className="mb-8">
              <PhotoGrid images={images} title={bus.title} onOpen={setLightboxIdx} />
            </div>
          )}

          {/* ══ TWO-COLUMN ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

            {/* LEFT */}
            <div>
              {/* Seller Row */}
              <div className="flex items-center gap-3 py-1 pb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  {bus.user.avatarUrl ? (
                    <Image src={getImageUrl(bus.user.avatarUrl) || ''} alt={sellerName} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <span className="text-white font-black text-lg">{sellerName[0]?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-on-surface">{sellerName}</p>
                  <div className="flex items-center gap-2 flex-wrap mt-0.5">
                    {bus.user.governorate && <span className="text-[11px] text-on-surface-variant">{bus.user.governorate}</span>}
                    {bus.user.createdAt && (
                      <span className="text-[11px] text-on-surface-variant flex items-center gap-0.5">
                        <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
                        {tp('busDetailMemberSince')} {new Date(bus.user.createdAt).toLocaleDateString('ar-OM', { year: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-[2px] w-50 rounded-full bg-primary mt-1 mx-auto" />
              <Divider />

              {/* Specs */}
              {!isContract && (
                <>
                  <SectionTitle>{tp('busDetailSpecs')}</SectionTitle>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
                    {[
                      { icon: 'directions_bus', label: tp('busDetailType'), value: BUS_TYPE_LABELS[bus.busType] },
                      { icon: 'factory', label: tp('busDetailMake'), value: bus.make },
                      { icon: 'badge', label: tp('busDetailModel'), value: bus.model },
                      { icon: 'calendar_month', label: tp('busDetailYear'), value: bus.year },
                      { icon: 'groups', label: tp('busDetailCapacityLabel'), value: tp('busDetailCapacity', { count: bus.capacity }) },
                      bus.mileage ? { icon: 'speed', label: tp('busDetailMileage'), value: tp('busDetailMileageKm', { km: bus.mileage.toLocaleString() }) } : null,
                      bus.fuelType ? { icon: 'local_gas_station', label: tp('busDetailFuel'), value: FUEL_MAP[bus.fuelType] } : null,
                      bus.transmission ? { icon: 'settings', label: tp('busDetailTransmission'), value: TRANS_MAP[bus.transmission] } : null,
                      { icon: 'verified', label: tp('busDetailCondition'), value: COND_MAP[bus.condition] || bus.condition },
                      bus.plateNumber ? { icon: 'pin', label: tp('busDetailPlate'), value: bus.plateNumber } : null,
                    ].filter(Boolean).map((s, i) => (
                      <div key={i} className="bg-surface-container-low/60 rounded-xl p-3 border border-outline-variant/10">
                        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] mb-1">
                          <span className="material-symbols-outlined text-primary text-sm">{s!.icon}</span>{s!.label}
                        </div>
                        <p className="font-semibold text-[13px] text-on-surface">{String(s!.value)}</p>
                      </div>
                    ))}
                  </div>
                  <Divider />
                </>
              )}

              {/* Contract Details (for BUS_SALE_WITH_CONTRACT) */}
              {hasContract && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-emerald-200/60 dark:border-emerald-800/30 flex items-center gap-1.5 bg-emerald-100/50 dark:bg-emerald-900/20">
                    <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400 text-base">assignment</span>
                    <h2 className="font-black text-emerald-800 dark:text-emerald-300 text-xs">{tp('busDetailContractAttached')}</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {bus.contractType && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">business</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{tp('busDetailContractType')}</p>
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">{CONTRACT_MAP[bus.contractType] || bus.contractType}</p>
                      </div>
                    )}
                    {bus.contractClient && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">person</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{tp('busDetailContractClient')}</p>
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">{bus.contractClient}</p>
                      </div>
                    )}
                    {bus.contractMonthly && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">payments</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{tp('busDetailContractSalary')}</p>
                        <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">{Number(bus.contractMonthly).toLocaleString()} {tp('busDetailCurrencyOMR')}</p>
                      </div>
                    )}
                    {bus.contractDuration && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">event</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{tp('busDetailContractDuration')}</p>
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">{tp('busDetailContractMonths', { months: bus.contractDuration })}</p>
                      </div>
                    )}
                    {bus.contractExpiry && (
                      <div className="text-center">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-lg block mb-0.5">event_busy</span>
                        <p className="text-[9px] text-emerald-600 dark:text-emerald-400">{tp('busDetailContractExpiry')}</p>
                        <p className="text-xs font-black text-emerald-800 dark:text-emerald-200">{new Date(bus.contractExpiry).toLocaleDateString('ar-OM')}</p>
                      </div>
                    )}
                  </div>
                  {bus.contractMonthly && bus.price && (() => {
                    const price = Number(bus.price);
                    const monthly = Number(bus.contractMonthly);
                    const duration = bus.contractDuration || 36;
                    const totalRevenue = monthly * duration;
                    const netProfit = totalRevenue - price;
                    const roiPercent = ((netProfit / price) * 100).toFixed(1);
                    const paybackMonths = Math.ceil(price / monthly);
                    const isPositive = netProfit > 0;

                    return (
                      <div className="px-4 pb-4">
                        <div className="bg-emerald-100/80 dark:bg-emerald-900/30 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="material-symbols-outlined text-emerald-700 dark:text-emerald-400 text-base">trending_up</span>
                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">{tp('busDetailROISection')}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-2.5 text-center">
                              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">{tp('busDetailROIMonthlyIncome')}</p>
                              <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">{monthly.toLocaleString('en-US')} <span className="text-[9px] font-bold">{tp('busDetailCurrencyOMR')}</span></p>
                            </div>
                            <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-2.5 text-center">
                              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">{tp('busDetailROITotalRevenue')}</p>
                              <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">{totalRevenue.toLocaleString('en-US')} <span className="text-[9px] font-bold">{tp('busDetailCurrencyOMR')}</span></p>
                            </div>
                            <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-2.5 text-center">
                              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">{tp('busDetailROINetProfit')}</p>
                              <p className={`text-sm font-black ${isPositive ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-600 dark:text-red-400'}`}>{isPositive ? '+' : ''}{netProfit.toLocaleString('en-US')} <span className="text-[9px] font-bold">{tp('busDetailCurrencyOMR')}</span></p>
                            </div>
                            <div className="bg-white/60 dark:bg-emerald-950/40 rounded-lg p-2.5 text-center">
                              <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">{tp('busDetailROIPayback')}</p>
                              <p className="text-sm font-black text-emerald-800 dark:text-emerald-200">{tp('busDetailROIPaybackMonths', { months: paybackMonths })}</p>
                            </div>
                          </div>

                          <div className={`rounded-lg p-3 flex items-center justify-between ${isPositive ? 'bg-emerald-200/60 dark:bg-emerald-800/30' : 'bg-red-100 dark:bg-red-900/20'}`}>
                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">{tp('busDetailROIPercentage')}</span>
                            <span className={`text-lg font-black ${isPositive ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-600 dark:text-red-400'}`}>{roiPercent}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Contract Request Details */}
              {isContract && (
                <div className="bg-orange-50 dark:bg-orange-950/30 rounded-2xl border border-orange-200 dark:border-orange-800/40 overflow-hidden">
                  <div className="px-4 py-3 border-b border-orange-200/60 dark:border-orange-800/30 flex items-center gap-1.5 bg-orange-100/50 dark:bg-orange-900/20">
                    <span className="material-symbols-outlined text-orange-700 dark:text-orange-400 text-base">request_quote</span>
                    <h2 className="font-black text-orange-800 dark:text-orange-300 text-xs">{tp('busDetailRequestDetails')}</h2>
                  </div>
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {bus.requestPassengers && (
                      <div className="bg-white dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-100 dark:border-orange-800/20">
                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-lg block mb-0.5">groups</span>
                        <p className="text-[9px] text-orange-500">{tp('busDetailPassengers')}</p>
                        <p className="text-sm font-black text-orange-800 dark:text-orange-200">{bus.requestPassengers}</p>
                      </div>
                    )}
                    {bus.requestSchedule && (
                      <div className="bg-white dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-100 dark:border-orange-800/20">
                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-lg block mb-0.5">schedule</span>
                        <p className="text-[9px] text-orange-500">{tp('busDetailSchedule')}</p>
                        <p className="text-xs font-black text-orange-800 dark:text-orange-200">{bus.requestSchedule}</p>
                      </div>
                    )}
                    {bus.requestRoute && (
                      <div className="bg-white dark:bg-orange-900/20 rounded-lg p-3 text-center border border-orange-100 dark:border-orange-800/20 sm:col-span-1 col-span-2">
                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-lg block mb-0.5">route</span>
                        <p className="text-[9px] text-orange-500">{tp('busDetailRoute')}</p>
                        <p className="text-xs font-black text-orange-800 dark:text-orange-200">{bus.requestRoute}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Features */}
              {bus.features.length > 0 && (
                <>
                  <SectionTitle>{tp('busDetailFeatures')}</SectionTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {bus.features.map(f => (
                      <span key={f} className="bg-primary/5 dark:bg-primary/10 text-primary text-[12px] font-medium px-3 py-1.5 rounded-full border border-primary/15 flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>{f}
                      </span>
                    ))}
                  </div>
                  <Divider />
                </>
              )}

              {/* Description */}
              {bus.description && (
                <>
                  <SectionTitle>{tp('busDetailDescription')}</SectionTitle>
                  <ExpandableText text={bus.description} />
                </>
              )}

              {/* Location */}
              {(bus.governorate || bus.city) && (
                <>
                  <Divider />
                  <SectionTitle>{tp('busDetailLocation')}</SectionTitle>
                  <p className="text-[13px] text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    {bus.governorate}{bus.city ? `، ${bus.city}` : ''}، عُمان
                  </p>
                </>
              )}
            </div>

            {/* RIGHT — Contact Card */}
            <div className="hidden lg:block sticky top-20">
              <div className="border border-outline-variant/20 rounded-2xl p-5 shadow-sm bg-surface-container-lowest">
                {/* Sale price */}
                {(bus.busListingType === 'BUS_SALE' || hasContract) && bus.price && (
                  <div className="mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[22px] font-bold text-on-surface">{Number(bus.price).toLocaleString('en-US')}</span>
                      <span className="text-[13px] text-on-surface-variant">{tp('busDetailCurrencyOMR')}</span>
                    </div>
                    {bus.isPriceNegotiable && <p className="text-[11px] text-primary mt-0.5">{tp('busDetailNegotiable')}</p>}
                  </div>
                )}
                {/* Contract income */}
                {hasContract && bus.contractMonthly && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-3 mb-3">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="material-symbols-outlined text-emerald-600 text-sm">trending_up</span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">{tp('busDetailContractIncome')}</span>
                    </div>
                    <p className="text-[15px] font-bold text-emerald-700 dark:text-emerald-300">{Number(bus.contractMonthly).toLocaleString()} <span className="text-[10px] font-normal">{tp('busDetailPerMonth')}</span></p>
                  </div>
                )}
                {/* Rental prices */}
                {isRent && (
                  <div className="space-y-1.5 mb-3">
                    {bus.dailyPrice && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-[12px] text-on-surface-variant">{tp('busDetailDaily')}</span>
                        <span className="font-bold text-[15px] text-on-surface">{Number(bus.dailyPrice).toLocaleString()} <span className="text-[11px] font-normal text-on-surface-variant">{tp('busDetailCurrencyOMR')}</span></span>
                      </div>
                    )}
                    {bus.monthlyPrice && (
                      <div className="flex justify-between items-baseline">
                        <span className="text-[12px] text-on-surface-variant">{tp('busDetailMonthly')}</span>
                        <span className="font-bold text-[15px] text-on-surface">{Number(bus.monthlyPrice).toLocaleString()} <span className="text-[11px] font-normal text-on-surface-variant">{tp('busDetailCurrencyOMR')}</span></span>
                      </div>
                    )}
                    {/* Rental badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {bus.withDriver && <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-[11px] px-2.5 py-1 rounded-full"><span className="material-symbols-outlined text-xs">person</span>{tp('busDetailWithDriver')}</span>}
                      {bus.deliveryAvailable && <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] px-2.5 py-1 rounded-full"><span className="material-symbols-outlined text-xs">local_shipping</span>{tp('busDetailDelivery')}</span>}
                      {bus.minRentalDays && <span className="inline-flex items-center gap-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[11px] px-2.5 py-1 rounded-full"><span className="material-symbols-outlined text-xs">timer</span>{tp('busDetailMinDuration', { days: bus.minRentalDays })}</span>}
                    </div>
                  </div>
                )}
                {/* Contract type badge */}
                {isContract && (
                  <div className="mb-3">
                    <span className="text-[13px] text-on-surface-variant">تواصل للاستفسار</span>
                  </div>
                )}
                {/* Quick Details */}
                <div className="border border-outline-variant/15 rounded-xl overflow-hidden mb-4 text-[12px]">
                  {[
                    { label: tp('busDetailType'), value: BUS_TYPE_LABELS[bus.busType] },
                    { label: tp('busDetailCondition'), value: COND_MAP[bus.condition] || bus.condition },
                    bus.governorate ? { label: tp('busDetailLocation'), value: bus.governorate } : null,
                    { label: tp('busDetailViews'), value: `${bus.viewCount} ${tp('busDetailViews')}` },
                    bus.createdAt ? { label: 'تاريخ النشر', value: new Date(bus.createdAt).toLocaleDateString('ar-OM', { year: 'numeric', month: 'short', day: 'numeric' }) } : null,
                  ].filter(Boolean).map((row, i, arr) => (
                    <div key={i} className={`flex justify-between px-3 py-2 ${i % 2 === 0 ? 'bg-surface-container-low/40' : ''} ${i < arr.length - 1 ? 'border-b border-outline-variant/10' : ''}`}>
                      <span className="text-on-surface-variant">{row!.label}</span>
                      <span className="font-medium text-on-surface">{String(row!.value)}</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-outline-variant/15 mb-4" />
                {!isOwner ? (
                  <div className="space-y-2.5">
                    <button onClick={handleMessage} disabled={createConv.isPending}
                      className="w-full h-11 rounded-xl bg-primary text-on-primary text-[13px] font-semibold flex items-center justify-center gap-2 hover:brightness-105 transition-all disabled:opacity-60 cursor-pointer">
                      <span className="material-symbols-outlined text-lg">chat</span>
                      {createConv.isPending ? tp('busDetailContactPending') : tp('busDetailContactSeller')}
                    </button>
                    {(bus.contactPhone || bus.user.phone) && (
                      <a href={`tel:${bus.contactPhone || bus.user.phone}`}
                        className="w-full h-11 rounded-xl border border-outline-variant/30 text-on-surface text-[13px] font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined text-lg">call</span>اتصال
                      </a>
                    )}
                    {bus.whatsapp && (
                      <a href={`https://wa.me/${bus.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="w-full h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        واتساب
                      </a>
                    )}
                  </div>
                ) : (
                  <Link href={`/edit-listing/bus/${bus.id}`}
                    className="w-full h-11 rounded-xl bg-on-surface text-surface text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">edit</span>{tp('busDetailEditListing')}
                  </Link>
                )}
                {/* Seller Mini-Card */}
                <div className="pt-4 border-t border-outline-variant/15 mt-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      {bus.user.avatarUrl ? (
                        <Image src={getImageUrl(bus.user.avatarUrl) || ''} alt={sellerName} width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{sellerName[0]?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[13px] font-semibold text-on-surface truncate">{sellerName}</p>
                        {bus.user.isVerified && (
                          <span className="material-symbols-outlined text-primary text-sm flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant">بائع موثّق · {bus.user.governorate || bus.governorate || 'عُمان'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mb-3">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">visibility</span>
                      {bus.viewCount} مشاهدة
                    </span>
                    {bus.createdAt && (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">schedule</span>
                        {relativeTimeT(bus.createdAt, tt, locale)}
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

              {/* Booking Card for BUS_RENT */}
              {isRent && (
                <BookingCard
                  entityType="BUS"
                  entityId={bus.id}
                  title={bus.title}
                  dailyPrice={bus.dailyPrice}
                  monthlyPrice={bus.monthlyPrice}
                  minRentalDays={bus.minRentalDays}
                  currency={bus.currency}
                  isOwner={isOwner}
                  onMessage={handleMessage}
                  isMessagePending={createConv.isPending}
                />
              )}
            </div>

          </div>
        </main>
      </div>

      {/* ══ MOBILE STICKY BAR ══ */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-background/95 backdrop-blur-sm border-t border-outline-variant/30 px-4 py-3 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-baseline gap-1 mb-2">
            {bus.price
              ? <span className="text-[15px] font-semibold text-on-surface">{Number(bus.price).toLocaleString('en-US')} {tp('busDetailCurrencyOMR')}</span>
              : bus.dailyPrice
              ? <span className="text-[15px] font-semibold text-on-surface">{Number(bus.dailyPrice).toLocaleString('en-US')} {tp('busDetailCurrencyOMR')}{tp('busDetailPerDay')}</span>
              : null
            }
          </div>
          <div className="flex gap-2">
            <button onClick={handleMessage} disabled={createConv.isPending}
              className="flex-1 h-10 rounded-xl bg-primary text-on-primary text-[13px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-60">
              <span className="material-symbols-outlined text-base">chat</span>
              {createConv.isPending ? tp('busDetailContactPending') : tp('busDetailContact')}
            </button>
            {bus.contactPhone && (
              <a href={`tel:${bus.contactPhone}`}
                className="h-10 px-4 rounded-xl border border-outline-variant/30 text-on-surface flex items-center justify-center gap-1.5 hover:border-primary hover:text-primary">
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
