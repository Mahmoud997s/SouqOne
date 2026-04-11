'use client';

import Link from 'next/link';
import { RentalCard } from '@/features/rentals/components/rental-card';
import { CardSkeleton } from '@/components/loading-skeleton';
import { getImageUrl } from '@/lib/image-utils';

interface RentalItem {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  dailyPrice?: string | number | null;
  weeklyPrice?: string | number | null;
  monthlyPrice?: string | number | null;
  currency: string;
  mileage?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  governorate?: string | null;
  images?: { url: string; isPrimary?: boolean }[];
  withDriver?: boolean;
  insuranceIncluded?: boolean;
  deliveryAvailable?: boolean;
}

interface RentalSectionProps {
  items: RentalItem[];
  isLoading: boolean;
}

export function RentalSection({ items, isLoading }: RentalSectionProps) {
  return (
    <section className="py-20 bg-surface-container-low dark:bg-surface-dim">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-primary" />
              <h2 className="text-xl md:text-3xl font-black">سيارات للإيجار</h2>
            </div>
            <p className="text-on-surface-variant text-sm">استأجر سيارتك المفضلة بأفضل الأسعار في سلطنة عمان</p>
          </div>
          <Link href="/rentals" className="text-primary font-bold text-sm hover:underline transition-colors shrink-0">
            عرض الكل ←
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item) => {
              const img = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
              return (
                <RentalCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  make={item.make}
                  model={item.model}
                  year={item.year}
                  dailyPrice={item.dailyPrice}
                  weeklyPrice={item.weeklyPrice}
                  monthlyPrice={item.monthlyPrice}
                  currency={item.currency}
                  mileage={item.mileage}
                  fuelType={item.fuelType}
                  transmission={item.transmission}
                  governorate={item.governorate}
                  imageUrl={getImageUrl(img?.url)}
                  withDriver={item.withDriver}
                  insuranceIncluded={item.insuranceIncluded}
                  deliveryAvailable={item.deliveryAvailable}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">car_rental</span>
            <p className="text-on-surface-variant font-medium mb-4">لا توجد سيارات للإيجار حالياً</p>
            <Link href="/add-listing" className="btn-green px-6 py-3 text-sm font-black inline-block hover:brightness-110 transition-colors">
              أضف سيارة للإيجار
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
