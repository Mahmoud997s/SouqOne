'use client';

import Link from 'next/link';
import { CardSkeleton } from '@/components/loading-skeleton';
import { getImageUrl } from '@/lib/image-utils';
import { VehicleCard } from '@/features/ads/components/vehicle-card';

interface ListingItem {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: string | number;
  currency: string;
  mileage?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  condition?: string | null;
  governorate?: string | null;
  images?: { url: string; isPrimary?: boolean }[];
  viewCount?: number;
  createdAt?: string;
  isPriceNegotiable?: boolean;
  listingType?: string;
  dailyPrice?: string | number | null;
  monthlyPrice?: string | number | null;
  seller?: { isVerified?: boolean };
}

interface FeaturedShowroomProps {
  items: ListingItem[];
  isLoading: boolean;
}

function getImg(item: ListingItem) {
  const img = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
  return getImageUrl(img?.url) ?? null;
}

export function FeaturedShowroom({ items, isLoading }: FeaturedShowroomProps) {
  return (
    <section className="bg-surface-container-low dark:bg-surface-dim py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-between items-end gap-2 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-primary" />
              <h2 className="text-xl md:text-3xl font-black">أحدث السيارات</h2>
            </div>
            <p className="text-on-surface-variant text-sm">سيارات جديدة ومستعملة للبيع والإيجار في سلطنة عمان</p>
          </div>
          <Link
            href="/listings"
            className="text-primary font-bold text-sm hover:underline transition-colors"
          >
            عرض الكل ←
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <VehicleCard
                key={item.id}
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
                imageUrl={getImg(item)}
                viewCount={item.viewCount}
                createdAt={item.createdAt}
                isVerified={item.seller?.isVerified}
                isPriceNegotiable={item.isPriceNegotiable}
                listingType={item.listingType}
                dailyPrice={item.dailyPrice}
                monthlyPrice={item.monthlyPrice}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">directions_car</span>
            <p className="font-medium">لا توجد إعلانات حالياً</p>
          </div>
        )}
      </div>
    </section>
  );
}
