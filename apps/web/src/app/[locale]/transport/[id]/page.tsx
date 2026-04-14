'use client';

import { use, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useTransportService, useCreateConversation } from '@/lib/api';
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

export default function TransportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: item, isLoading, error } = useTransportService(id);
  const [activeImg, setActiveImg] = useState(0);
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { addToast } = useToast();
  const tp = useTranslations('pages');
  const locale = useLocale();

  const TYPE_LABELS: Record<string, string> = {
    CARGO: tp('transportDetailTypeCargo'), FURNITURE: tp('transportDetailTypeFurniture'), DELIVERY: tp('transportDetailTypeDelivery'),
    HEAVY_TRANSPORT: tp('transportDetailTypeHeavy'), TRUCK_RENTAL: tp('transportDetailTypeTruckRental'), OTHER_TRANSPORT: tp('transportDetailTypeOther'),
  };
  const PRICING_LABELS: Record<string, string> = { FIXED: tp('transportDetailPricingFixed'), PER_KM: tp('transportDetailPricingPerKm'), PER_TRIP: tp('transportDetailPricingPerTrip'), HOURLY: tp('transportDetailPricingHourly'), NEGOTIABLE_PRICE: tp('transportDetailPricingNegotiable') };

  function handleMessage() {
    requireAuth(async () => {
      if (!item) return;
      try {
        const conv = await createConv.mutateAsync({ entityType: 'TRANSPORT', entityId: item.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : tp('transportDetailErrorConversation'));
      }
    }, tp('transportDetailLoginToMessage'));
  }

  if (isLoading) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ListingSkeleton count={1} /></main></>;
  if (error || !item) return <><Navbar /><main className="pt-28 pb-16 max-w-[1200px] mx-auto px-4"><ErrorState message={tp('transportDetailNotFound')} /></main><Footer /></>;

  const images = item.images || [];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="h-40 md:h-48 bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        </div>

        <main className="max-w-5xl mx-auto px-4 md:px-8 -mt-20 md:-mt-24 relative z-10 pb-16">
          <nav className="flex items-center gap-2 text-sm text-white/70 mb-5">
            <Link href="/transport" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">local_shipping</span> {tp('transportDetailBreadcrumb')}
            </Link>
            <span className="material-symbols-outlined icon-flip text-xs">chevron_left</span>
            <span className="text-white font-bold">{TYPE_LABELS[item.transportType] || item.transportType}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Images */}
            <div className="lg:col-span-3">
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="aspect-[16/9] bg-surface-container-low dark:bg-surface-container-high relative">
                  {images[activeImg]?.url ? (
                    <img src={getImageUrl(images[activeImg].url) || ''} alt={item.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                      <span className="material-symbols-outlined text-7xl">local_shipping</span>
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

              {item.description && (
                <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm mt-6">
                  <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <h2 className="font-black text-on-surface">{tp('transportDetailDescription')}</h2>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-on-surface-variant whitespace-pre-line leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Price */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="px-2.5 py-1 text-[11px] font-black bg-primary/10 dark:bg-primary/20 text-primary">{TYPE_LABELS[item.transportType]}</span>
                    {item.hasInsurance && <span className="px-2.5 py-1 text-[11px] font-black bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><span className="material-symbols-outlined text-xs">shield</span> {tp('transportDetailInsurance')}</span>}
                    {item.hasTracking && <span className="px-2.5 py-1 text-[11px] font-black bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center gap-1"><span className="material-symbols-outlined text-xs">my_location</span> {tp('transportDetailTracking')}</span>}
                  </div>
                  <h1 className="text-xl font-black text-on-surface mb-1">{item.title}</h1>
                  <p className="text-sm text-on-surface-variant mb-4">{item.providerName}</p>

                  <div className="space-y-2.5 text-sm mb-4">
                    {item.basePrice && (
                      <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20">
                        <span className="text-on-surface-variant">{tp('transportDetailBasePrice')}</span><span className="font-black text-primary">{parseFloat(item.basePrice).toFixed(3)} {tp('transportDetailCurrencyOMR')}</span>
                      </div>
                    )}
                    {item.pricePerKm && (
                      <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20">
                        <span className="text-on-surface-variant">{tp('transportDetailPricePerKm')}</span><span className="font-black text-on-surface">{parseFloat(item.pricePerKm).toFixed(3)} {tp('transportDetailCurrencyOMR')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20">
                      <span className="text-on-surface-variant">{tp('transportDetailPricingType')}</span><span className="font-black text-on-surface">{PRICING_LABELS[item.pricingType] || item.pricingType}</span>
                    </div>
                    {item.vehicleType && <div className="flex justify-between items-center py-2 border-b border-outline-variant/10 dark:border-outline-variant/20"><span className="text-on-surface-variant">{tp('transportDetailVehicleType')}</span><span className="font-black text-on-surface">{item.vehicleType}</span></div>}
                    {item.vehicleCapacity && <div className="flex justify-between items-center py-2"><span className="text-on-surface-variant">{tp('transportDetailVehicleCapacity')}</span><span className="font-black text-on-surface">{item.vehicleCapacity}</span></div>}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-on-surface-variant pt-4 border-t border-outline-variant/10 dark:border-outline-variant/20">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">visibility</span> {item.viewCount}</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span> {new Date(item.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')}</span>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-2.5">
                  {user?.id !== item.user?.id && (
                    <button onClick={handleMessage} disabled={createConv.isPending}
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-on-surface text-surface font-black text-sm hover:bg-primary hover:text-on-primary transition-colors disabled:opacity-60">
                      <span className="material-symbols-outlined text-lg">chat</span> {createConv.isPending ? tp('transportDetailChatPending') : tp('transportDetailChat')}
                    </button>
                  )}
                  {item.contactPhone && (
                    <a href={`tel:${item.contactPhone}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-on-primary font-black text-sm hover:brightness-110 transition-all">
                      <span className="material-symbols-outlined text-lg">call</span> {tp('transportDetailCall')}
                    </a>
                  )}
                  {item.whatsapp && (
                    <a href={`https://wa.me/${item.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-black text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors">
                      <span className="material-symbols-outlined text-lg">chat</span> {tp('transportDetailWhatsapp')}
                    </a>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-outline-variant/10 dark:border-outline-variant/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  <h3 className="font-black text-on-surface text-sm">{tp('transportDetailLocation')}</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">pin_drop</span>
                    {item.governorate}{item.city ? ` - ${item.city}` : ''}
                  </p>
                  {item.latitude && item.longitude && (
                    <div className="mt-4">
                      <MapView latitude={item.latitude} longitude={item.longitude} title={item.title} sellerPhone={item.contactPhone} />
                    </div>
                  )}
                </div>
              </div>

              {/* User */}
              <SellerCard
                title={tp('transportDetailServiceProvider')}
                name={item.user.displayName || item.user.username}
                avatarUrl={item.user.avatarUrl}
                isVerified={item.user.isVerified}
                onMessage={handleMessage}
                messagePending={createConv.isPending}
                onShare={() => {
                  const url = window.location.href;
                  if (navigator.share) navigator.share({ title: item.title, url });
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
