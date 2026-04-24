'use client';

import { Link } from '@/i18n/navigation';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { CardSkeleton } from '@/components/loading-skeleton';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations } from 'next-intl';

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
  const tp = useTranslations('pages');
  return (
    <section className="py-6 sm:py-10 bg-surface-container-low dark:bg-surface-dim">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="h-6 sm:h-8 w-1 bg-primary" />
              <h2 className="text-base sm:text-xl md:text-3xl font-black">{tp('rentalTitle')}</h2>
            </div>
            <p className="text-on-surface-variant text-xs sm:text-sm">{tp('rentalSubtitle')}</p>
          </div>
          <Link href="/browse/cars?listingType=RENTAL" className="text-primary font-bold text-xs sm:text-sm hover:underline transition-colors shrink-0">
            {tp('rentalViewAll')}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {items.map((item) => {
              const img = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
              return (
                <VehicleCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  make={item.make}
                  model={item.model}
                  year={item.year}
                  price={item.dailyPrice || 0}
                  dailyPrice={item.dailyPrice}
                  monthlyPrice={item.monthlyPrice}
                  currency={item.currency}
                  mileage={item.mileage}
                  fuelType={item.fuelType}
                  transmission={item.transmission}
                  governorate={item.governorate}
                  imageUrl={getImageUrl(img?.url)}
                  listingType="RENTAL"
                  href={`/rental/car/${item.id}`}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">car_rental</span>
            <p className="text-on-surface-variant font-medium mb-4">{tp('rentalEmpty')}</p>
            <Link href="/add-listing" className="btn-success px-6 py-2.5 text-sm font-black inline-block hover:brightness-110 transition-colors">
              {tp('rentalAddCar')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
