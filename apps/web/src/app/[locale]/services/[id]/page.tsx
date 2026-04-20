'use client';

import Image from 'next/image';
import { use, useState, useCallback, useEffect } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useCarService, useCreateConversation } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

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
        <span className="text-white/60 text-sm font-bold">{idx + 1} / {images.length}</span>
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
    </div>
  );
}

function PhotoGrid({ images, title, onOpen }: { images: ImgItem[]; title: string; onOpen: (i: number) => void }) {
  if (images.length === 0) return (
    <div className="rounded-2xl overflow-hidden bg-surface-container-high hidden md:flex items-center justify-center" style={{ height: 360 }}>
      <span className="material-symbols-outlined text-7xl text-on-surface-variant/30">home_repair_service</span>
    </div>
  );
  return (
    <div className="relative rounded-2xl overflow-hidden hidden md:grid" style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '180px 180px', gap: '4px' }}>
      {images.slice(0, 5).map((img, i) => (
        <button key={img.id} onClick={() => onOpen(i)}
          className={`relative overflow-hidden bg-surface-container-high hover:brightness-90 transition-all ${i === 0 ? 'row-span-2' : ''}`}>
          <Image src={img.url} alt={title} fill className="object-cover" sizes="50vw" />
        </button>
      ))}
      {images.length > 5 && (
        <button onClick={() => onOpen(4)} className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors">
          +{images.length - 5} صور
        </button>
      )}
    </div>
  );
}

function MobileSwiper({ images, title, onOpen }: { images: ImgItem[]; title: string; onOpen: (i: number) => void }) {
  const [idx, setIdx] = useState(0);
  if (images.length === 0) return (
    <div className="h-64 bg-surface-container-high flex items-center justify-center md:hidden">
      <span className="material-symbols-outlined text-6xl text-on-surface-variant/30">home_repair_service</span>
    </div>
  );
  return (
    <div className="relative h-72 bg-surface-container-high md:hidden">
      <Image src={images[idx].url} alt={title} fill className="object-cover" sizes="100vw" />
      <button onClick={() => onOpen(idx)} className="absolute inset-0" />
      {images.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + images.length) % images.length)} className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">chevron_right</span>
          </button>
          <button onClick={() => setIdx(i => (i + 1) % images.length)} className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">chevron_left</span>
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white' : 'bg-white/40'}`} />)}
          </div>
        </>
      )}
    </div>
  );
}

function Divider() { return <div className="h-px bg-outline-variant/15 my-6" />; }
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-bold text-on-surface mb-4">{children}</h2>;
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

export default function ServiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: svc, isLoading, error } = useCarService(id);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();
  const tp = useTranslations('pages');
  const locale = useLocale();

  const TYPE_LABELS: Record<string, string> = {
    MAINTENANCE: tp('svcDetailMaintenance'), CLEANING: tp('svcDetailCleaning'), INSPECTION: tp('svcDetailInspection'),
    BODYWORK: tp('svcDetailBodywork'), TOWING: tp('svcDetailTowing'), MODIFICATION: tp('svcDetailModification'),
    KEYS_LOCKS: tp('svcDetailKeysLocks'), ACCESSORIES_INSTALL: tp('svcDetailAccessoriesInstall'), OTHER_SERVICE: tp('svcDetailOther'),
  };
  const PROVIDER_LABELS: Record<string, string> = { WORKSHOP: tp('svcDetailProviderWorkshop'), INDIVIDUAL: tp('svcDetailProviderIndividual'), MOBILE: tp('svcDetailProviderMobile'), COMPANY: tp('svcDetailProviderCompany') };
  const DAY_LABELS: Record<string, string> = { SAT: tp('svcDetailDaySat'), SUN: tp('svcDetailDaySun'), MON: tp('svcDetailDayMon'), TUE: tp('svcDetailDayTue'), WED: tp('svcDetailDayWed'), THU: tp('svcDetailDayThu'), FRI: tp('svcDetailDayFri') };

  function handleMessage() {
    requireAuth(async () => {
      if (!svc) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'CAR_SERVICE', entityId: svc.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : tp('svcDetailErrorConversation'));
      }
    }, tp('svcDetailLoginToMessage'));
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: svc?.title ?? '', url });
    else { navigator.clipboard.writeText(url); addToast('success', tp('carLinkCopied')); }
  }

  if (isLoading) return <PageSkeleton />;
  if (error || !svc) return (
    <><Navbar /><div className="min-h-screen pt-28"><main className="max-w-5xl mx-auto px-4 md:px-8"><ErrorState message={tp('svcDetailNotFound')} /></main></div><Footer /></>
  );

  const images: ImgItem[] = (svc.images ?? []).map(img => ({ id: img.id, url: getImageUrl(img.url) || '' })).filter(i => i.url);
  const isOwner = user?.id === svc.user?.id;
  const providerName = svc.user?.displayName || svc.user?.username || '';
  const priceLabel = svc.priceFrom
    ? `${parseFloat(svc.priceFrom).toFixed(3)}${svc.priceTo ? ` - ${parseFloat(svc.priceTo).toFixed(3)}` : '+'}`
    : null;

  return (
    <>
      <Navbar />
      {lightboxIdx !== null && <Lightbox images={images} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />}

      <div className="bg-background min-h-screen">
        <main className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-28 lg:pb-16">

          {/* ══ TOP BAR ══ */}
          <div className="flex items-center justify-between mb-5">
            <nav className="flex items-center gap-1 text-[12px] text-on-surface-variant flex-wrap">
              <Link href="/" className="text-primary hover:underline">السوق</Link>
              <span className="mx-0.5">›</span>
              <Link href="/services" className="text-primary hover:underline">الخدمات</Link>
              <span className="mx-0.5">›</span>
              <span className="truncate max-w-[160px]">{TYPE_LABELS[svc.serviceType] || svc.serviceType}</span>
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
              <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                {TYPE_LABELS[svc.serviceType] || svc.serviceType}
              </span>
              <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-surface-container-high text-on-surface-variant border border-outline-variant/30">
                {PROVIDER_LABELS[svc.providerType] || svc.providerType}
              </span>
              {svc.isHomeService && (
                <span className="px-3 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">home</span>خدمة منزلية
                </span>
              )}
            </div>
            <h1 className="text-[24px] font-bold text-on-surface mb-1 leading-tight">{svc.title}</h1>
            {svc.providerName && <p className="text-[13px] text-on-surface-variant mb-1">{svc.providerName}</p>}
            <div className="flex items-center gap-2 flex-wrap text-[12px] text-on-surface-variant">
              {svc.governorate && <span>{svc.governorate}{svc.city ? `، ${svc.city}` : ''}، عُمان</span>}
              {svc.viewCount > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span>{svc.viewCount} مشاهدة</span>
                </>
              )}
            </div>
          </div>

          {/* ══ Mobile Swiper ══ */}
          <div className="md:hidden -mx-4 mb-5">
            <MobileSwiper images={images} title={svc.title} onOpen={setLightboxIdx} />
          </div>

          {/* ══ PHOTO GRID ══ */}
          <div className="mb-8">
            <PhotoGrid images={images} title={svc.title} onOpen={setLightboxIdx} />
          </div>

          {/* ══ TWO-COLUMN ══ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

            {/* LEFT */}
            <div>
              {/* Provider Row */}
              <div className="flex items-center gap-3 py-1 pb-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  {svc.user?.avatarUrl ? (
                    <Image src={getImageUrl(svc.user.avatarUrl) || ''} alt={providerName} width={48} height={48} className="object-cover w-full h-full" />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant text-2xl">person</span>
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-on-surface">مقدّم الخدمة: {providerName}</p>
                  {svc.user?.createdAt && (
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      عضو منذ {new Date(svc.user.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US', { year: 'numeric', month: 'long' })}
                    </p>
                  )}
                </div>
              </div>
              <div className="h-[2px] w-50 rounded-full bg-primary mt-1 mx-auto" />
              <Divider />

              {/* Description */}
              {svc.description && (
                <>
                  <div>
                    <SectionTitle>وصف الخدمة</SectionTitle>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed whitespace-pre-line">{svc.description}</p>
                  </div>
                  <Divider />
                </>
              )}

              {/* Working Hours */}
              {(svc.workingHoursOpen || svc.workingDays?.length > 0) && (
                <>
                  <div>
                    <SectionTitle>أوقات العمل</SectionTitle>
                    {svc.workingHoursOpen && svc.workingHoursClose && (
                      <p className="flex items-center gap-2 text-[13px] font-medium text-on-surface mb-3">
                        <span className="material-symbols-outlined text-primary text-base">schedule</span>
                        {svc.workingHoursOpen} — {svc.workingHoursClose}
                      </p>
                    )}
                    {svc.workingDays?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {svc.workingDays.map(d => (
                          <span key={d} className="px-3 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/20 text-[12px] text-on-surface-variant">
                            {DAY_LABELS[d] || d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Divider />
                </>
              )}

              {/* Map */}
              {(svc.latitude && svc.longitude) || svc.governorate ? (
                <div>
                  <SectionTitle>الموقع</SectionTitle>
                  <p className="text-[12px] text-on-surface-variant mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    {svc.governorate}{svc.city ? `، ${svc.city}` : ''}، عُمان
                    {svc.address && <span className="text-on-surface-variant/70"> · {svc.address}</span>}
                  </p>
                  {svc.latitude && svc.longitude && (
                    <div className="rounded-2xl overflow-hidden border border-border/40 shadow-sm" style={{ height: 200 }}>
                      <MapView latitude={svc.latitude} longitude={svc.longitude} title={svc.title} sellerPhone={svc.contactPhone} />
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* RIGHT — Contact Card */}
            <div className="hidden lg:block sticky top-20">
              <div className="border border-outline-variant/20 rounded-2xl p-5 shadow-sm bg-surface-container-lowest">
                {priceLabel ? (
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[22px] font-bold text-on-surface">{priceLabel}</span>
                      <span className="text-[13px] text-on-surface-variant">ر.ع</span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <span className="text-[13px] text-on-surface-variant">تواصل للاستفسار عن السعر</span>
                  </div>
                )}
                <div className="h-px bg-outline-variant/15 mb-4" />
                {!isOwner && (
                  <div className="space-y-2.5">
                    <button onClick={handleMessage} disabled={createConv.isPending}
                      className="w-full h-11 rounded-xl bg-primary text-on-primary text-[13px] font-semibold flex items-center justify-center gap-2 hover:brightness-105 transition-all disabled:opacity-60 cursor-pointer">
                      <span className="material-symbols-outlined text-lg">chat</span>
                      {createConv.isPending ? 'جاري...' : 'مراسلة مقدّم الخدمة'}
                    </button>
                    {svc.contactPhone && (
                      <a href={`tel:${svc.contactPhone}`}
                        className="w-full h-11 rounded-xl border border-outline-variant/30 text-on-surface text-[13px] font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined text-lg">call</span>اتصال
                      </a>
                    )}
                    {svc.whatsapp && (
                      <a href={`https://wa.me/${svc.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="w-full h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors">
                        <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        واتساب
                      </a>
                    )}
                    {svc.website && (
                      <a href={svc.website} target="_blank" rel="noopener noreferrer"
                        className="w-full h-11 rounded-xl border border-outline-variant/30 text-on-surface text-[13px] font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined text-lg">language</span>الموقع الإلكتروني
                      </a>
                    )}
                  </div>
                )}
                <div className="pt-4 border-t border-outline-variant/15 mt-4 text-center">
                  <button className="text-[10px] text-on-surface-variant hover:text-error cursor-pointer underline underline-offset-2 transition-colors">
                    الإبلاغ عن هذا الإعلان
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* ══ MOBILE STICKY BAR ══ */}
      {!isOwner && (
        <div className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-background/95 backdrop-blur-sm border-t border-outline-variant/30 px-4 py-3 pb-[env(safe-area-inset-bottom)]">
          {priceLabel && (
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-[15px] font-semibold text-on-surface">{priceLabel} ر.ع</span>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleMessage} disabled={createConv.isPending}
              className="flex-1 h-10 rounded-xl bg-primary text-on-primary text-[13px] font-medium flex items-center justify-center gap-1.5 disabled:opacity-60">
              <span className="material-symbols-outlined text-base">chat</span>
              {createConv.isPending ? 'جاري...' : 'مراسلة'}
            </button>
            {svc.whatsapp && (
              <a href={`https://wa.me/${svc.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                className="h-10 px-4 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[13px] font-medium flex items-center justify-center gap-1.5">
                <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                واتساب
              </a>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
