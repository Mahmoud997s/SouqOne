'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { useFavorites, type EntityType } from '@/lib/api';
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

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<EntityType | 'ALL'>('ALL');
  const filterType = activeTab === 'ALL' ? undefined : activeTab;
  const { data, isLoading, isError, refetch } = useFavorites(filterType);
  const items = data?.items ?? [];

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-6" dir="rtl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black">المفضلة</h1>
          <p className="text-on-surface-variant text-sm mt-1">العناصر التي حفظتها لتعود إليها لاحقاً</p>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.value
                  ? 'bg-primary text-on-primary shadow-ambient'
                  : 'bg-surface border border-outline text-on-surface hover:border-primary'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-surface-container-high aspect-[4/3] mb-4" />
                <div className="space-y-2 px-1">
                  <div className="h-5 bg-surface-container-high rounded-full w-3/4" />
                  <div className="h-4 bg-surface-container-high rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((fav) => {
              // Listing favorites → render full VehicleCard
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

              // Generic favorites → render simple card
              const route = ENTITY_ROUTES[fav.entityType] || '/';
              return (
                <Link
                  key={fav.id}
                  href={`${route}/${fav.entityId}`}
                  className="glass-card rounded-xl overflow-hidden group relative"
                >
                  <div className="aspect-[4/3] bg-surface-container-low relative flex items-center justify-center">
                    {fav.entity?.image ? (
                      <img src={getImageUrl(fav.entity.image) || ''} alt={fav.entity?.title || ''} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">
                        {TABS.find(t => t.value === fav.entityType)?.icon || 'bookmark'}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-on-surface line-clamp-2 mb-1">{fav.entity?.title || 'عنصر محذوف'}</h3>
                    <span className="text-[11px] font-bold text-primary">
                      {TABS.find(t => t.value === fav.entityType)?.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="favorite"
            title="لا توجد مفضلات"
            description="احفظ العناصر التي تعجبك لتعود إليها لاحقاً."
            action={{ label: 'تصفح الإعلانات', href: '/listings' }}
          />
        )}
      </main>
      <Footer />
    </AuthGuard>
  );
}
