'use client';

import Image from 'next/image';
import { use, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useInsuranceOffer, useCreateConversation } from '@/lib/api';
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

export default function InsuranceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: offer, isLoading, error } = useInsuranceOffer(id);
  const [activeImg, setActiveImg] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();
  const tp = useTranslations('pages');
  const locale = useLocale();

  const TYPE_LABELS: Record<string, string> = {
    CAR_COMPREHENSIVE: tp('insDetailComprehensive'), CAR_THIRD_PARTY: tp('insDetailThirdParty'), MARINE: tp('insDetailMarine'),
    HEAVY_EQUIPMENT: tp('insDetailHeavyEquipment'), FINANCING: tp('insDetailFinancing'), LEASING: tp('insDetailLeasing'),
  };

  function handleMessage() {
    requireAuth(async () => {
      if (!offer) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'INSURANCE', entityId: offer.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : tp('insDetailErrorConversation'));
      }
    }, tp('insDetailLoginToMessage'));
  }

  if (isLoading) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ListingSkeleton count={1} /></main></>;
  if (error || !offer) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ErrorState message={tp('insDetailNotFound')} /></main><Footer /></>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link href="/insurance" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">shield</span> {tp('insDetailBreadcrumb')}
            </Link>
            <span className="material-symbols-outlined icon-flip text-xs">chevron_left</span>
            <span className="text-white font-bold">{TYPE_LABELS[offer.offerType] || offer.offerType}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Images */}
              {offer.images && offer.images.length > 0 && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="aspect-[16/9] bg-surface-container-low dark:bg-surface-container-high relative">
                    {offer.images[activeImg]?.url ? (
                      <Image src={getImageUrl(offer.images[activeImg].url) || ''} alt={offer.title} fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                        <span className="material-symbols-outlined text-7xl">shield</span>
                      </div>
                    )}
                  </div>
                  {offer.images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {offer.images.map((img: any, i: number) => (
                        <button key={img.id} onClick={() => setActiveImg(i)}
                          className={`relative w-16 h-16 overflow-hidden shrink-0 border-2 transition-all ${i === activeImg ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/20 dark:border-outline-variant/30'}`}>
                          <Image src={getImageUrl(img.url) || ''} alt="" fill className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title Card */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-3xl">shield</span>
                    </div>
                    <div>
                      <span className="px-2.5 py-1 text-[11px] font-black bg-primary/10 dark:bg-primary/20 text-primary mb-1 inline-block">{TYPE_LABELS[offer.offerType]}</span>
                      <p className="text-sm text-on-surface-variant">{offer.providerName}</p>
                    </div>
                  </div>
                  <h1 className="text-xl font-black text-on-surface mb-4">{offer.title}</h1>

                  {offer.priceFrom && (
                    <div className="bg-surface-container-low/50 dark:bg-surface-container-high/30 p-4 rounded-lg mb-4">
                      <p className="text-xs text-on-surface-variant mb-1">{tp('insDetailStartsFrom')}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-primary">{parseFloat(offer.priceFrom).toFixed(3)}</span>
                        <span className="text-sm text-on-surface-variant">{tp('insDetailCurrencyOMR')}</span>
                      </div>
                    </div>
                  )}

                  {offer.coverageType && (
                    <div className="bg-surface-container-low/50 dark:bg-surface-container-high/30 p-4 rounded-lg">
                      <p className="text-xs text-on-surface-variant mb-1">{tp('insDetailCoverageType')}</p>
                      <p className="font-black text-sm text-on-surface">{offer.coverageType}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {offer.description && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-black text-on-surface">{tp('insDetailOfferDetails')}</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{offer.description}</p>
                  </div>
                </div>
              )}

              {/* Features */}
              {offer.features.length > 0 && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified</span>
                    <h2 className="font-black text-on-surface">{tp('insDetailFeatures')}</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {offer.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3 bg-surface-container-low/50 dark:bg-surface-container-high/30 rounded-lg p-3">
                          <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">check_circle</span>
                          <span className="text-sm text-on-surface">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">contact_phone</span>
                  <h3 className="font-black text-on-surface text-sm">{tp('insDetailContactProvider')}</h3>
                </div>
                <div className="p-6 space-y-2.5">
                  {user?.id !== offer.user?.id && (
                    <button onClick={handleMessage} disabled={createConv.isPending}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-on-surface text-surface font-black text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                      <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? tp('insDetailChatPending') : tp('insDetailChat')}
                    </button>
                  )}
                  {offer.contactPhone && (
                    <a href={`tel:${offer.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary font-black text-sm hover:brightness-110 transition-all">
                      <span className="material-symbols-outlined text-lg">call</span> {tp('insDetailCall')}
                    </a>
                  )}
                  {offer.whatsapp && (
                    <a href={`https://wa.me/${offer.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                      <span className="material-symbols-outlined text-lg">chat</span> {tp('insDetailWhatsapp')}
                    </a>
                  )}
                  {offer.website && (
                    <a href={offer.website} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-surface-container-low dark:bg-surface-container-high text-on-surface font-black text-sm hover:bg-surface-container dark:hover:bg-surface-container-highest transition-colors">
                      <span className="material-symbols-outlined text-lg">language</span> {tp('insDetailWebsite')}
                    </a>
                  )}
                  {offer.termsUrl && (
                    <a href={offer.termsUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 text-on-surface-variant text-xs font-bold hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-sm">open_in_new</span> {tp('insDetailTerms')}
                    </a>
                  )}
                </div>
              </div>

              {/* Meta & Location */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">info</span>
                  <h3 className="font-black text-on-surface text-sm">{tp('insDetailInfo')}</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {offer.viewCount}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(offer.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')}</span>
                  </div>
                  {offer.governorate && (
                    <p className="text-sm font-bold text-on-surface flex items-center gap-2 mt-4 pt-4 border-t border-outline-variant/10 dark:border-outline-variant/20">
                      <span className="material-symbols-outlined text-primary text-base">pin_drop</span> {offer.governorate}
                    </p>
                  )}
                  {offer.latitude && offer.longitude && (
                    <div className="mt-4">
                      <MapView latitude={offer.latitude} longitude={offer.longitude} title={offer.title} sellerPhone={offer.contactPhone} />
                    </div>
                  )}
                </div>
              </div>

              {/* User */}
              <SellerCard
                title={tp('insDetailContactProvider')}
                name={offer.user.displayName || offer.user.username}
                avatarUrl={offer.user.avatarUrl}
                isVerified={offer.user.isVerified}
                onMessage={handleMessage}
                messagePending={createConv.isPending}
                onShare={() => {
                  const url = window.location.href;
                  if (navigator.share) navigator.share({ title: offer.title, url });
                  else navigator.clipboard.writeText(url);
                }}
              />
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
