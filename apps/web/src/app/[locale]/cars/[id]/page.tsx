'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, BadgePercent } from 'lucide-react';
import { useParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { ErrorState } from '@/components/error-state';
import {
  useListing,
  useListings,
  useCreateConversation,
  useReviewSummary,
} from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import { haversineDistance } from '@/lib/geo-utils';
import { getImageUrl } from '@/lib/image-utils';
import {
  fuelLabels,
  transmissionLabels,
  conditionLabels,
  driveLabels,
  exteriorColors,
  interiorColors,
} from '@/lib/constants/mappings';
import { relativeTimeT } from '@/lib/time-utils';
import { useTranslations, useLocale } from 'next-intl';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ImageItem { id: string; url: string }

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({ images, startIndex, onClose }: { images: ImageItem[]; startIndex: number; onClose: () => void }) {
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

// ─── Photo Grid (Desktop — Airbnb exact) ─────────────────────────────────────

function PhotoGrid({ images, title, onShowAll }: { images: ImageItem[]; title: string; onShowAll: (idx: number) => void }) {
  const filled: ImageItem[] = [...images];
  while (filled.length < 5) filled.push({ id: `ph-${filled.length}`, url: '' });

  const Placeholder = () => (
    <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant">
      <span className="material-symbols-outlined text-4xl opacity-20">directions_car</span>
    </div>
  );

  return (
    <div className="hidden md:block relative">
      <div
        className="grid gap-1 rounded-2xl overflow-hidden"
        style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '185px 185px' }}
      >
        {/* Main large — spans 2 rows */}
        <button
          onClick={() => onShowAll(0)}
          className="relative col-span-1 row-span-2 overflow-hidden"
          style={{ gridRow: '1 / 3', gridColumn: '1 / 2' }}
        >
          {filled[0].url
            ? <Image src={filled[0].url} alt={title} fill className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" sizes="50vw" />
            : <Placeholder />}
        </button>

        {/* 4 small cells */}
        {filled.slice(1, 5).map((img, i) => (
          <button key={img.id} onClick={() => onShowAll(i + 1)} className="relative overflow-hidden group bg-surface-container">
            {img.url
              ? <Image src={img.url} alt={`${title} ${i + 2}`} fill className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" sizes="25vw" />
              : <Placeholder />}
            {/* +N overlay on last cell */}
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-black text-xl">+{images.length - 5}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Show all button */}
      <button
        onClick={() => onShowAll(0)}
        className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[12px] font-medium text-on-surface shadow-sm hover:bg-white transition-colors cursor-pointer z-10 flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">grid_view</span>
        عرض كل الصور ({images.length})
      </button>
    </div>
  );
}

// ─── Mobile Photo Swiper ─────────────────────────────────────────────────────

function MobilePhotoSwiper({ images, title, onShowAll }: { images: ImageItem[]; title: string; onShowAll: (idx: number) => void }) {
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

  if (!images.length) return (
    <div className="md:hidden h-64 bg-surface-container-low flex items-center justify-center">
      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">directions_car</span>
    </div>
  );

  return (
    <div className="md:hidden relative h-64 overflow-hidden bg-black" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Image src={images[idx].url} alt={title} fill className="object-cover" sizes="100vw" />
      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">{idx + 1} / {images.length}</div>
      <button onClick={() => onShowAll(idx)} className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
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

// ─── Section divider ─────────────────────────────────────────────────────────

function Divider() {
  return <div className="my-6" />;
}

// ─── Section heading ─────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-on-surface tracking-tight">{children}</h2>
      <div className="mt-1 h-[3px] w-8 rounded-full bg-primary" />
    </div>
  );
}

// ─── Seller avatar ────────────────────────────────────────────────────────────

function SellerAvatar({ avatarUrl, name, size = 48 }: { avatarUrl?: string | null; name: string; size?: number }) {
  const initial = (name || '?')[0]?.toUpperCase();
  if (avatarUrl) {
    return (
      <div className="relative shrink-0 rounded-full overflow-hidden" style={{ width: size, height: size }}>
        <Image src={getImageUrl(avatarUrl) || ''} alt={name} fill className="object-cover" sizes={`${size}px`} />
      </div>
    );
  }
  return (
    <div
      className="shrink-0 rounded-full bg-primary flex items-center justify-center text-on-primary font-black"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initial}
    </div>
  );
}

// ─── Listing type badge ───────────────────────────────────────────────────────

function ListingBadge({ type }: { type: string }) {
  if (type === 'RENTAL') return <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800">إيجار</span>;
  if (type === 'WANTED') return <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-800 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800">مطلوب</span>;
  return <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">للبيع</span>;
}

// ─── Expandable text ─────────────────────────────────────────────────────────

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

// ─── Color Swatch ─────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, { label: string; hex: string }> = {
  white:            { label: 'أبيض',        hex: '#FFFFFF' },
  pearlWhite:       { label: 'أبيض لؤلؤي',  hex: '#F5F5F0' },
  black:            { label: 'أسود',        hex: '#1A1A1A' },
  obsidianBlack:    { label: 'أسود أوبسيديان', hex: '#0B0B0B' },
  silver:           { label: 'فضي',         hex: '#C0C0C0' },
  gray:             { label: 'رمادي',       hex: '#808080' },
  darkGray:         { label: 'رمادي داكن',  hex: '#505050' },
  mineralGray:      { label: 'رمادي معدني', hex: '#6B6B6B' },
  red:              { label: 'أحمر',        hex: '#CC0000' },
  carmineRed:       { label: 'أحمر قرمزي',  hex: '#960018' },
  burgundy:         { label: 'بردو',        hex: '#722F37' },
  blue:             { label: 'أزرق',        hex: '#1E3A8A' },
  lightBlue:        { label: 'أزرق فاتح',   hex: '#60A5FA' },
  navy:             { label: 'كحلي',        hex: '#1B1F3B' },
  green:            { label: 'أخضر',        hex: '#166534' },
  britishGreen:     { label: 'أخضر بريطاني', hex: '#1B4D3E' },
  oliveGreen:       { label: 'أخضر زيتوني', hex: '#556B2F' },
  beige:            { label: 'بيج',         hex: '#D4C5A9' },
  gold:             { label: 'ذهبي',        hex: '#C9A84C' },
  bronze:           { label: 'برونزي',      hex: '#8C6E46' },
  brown:            { label: 'بني',         hex: '#6B3A2A' },
  orange:           { label: 'برتقالي',     hex: '#EA580C' },
  yellow:           { label: 'أصفر',        hex: '#EAB308' },
  purple:           { label: 'بنفسجي',      hex: '#7C3AED' },
  blackLeather:     { label: 'جلد أسود',    hex: '#1A1A1A' },
  beigeLeather:     { label: 'جلد بيج',     hex: '#D4C5A9' },
  brownLeather:     { label: 'جلد بني',     hex: '#6B3A2A' },
  whiteLeather:     { label: 'جلد أبيض',    hex: '#F5F5F0' },
  redLeather:       { label: 'جلد أحمر',    hex: '#CC0000' },
  cognacLeather:    { label: 'جلد كونياك',  hex: '#9A4E28' },
  napaBlackLeather: { label: 'جلد نابا أسود', hex: '#0B0B0B' },
  grayLeather:      { label: 'جلد رمادي',   hex: '#808080' },
  blackFabric:      { label: 'قماش أسود',   hex: '#2A2A2A' },
  grayFabric:       { label: 'قماش رمادي',  hex: '#909090' },
  beigeFabric:      { label: 'قماش بيج',    hex: '#C8B896' },
};

const LIGHT_COLORS = new Set(['white','pearlWhite','beige','beigeLeather','whiteLeather','beigeFabric']);

function ColorSwatch({ value }: { value: string }) {
  const match = COLOR_MAP[value];
  const label = match?.label ?? value;
  const hex   = match?.hex   ?? '#888888';
  const isLight = LIGHT_COLORS.has(value);
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-block w-4 h-4 rounded-full flex-shrink-0"
        style={{ background: hex, border: `1.5px solid ${isLight ? '#d1d5db' : hex}` }}
      />
      <span>{label}</span>
    </span>
  );
}

// ─── Phone Reveal Button ──────────────────────────────────────────────────────

function maskPhone(phone: string): string {
  const digits = phone.replace(/[^0-9+]/g, '');
  if (digits.length < 6) return phone;
  // keep first 3 chars (e.g. +96) and last 3 digits visible, mask the middle
  const prefix = digits.slice(0, 4);
  const suffix = digits.slice(-3);
  const middleLen = digits.length - 4 - 3;
  const masked = 'X'.repeat(Math.max(middleLen, 0));
  return `${prefix}${masked}${suffix}`;
}

function PhoneRevealButton({ phone }: { phone: string }) {
  const [revealed, setRevealed] = useState(false);
  const clean = phone.replace(/[^0-9+]/g, '');
  const display = revealed ? phone : maskPhone(phone);

  if (revealed) {
    return (
      <a
        href={`tel:${clean}`}
        className="w-full h-12 rounded-xl bg-primary text-on-primary text-[14px] font-medium tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-sm flex items-center justify-center gap-2 dir-ltr"
        dir="ltr"
      >
        <span className="material-symbols-outlined text-base">call</span>
        <span className="font-mono tracking-widest">{display}</span>
      </a>
    );
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      className="w-full h-12 rounded-xl bg-primary text-on-primary text-[14px] font-medium tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-sm flex items-center justify-center gap-2"
    >
      <span className="material-symbols-outlined text-base">call</span>
      <span className="font-mono tracking-widest" dir="ltr">{display}</span>
    </button>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-16 animate-pulse">
        <div className="h-4 w-56 bg-surface-container-high rounded mb-3" />
        <div className="h-6 w-2/3 bg-surface-container-high rounded mb-2" />
        <div className="h-4 w-48 bg-surface-container-high rounded mb-5" />
        <div className="rounded-[14px] overflow-hidden mb-6" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '180px 180px', gap: '4px' }}>
          <div className="bg-surface-container-high" style={{ gridRow: '1/3' }} />
          {[0,1,2,3].map(i => <div key={i} className="bg-surface-container-high" />)}
        </div>
        <div className="grid gap-8" style={{ gridTemplateColumns: '1fr 300px' }}>
          <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-surface-container-high rounded w-full" />)}</div>
          <div className="h-64 bg-surface-container-high rounded-[14px]" />
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CarDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: car, isLoading, isError, refetch } = useListing(id);
  const createConv = useCreateConversation();
  const { data: similar } = useListings(
    car ? { limit: '6', search: car.make, listingType: car.listingType ?? 'SALE' } : {}
  );

  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const { addToast } = useToast();
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const tc = useTranslations('colors');
  const tt = useTranslations('time');
  const locale = useLocale();

  const fuelMap = fuelLabels(tm);
  const transMap = transmissionLabels(tm);
  const condMap = conditionLabels(tm);
  const driveMap = driveLabels(tm);
  const extColors = exteriorColors(tc);
  const intColors = interiorColors(tc);

  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const isWanted = car?.listingType === 'WANTED';
  const isOwner = !!(user && car?.seller?.id === user.id);

  const { data: reviewSummary } = useReviewSummary(car?.seller?.id);

  useEffect(() => {
    const lat = sessionStorage.getItem('userLat');
    const lng = sessionStorage.getItem('userLng');
    if (lat && lng) { setUserLat(parseFloat(lat)); setUserLng(parseFloat(lng)); }
    else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        sessionStorage.setItem('userLat', String(pos.coords.latitude));
        sessionStorage.setItem('userLng', String(pos.coords.longitude));
      }, () => {}, { enableHighAccuracy: false, timeout: 5000 });
    }
  }, []);

  function handleMessage() {
    requireAuth(async () => {
      if (!car) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'LISTING', entityId: car.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) { addToast('error', err instanceof Error ? err.message : tp('carErrorConversation')); }
    }, tp('carLoginToMessage'));
  }

  function handleBuyNow() { handleMessage(); }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: car?.title ?? '', url });
    else { navigator.clipboard.writeText(url); addToast('success', tp('carLinkCopied')); }
  }

  if (isLoading) return <PageSkeleton />;
  if (isError || !car) return (
    <><Navbar /><div className="min-h-screen pt-28"><main className="max-w-5xl mx-auto px-4 md:px-8"><ErrorState onRetry={() => refetch()} /></main></div><Footer /></>
  );
  if (car.listingType === 'RENTAL') {
    router.replace(`/rentals/${id}`);
    return <PageSkeleton />;
  }

  const images: ImageItem[] = (car.images ?? [])
    .map(img => ({ id: img.id, url: getImageUrl(img.url) || '' }))
    .filter(i => i.url);

  const priceFormatted = Number(car.price).toLocaleString('en-US');
  const filteredSimilar = similar?.items?.filter(s => s.id !== car.id).slice(0, 6) ?? [];
  const distance = userLat && userLng && car.latitude && car.longitude
    ? haversineDistance(userLat, userLng, car.latitude, car.longitude) : null;

  const sellerName = car.seller?.displayName || car.seller?.username || '';
  const detailRows: { label: string; value: string; isColor?: boolean; rawColorKey?: string }[] = [
    { label: 'اللون الخارجي', value: extColors.find(c => c.value === car.exteriorColor)?.label || car.exteriorColor || '', isColor: !!car.exteriorColor, rawColorKey: car.exteriorColor || undefined },
    { label: 'اللون الداخلي', value: intColors.find(c => c.value === car.interior)?.label || car.interior || '', isColor: !!car.interior, rawColorKey: car.interior || undefined },
    { label: 'نوع الوقود', value: car.fuelType ? (fuelMap[car.fuelType] ?? car.fuelType) : '' },
    { label: 'ناقل الحركة', value: car.transmission ? (transMap[car.transmission] ?? car.transmission) : '' },
    { label: 'نظام الدفع', value: car.driveType ? (driveMap[car.driveType] ?? car.driveType) : '' },
    { label: 'عدد الأبواب', value: car.doors ? String(car.doors) : '' },
    { label: 'عدد المقاعد', value: car.seats ? String(car.seats) : '' },
    { label: 'نوع الهيكل', value: car.bodyType || '' },
    { label: 'الحالة', value: car.condition ? (condMap[car.condition] ?? car.condition) : '' },
  ].filter(r => r.value);

  const allFeatures: string[] = car.features ?? [];
  const visibleFeatures = showAllFeatures ? allFeatures : allFeatures.slice(0, 8);

  // ── CTAs label ──
  const primaryLabel = isWanted ? 'تواصل الآن' : 'تواصل مع البائع';

  return (
    <>
      <Navbar />

      {lightboxIdx !== null && (
        <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <div className="bg-background min-h-screen">
        <main className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-28 lg:pb-16">

          {/* ══ A — TOP BAR ══ */}
          <div className="flex items-center justify-between mb-5">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1 text-[12px] text-on-surface-variant flex-wrap">
              <Link href="/" className="text-primary hover:underline cursor-pointer">السوق</Link>
              <span className="mx-0.5">›</span>
              <Link href="/listings" className="text-primary hover:underline cursor-pointer">سيارات</Link>
              <span className="mx-0.5">›</span>
              <span className="truncate max-w-[160px] sm:max-w-xs">{car.make} {car.model} {car.year}</span>
            </nav>

            {/* Share + Save */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-outline-variant/40 text-[12px] text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-150 cursor-pointer"
              >
                <span className="material-symbols-outlined text-base">ios_share</span>
                <span className="hidden sm:inline">مشاركة</span>
              </button>
              <button
                onClick={() => setSaved(s => !s)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[12px] transition-all duration-150 cursor-pointer ${saved ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant/40 text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5'}`}
              >
                <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                <span className="hidden sm:inline">{saved ? 'محفوظ' : 'حفظ'}</span>
              </button>
            </div>
          </div>

          {/* ══ B — TITLE SECTION ══ */}
          <div className="mb-4">
            <h1 className="text-[24px] font-bold text-on-surface mb-2 leading-tight tracking-tight">
              {car.make} {car.model} {car.year}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {reviewSummary && reviewSummary.reviewCount > 0 && (
                <>
                  <span className="flex items-center gap-1 font-semibold text-on-surface text-[13px]">
                    <span className="text-amber-400">★</span>
                    {reviewSummary.averageRating.toFixed(1)}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
                  <span className="text-[12px] text-on-surface-variant">{reviewSummary.reviewCount} تقييم</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
                </>
              )}
              {car.governorate && (
                <>
                  <span className="text-[12px] text-on-surface-variant">{car.governorate}، عُمان</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
                </>
              )}
              <ListingBadge type={car.listingType ?? 'SALE'} />
            </div>
          </div>

          {/* ══ Mobile photo swiper ══ */}
          <div className="md:hidden -mx-4 mb-5">
            <MobilePhotoSwiper images={images} title={car.title} onShowAll={setLightboxIdx} />
          </div>

          {/* ══ C — PHOTO GRID (desktop) ══ */}
          <div className="mb-8">
            <PhotoGrid images={images} title={car.title} onShowAll={setLightboxIdx} />
          </div>

          {/* ══ D — TWO-COLUMN LAYOUT ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

            {/* ════ LEFT COLUMN ════ */}
            <div>

              {/* S1 — Seller Row */}
              <div className="flex items-center gap-3 py-1 pb-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
                    <SellerAvatar avatarUrl={car.seller?.avatarUrl} name={sellerName} size={48} />
                  </div>
                  {car.seller?.isVerified && (
                    <span
                      className="absolute left-1/2 -translate-x-1/2 material-symbols-outlined text-primary text-[12px] leading-none bg-white dark:bg-surface-container rounded-full"
                      style={{ fontVariationSettings: "'FILL' 1", bottom: '-6px' }}
                    >verified</span>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-on-surface">
                    معروض بواسطة {sellerName}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {car.seller?.createdAt
                      ? `عضو منذ ${new Date(car.seller.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US', { year: 'numeric', month: 'long' })}`
                      : ''}
                  </p>
                </div>
              </div>
              <div className="h-[2px] w-50 rounded-full bg-primary mt-1 mx-auto" />

              <Divider />

              {/* Description — below seller name */}
              {car.description && (
                <>
                  <div>
                    <SectionTitle>وصف الإعلان</SectionTitle>
                    <ExpandableText text={car.description} />
                  </div>
                  <Divider />
                </>
              )}

              {/* S2 — Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20">
                    <ShieldCheck size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-on-surface">
                      حالة {car.condition ? (condMap[car.condition] ?? car.condition) : 'السيارة'}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {car.condition === 'NEW' ? 'سيارة جديدة لم تُستخدم' : car.condition === 'USED' ? 'سيارة مستعملة بحالة جيدة' : 'راجع وصف الإعلان للتفاصيل'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20">
                    <BadgePercent size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-on-surface">
                      {car.isPriceNegotiable ? 'قابل للتفاوض' : 'سعر ثابت'}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {car.isPriceNegotiable ? 'السعر قابل للنقاش مع البائع' : 'السعر المعروض نهائي'}
                    </p>
                  </div>
                </div>

              </div>

              <Divider />

              {/* S3 — Specs 4-grid */}
              <div>
                <SectionTitle>المواصفات الأساسية</SectionTitle>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'سنة الصنع', value: car.year ? String(car.year) : '—' },
                    { label: 'الكيلومترات', value: car.mileage ? `${car.mileage.toLocaleString('en-US')} كم` : '—' },
                    { label: 'المحرك', value: car.engineSize ? `${car.engineSize}` : '—' },
                    { label: 'الحصان', value: car.horsepower ? `${car.horsepower} hp` : '—' },
                  ].map(spec => (
                    <div key={spec.label} className="relative rounded-2xl p-4 text-center overflow-hidden border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 hover:from-primary/8 hover:to-primary/15 transition-all duration-200">
                      <p className="text-[13px] font-semibold text-on-surface mb-0.5">{spec.label}</p>
                      <p className="text-[15px] font-bold text-primary leading-tight">{spec.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Divider />

              {/* S4 — Details Grid */}
              {detailRows.length > 0 && (
                <div>
                  <SectionTitle>تفاصيل السيارة</SectionTitle>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {detailRows.map((row, i) => (
                      <div key={i} className="flex flex-col gap-0.5 px-4 py-3 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 hover:from-primary/8 hover:to-primary/15 transition-all duration-200">
                        <span className="text-[12px] font-semibold text-on-surface">{row.label}</span>
                        <span className="text-[12px] text-on-surface-variant">
                          {row.isColor && row.rawColorKey
                            ? <ColorSwatch value={row.rawColorKey} />
                            : row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* S5 — Features */}
              {allFeatures.length > 0 && (
                <>
                  <Divider />
                  <div>
                    <SectionTitle>المميزات</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {visibleFeatures.map(feat => (
                        <span key={feat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container text-[12px] text-on-surface">
                          <span className="material-symbols-outlined text-primary text-[14px] flex-shrink-0">check</span>
                          {feat}
                        </span>
                      ))}
                    </div>
                    {allFeatures.length > 8 && (
                      <button
                        onClick={() => setShowAllFeatures(s => !s)}
                        className="mt-3 text-[12px] text-primary underline-offset-2 hover:underline cursor-pointer font-medium block w-full text-center"
                      >
                        {showAllFeatures ? 'إخفاء' : `عرض كل المميزات (${allFeatures.length})`}
                      </button>
                    )}
                  </div>
                </>
              )}


              {/* S7 — Ratings */}
              {reviewSummary && reviewSummary.reviewCount > 0 && (
                <>
                  <Divider />
                  <div>
                    <SectionTitle>
                      التقييمات · {reviewSummary.averageRating.toFixed(1)} <span className="text-amber-400">★</span> ({reviewSummary.reviewCount})
                    </SectionTitle>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviewSummary.distribution[star] || 0;
                        const pct = reviewSummary.reviewCount > 0 ? (count / reviewSummary.reviewCount) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-[11px] text-on-surface-variant w-16 text-right flex-shrink-0">{star} ★</span>
                            <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[11px] text-on-surface-variant w-7 text-left flex-shrink-0">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* S8 — Map */}
              {car.latitude && car.longitude && (
                <>
                  <Divider />
                  <div>
                    <SectionTitle>الموقع</SectionTitle>
                    <p className="text-[12px] text-on-surface-variant mb-3 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                      {car.governorate}{car.city ? `، ${car.city}` : ''}، عُمان
                      {distance !== null && (
                        <span className="flex items-center gap-1.5 mt-0 text-[11px] text-on-surface-variant ms-1">
                          {distance < 1 ? `${Math.round(distance * 1000)} م` : `${distance.toFixed(1)} كم`} منك
                        </span>
                      )}
                    </p>
                    <div className="rounded-2xl overflow-hidden border border-border/40 shadow-sm" style={{ height: 200 }}>
                      <MapView latitude={car.latitude} longitude={car.longitude} title={car.title} showDirections showShare sellerPhone={car.seller?.phone} />
                    </div>
                  </div>
                </>
              )}

              {/* S9 — Things to know */}
              <Divider />
              <div>
                <SectionTitle>معلومات مهمة</SectionTitle>
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 transition-all duration-200 text-center">
                    <span className="text-[12px] font-semibold text-on-surface">سياسة الإلغاء</span>
                    <span className="text-[11px] text-on-surface-variant leading-relaxed">تواصل مع البائع</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 transition-all duration-200 text-center">
                    <span className="text-[12px] font-semibold text-on-surface">شروط التواصل</span>
                    <span className="text-[11px] text-on-surface-variant leading-relaxed">عبر الموقع أو واتساب</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 transition-all duration-200 text-center">
                    <span className="text-[12px] font-semibold text-on-surface">السلامة</span>
                    <span className="text-[11px] text-on-surface-variant leading-relaxed">تحقق شخصياً قبل الصفقة</span>
                  </div>
                </div>
              </div>

            </div>
            {/* ════ END LEFT COLUMN ════ */}

            {/* ════ RIGHT COLUMN — Sticky Price Card ════ */}
            <div className="hidden lg:block">
              <div className="sticky top-5 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest dark:bg-surface-container overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                <div className="h-[3px] w-full bg-primary" />
                <div className="p-5">

                {/* Price row */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[26px] font-bold text-on-surface">{priceFormatted} ر.ع</span>
                    {car.isPriceNegotiable && (
                      <span className="text-[12px] text-on-surface-variant mr-1">قابل للتفاوض</span>
                    )}
                  </div>
                  {isWanted && <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] px-2.5 py-0.5 rounded-full mt-1 mb-4 border border-blue-100 font-medium">مطلوب</span>}
                </div>


                {/* Info rows */}
                <div className="mb-4 flex flex-col gap-2.5">
                  {[
                    { label: 'النوع', value: isWanted ? 'مطلوب' : 'للبيع' },
                    { label: 'الحالة', value: car.condition ? (condMap[car.condition] ?? car.condition) : '' },
                    { label: 'المحافظة', value: car.governorate || '' },
                    { label: 'المشاهدات', value: `${car.viewCount} مشاهدة` },
                    { label: 'تاريخ النشر', value: relativeTimeT(car.createdAt, tt, locale) },
                  ].filter(r => r.value).map(row => (
                    <div key={row.label} className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-on-surface">{row.label}</span>
                      <span className="text-on-surface-variant">{row.value}</span>
                    </div>
                  ))}
                </div>

                <hr className="border-t border-outline-variant/15 my-4" />

                {/* CTA buttons */}
                <div className="space-y-2.5">
                  {isOwner ? (
                    <Link href={`/edit-listing/${car.id}`}
                      className="block w-full bg-primary text-on-primary text-center h-12 rounded-xl text-[14px] font-medium tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-sm leading-[48px]">
                      تعديل الإعلان
                    </Link>
                  ) : (
                    car.seller?.phone
                      ? <PhoneRevealButton phone={car.seller.phone} />
                      : <button onClick={handleBuyNow} disabled={createConv.isPending}
                          className="w-full h-12 rounded-xl bg-primary text-on-primary text-[14px] font-medium tracking-wide hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-40">
                          {createConv.isPending ? 'جاري...' : primaryLabel}
                        </button>
                  )}

                  {!isOwner && (
                    <button onClick={handleMessage} disabled={createConv.isPending}
                      className="w-full h-10 rounded-xl bg-surface-container text-on-surface text-[13px] font-medium border border-outline-variant/30 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-base">chat</span>
                      إرسال رسالة
                    </button>
                  )}

                  {!isOwner && car.seller?.phone && (
                    <a
                      href={`https://wa.me/${car.seller.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(tp('carWhatsappText', { title: car.title }))}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full h-10 rounded-xl bg-emerald-50 text-emerald-700 text-[13px] font-medium border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 transition-colors mt-2 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                      تواصل عبر واتساب
                    </a>
                  )}
                </div>

                {/* Seller mini-card */}
                <div className="pt-4 border-t border-outline-variant/15 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                      <SellerAvatar avatarUrl={car.seller?.avatarUrl} name={sellerName} size={36} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-on-surface truncate">{sellerName}</p>
                      <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                        {car.seller?.isVerified && (
                          <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        )}
                        {car.seller?.isVerified ? 'بائع موثق' : 'بائع عادي'}
                        {car.seller?.governorate ? ` · ${car.seller.governorate}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-[10px] text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
                      {car.viewCount} مشاهدة
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">schedule</span>
                      {relativeTimeT(car.createdAt, tt, locale)}
                    </span>
                    {car.viewCount >= 5 && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-0.5 font-medium">
                          <span className="text-green-500 font-bold">●</span>
                          نشط
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Report link */}
                <button className="text-center text-[10px] text-on-surface-variant mt-4 hover:text-error cursor-pointer underline underline-offset-2 transition-colors block w-full">
                  الإبلاغ عن هذا الإعلان
                </button>
                </div>{/* end p-5 */}
              </div>
            </div>
            {/* ════ END RIGHT COLUMN ════ */}

          </div>
          {/* ══ END TWO-COLUMN ══ */}

          {/* ══ E — SIMILAR LISTINGS ══ */}
          {filteredSimilar.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border/30">
              <div className="flex items-center justify-between mb-5">
                <SectionTitle>إعلانات مشابهة</SectionTitle>
                <Link href={`/listings?make=${car.make}`} className="text-[12px] font-medium text-primary hover:underline underline-offset-2">
                  عرض الكل
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                  {filteredSimilar.map(item => {
                    const img = item.images?.find(i => i.isPrimary) ?? item.images?.[0];
                    return (
                      <div key={item.id} className="w-56 flex-shrink-0">
                        <VehicleCard
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
                          imageUrl={getImageUrl(img?.url)}
                          viewCount={item.viewCount}
                          createdAt={item.createdAt}
                          isVerified={item.seller?.isVerified}
                          isPriceNegotiable={item.isPriceNegotiable}
                          listingType={item.listingType}
                          dailyPrice={item.dailyPrice}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ══ F — MOBILE STICKY CTA BAR ══ */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-background/95 backdrop-blur-sm border-t border-border px-4 h-16 flex items-center justify-between pb-[env(safe-area-inset-bottom)]">
            {/* Price */}
            <div className="flex flex-col">
              <p className="text-[15px] font-bold text-on-surface">{priceFormatted} ر.ع</p>
              <button
                onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                className="text-[10px] text-on-surface-variant"
              >
                عرض التفاصيل
              </button>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {car.seller?.phone && (
                <a
                  href={`https://wa.me/${car.seller.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(tp('carWhatsappText', { title: car.title }))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 text-[12px] font-medium"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  واتساب
                </a>
              )}
              <button
                onClick={handleBuyNow}
                disabled={createConv.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-[12px] font-medium disabled:opacity-40"
              >
                {createConv.isPending ? 'جاري...' : 'تواصل'}
              </button>
            </div>
        </div>
      )}

      <Footer />
    </>
  );
}
