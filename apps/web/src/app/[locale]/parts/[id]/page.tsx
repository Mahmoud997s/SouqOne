'use client';

import { use, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { usePart, useCreateConversation } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import { SellerCard } from '@/components/seller-card';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

const COND_COLORS: Record<string, string> = { NEW: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400', USED: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400', REFURBISHED: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' };

export default function PartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: part, isLoading, error } = usePart(id);
  const [activeImg, setActiveImg] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();
  const tp = useTranslations('pages');
  const locale = useLocale();

  const COND_LABELS: Record<string, string> = { NEW: tp('partDetailCondNew'), USED: tp('partDetailCondUsed'), REFURBISHED: tp('partDetailCondRefurbished') };
  const CAT_LABELS: Record<string, string> = { ENGINE: tp('partDetailCatEngine'), BODY: tp('partDetailCatBody'), ELECTRICAL: tp('partDetailCatElectrical'), SUSPENSION: tp('partDetailCatSuspension'), BRAKES: tp('partDetailCatBrakes'), INTERIOR: tp('partDetailCatInterior'), TIRES: tp('partDetailCatTires'), BATTERIES: tp('partDetailCatBatteries'), OILS: tp('partDetailCatOils'), ACCESSORIES: tp('partDetailCatAccessories'), OTHER: tp('partDetailCatOther') };

  function handleMessage() {
    requireAuth(async () => {
      if (!part) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'SPARE_PART', entityId: part.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : tp('partDetailErrorConversation'));
      }
    }, tp('partDetailLoginToMessage'));
  }

  if (isLoading) return <><Navbar /><div className="min-h-screen bg-background"><div className="h-40 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447]" /><main className="max-w-5xl mx-auto px-4 md:px-8 -mt-16"><ListingSkeleton count={1} /></main></div></>;
  if (error || !part) return <><Navbar /><div className="min-h-screen bg-background pt-28"><main className="max-w-5xl mx-auto px-4"><ErrorState message={tp('partDetailNotFound')} /></main></div><Footer /></>;

  const images = part.images || [];
  const mainImage = images[activeImg]?.url;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link href="/parts" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">build</span> {tp('partDetailBreadcrumb')}
            </Link>
            <span className="material-symbols-outlined icon-flip text-xs">chevron_left</span>
            <span className="text-white font-bold">{CAT_LABELS[part.partCategory] || part.partCategory}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Images */}
            <div className="lg:col-span-3">
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="aspect-[4/3] bg-surface-container-low dark:bg-surface-container-high relative">
                  {mainImage ? (
                    <img src={getImageUrl(mainImage) || ''} alt={part.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                      <span className="material-symbols-outlined text-7xl">build</span>
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

              {/* Description */}
              {part.description && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm mt-6">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-black text-on-surface">{tp('partDetailDescription')}</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{part.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price & Title Card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`px-2.5 py-1 text-[11px] font-black ${COND_COLORS[part.condition] || 'bg-surface-container-low text-on-surface-variant'}`}>
                      {COND_LABELS[part.condition]}
                    </span>
                    {part.isOriginal && <span className="px-2.5 py-1 text-[11px] font-black bg-primary/10 dark:bg-primary/20 text-primary">{tp('partDetailOriginal')}</span>}
                    <span className="px-2.5 py-1 text-[11px] font-black bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant">{CAT_LABELS[part.partCategory]}</span>
                  </div>
                  <h1 className="text-xl font-black text-on-surface mb-4">{part.title}</h1>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-black text-primary">{parseFloat(part.price).toFixed(3)}</span>
                    <span className="text-sm text-on-surface-variant">{tp('partDetailCurrencyOMR')}</span>
                  </div>
                  {part.isPriceNegotiable && <span className="text-xs text-on-surface-variant bg-surface-container-low dark:bg-surface-container-high px-2.5 py-1 inline-block mt-1">{tp('partDetailNegotiable')}</span>}

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-4 pt-4 border-t border-outline-variant/10 dark:border-outline-variant/20">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {part.viewCount} {tp('partDetailViews')}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(part.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')}</span>
                  </div>
                </div>

                {/* Contact buttons */}
                <div className="p-6 pt-0 space-y-2.5">
                  {user?.id !== part.seller?.id && (
                    <button onClick={handleMessage} disabled={createConv.isPending}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-on-surface text-surface font-black text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                      <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? tp('partDetailChatPending') : tp('partDetailChat')}
                    </button>
                  )}
                  {part.contactPhone && (
                    <a href={`tel:${part.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary font-black text-sm hover:brightness-110 transition-all">
                      <span className="material-symbols-outlined text-lg">call</span> {tp('partDetailCallSeller')}
                    </a>
                  )}
                  {part.whatsapp && (
                    <a href={`https://wa.me/${part.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                      <span className="material-symbols-outlined text-lg">chat</span> {tp('partDetailWhatsapp')}
                    </a>
                  )}
                </div>
              </div>

              {/* Seller card */}
              <SellerCard
                title={tp('partDetailSeller')}
                name={part.seller.displayName || part.seller.username}
                avatarUrl={part.seller.avatarUrl}
                location={part.seller.governorate}
                phone={part.contactPhone}
                whatsappText={tp('partDetailWhatsappText', { title: part.title })}
                onMessage={handleMessage}
                messagePending={createConv.isPending}
                isOwner={user?.id === part.seller?.id}
                onShare={() => {
                  const url = window.location.href;
                  if (navigator.share) navigator.share({ title: part.title, url });
                  else navigator.clipboard.writeText(url);
                }}
              />

              {/* Details */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <h3 className="font-black text-on-surface text-sm">{tp('partDetailDetails')}</h3>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  {part.partNumber && (
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20 last:border-0">
                      <span className="text-on-surface-variant">{tp('partDetailPartNumber')}</span><span className="font-black text-on-surface">{part.partNumber}</span>
                    </div>
                  )}
                  {part.compatibleMakes.length > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20 last:border-0">
                      <span className="text-on-surface-variant">{tp('partDetailMakes')}</span><span className="font-black text-on-surface">{part.compatibleMakes.join(', ')}</span>
                    </div>
                  )}
                  {part.yearFrom && (
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20 last:border-0">
                      <span className="text-on-surface-variant">{tp('partDetailYears')}</span><span className="font-black text-on-surface">{part.yearFrom}{part.yearTo ? ` - ${part.yearTo}` : '+'}</span>
                    </div>
                  )}
                  {part.governorate && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-on-surface-variant">{tp('partDetailLocation')}</span><span className="font-black text-on-surface">{part.governorate}{part.city ? ` - ${part.city}` : ''}</span>
                    </div>
                  )}
                </div>
                {part.latitude && part.longitude && (
                  <div className="px-6 pb-6">
                    <MapView latitude={part.latitude} longitude={part.longitude} title={part.title} sellerPhone={part.contactPhone} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
