'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { ErrorState } from '@/components/error-state';
import { useFavorites, useToggleFavorite, type EntityType } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';

const TABS: { value: EntityType | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'الكل', icon: 'apps' },
  { value: 'LISTING', label: 'سيارات', icon: 'directions_car' },
  { value: 'JOB', label: 'وظائف', icon: 'work' },
  { value: 'SPARE_PART', label: 'قطع غيار', icon: 'settings' },
  { value: 'CAR_SERVICE', label: 'خدمات', icon: 'build' },
  { value: 'TRANSPORT', label: 'نقل', icon: 'local_shipping' },
  { value: 'TRIP', label: 'رحلات', icon: 'route' },
  { value: 'INSURANCE', label: 'تأمين', icon: 'shield' },
];

const ENTITY_ROUTES: Record<string, string> = {
  LISTING: '/cars',
  JOB: '/jobs',
  SPARE_PART: '/parts',
  CAR_SERVICE: '/services',
  TRANSPORT: '/transport',
  TRIP: '/trips',
  INSURANCE: '/insurance',
};

function GenericFavCard({ entityType, entityId, entity, tabIcon }: {
  entityType: string;
  entityId: string;
  entity?: { title: string; image: string | null } | null;
  tabIcon: string;
}) {
  const route = ENTITY_ROUTES[entityType] || '/';
  const toggleFav = useToggleFavorite();
  const tabLabel = TABS.find(t => t.value === entityType)?.label;

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleFav.mutate({ entityType: entityType as EntityType, entityId });
  }

  return (
    <Link
      href={`${route}/${entityId}`}
      className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300"
    >
      <div className="aspect-[16/10] bg-surface-container-low relative overflow-hidden">
        {entity?.image ? (
          <Image
            src={getImageUrl(entity.image) || ''}
            alt={entity?.title || ''}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant/25">
            <span className="material-symbols-outlined text-4xl">{tabIcon}</span>
          </div>
        )}
        {/* Remove button */}
        <button
          onClick={handleRemove}
          className="absolute top-2 left-2 z-10 w-8 h-8 flex items-center justify-center"
          aria-label="إزالة من المفضلة"
        >
          <span
            className="material-symbols-outlined text-[22px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] text-red-500 transition-all duration-200 hover:scale-110"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </button>
        {/* Category badge */}
        <span className="absolute top-2 right-2 bg-primary/90 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
          {tabLabel}
        </span>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-sm text-on-surface line-clamp-2 leading-snug">{entity?.title || 'عنصر محذوف'}</h3>
      </div>
    </Link>
  );
}

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<EntityType | 'ALL'>('ALL');
  const filterType = activeTab === 'ALL' ? undefined : activeTab;
  const { data, isLoading, isError, refetch } = useFavorites(filterType);
  const items = data?.items ?? [];
  const totalCount = data?.meta?.total ?? 0;

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* ── Hero Header ── */}
        <div className="relative bg-gradient-to-bl from-[#004ac6] via-[#2563eb] to-[#0B2447] pt-24 pb-12 md:pt-28 md:pb-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-white/80 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              <h1 className="text-3xl md:text-4xl font-black text-white">المفضلة</h1>
            </div>
            <p className="text-white/60 text-sm md:text-base">
              {totalCount > 0 ? `${totalCount} عنصر محفوظ` : 'العناصر التي حفظتها لتعود إليها لاحقاً'}
            </p>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 pb-16 relative z-10">
          {/* ── Filter Tabs ── */}
          <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/10 p-3 mb-8">
            <div className="flex flex-wrap gap-1.5">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.value
                      ? 'bg-primary text-on-primary shadow-lg'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Content ── */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 animate-pulse">
                  <div className="aspect-[16/10] bg-surface-container-high" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-surface-container-high rounded-full w-4/5" />
                    <div className="h-3 bg-surface-container-high rounded-full w-3/5" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-surface-container-high rounded-full w-16" />
                      <div className="h-6 bg-surface-container-high rounded-full w-16" />
                      <div className="h-6 bg-surface-container-high rounded-full w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : items.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((fav) => {
                if (fav.entityType === 'LISTING' && fav.listing) {
                  const item = fav.listing;
                  const img = item.images?.find((i: any) => i.isPrimary) ?? item.images?.[0];
                  return (
                    <VehicleCard
                      key={fav.id}
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
                      condition={item.condition}
                      governorate={item.governorate}
                      imageUrl={getImageUrl(img?.url)}
                      listingType={item.listingType}
                      dailyPrice={item.dailyPrice}
                    />
                  );
                }

                return (
                  <GenericFavCard
                    key={fav.id}
                    entityType={fav.entityType}
                    entityId={fav.entityId}
                    entity={fav.entity}
                    tabIcon={TABS.find(t => t.value === fav.entityType)?.icon || 'bookmark'}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
              </div>
              <h3 className="text-xl font-black text-on-surface mb-2">لا توجد مفضلات</h3>
              <p className="text-on-surface-variant text-sm mb-6 text-center max-w-xs">احفظ العناصر التي تعجبك بالضغط على القلب لتعود إليها لاحقاً</p>
              <Link href="/listings" className="bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-base">search</span>
                تصفح الإعلانات
              </Link>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </AuthGuard>
  );
}
