'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { RentalCard } from '@/features/rentals/components/rental-card';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { useListings } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { fuelOptions, sortOptions } from '@/lib/constants/mappings';
import { useTranslations } from 'next-intl';

export default function RentalsPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-7xl mx-auto px-6"><ListingSkeleton count={6} /></main></>}>
      <RentalsContent />
    </Suspense>
  );
}

function RentalsContent() {
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const fuelOpts = fuelOptions(tm);
  const sortOpts = sortOptions(tm);
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const sortBy = searchParams.get('sortBy') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [selectedFuels, setSelectedFuels] = useState<string[]>(fuelType ? fuelType.split(',') : []);

  const params = useMemo(() => {
    const p: Record<string, string> = { page, limit: '12', listingType: 'RENTAL' };
    if (search) p.search = search;
    if (fuelType) p.fuelType = fuelType;
    if (sortBy) {
      const [field, order] = sortBy.split('_');
      if (field) p.sortBy = field;
      if (order) p.sortOrder = order;
    }
    return p;
  }, [page, search, fuelType, sortBy]);

  const { data, isLoading, isError, refetch } = useListings(params);

  function applyFilters() {
    const sp = new URLSearchParams();
    if (searchInput) sp.set('search', searchInput);
    if (selectedFuels.length) sp.set('fuelType', selectedFuels.join(','));
    if (sortBy) sp.set('sortBy', sortBy);
    router.push(`/rentals?${sp.toString()}`);
  }

  function toggleFuel(f: string) {
    setSelectedFuels((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
  }

  const items = data?.items ?? [];
  const meta = data?.meta;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-1">
              <span className="material-symbols-outlined text-primary align-middle text-3xl ms-2">car_rental</span>
              {tp('rentalsTitle')}
            </h1>
            <p className="text-on-surface-variant">{tp('rentalsSubtitle')}</p>
          </div>
          <Link href="/add-listing" className="btn-success px-6 py-2.5 text-sm font-black shrink-0 hover:brightness-110 transition-colors">
            <span className="material-symbols-outlined text-lg align-middle ms-1">add</span>
            {tp('rentalsAddRental')}
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 md:p-6 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute end-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                placeholder={tp('rentalsSearch')}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 py-3 pe-10 ps-4 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm"
               
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => {
                const sp = new URLSearchParams(searchParams);
                if (e.target.value) sp.set('sortBy', e.target.value); else sp.delete('sortBy');
                router.push(`/rentals?${sp.toString()}`);
              }}
              className="bg-surface-container border border-outline-variant/10 py-3 px-4 text-sm min-w-[160px]"
            >
              <option value="">{tp('sortLabel')}</option>
              {sortOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={applyFilters} className="bg-emerald-500 text-white px-6 py-3 text-sm font-black rounded-lg hover:brightness-110 transition-colors">
              {tp('rentalsSearchBtn')}
            </button>
          </div>

          {/* Fuel filter chips */}
          <div className="flex flex-wrap gap-2">
            {fuelOpts.map((f) => (
              <button
                key={f.value}
                onClick={() => { toggleFuel(f.value); }}
                className={`px-4 py-2 text-xs font-black transition-all ${
                  selectedFuels.includes(f.value)
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <ListingSkeleton count={6} />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="car_rental"
            title={tp('rentalsEmpty')}
            description={tp('rentalsEmptySub')}
          />
        ) : (
          <>
            <p className="text-sm text-on-surface-variant mb-6">{tp('rentalsAvailable', { count: meta?.total ?? 0 })}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
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

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const sp = new URLSearchParams(searchParams);
                      sp.set('page', String(p));
                      router.push(`/rentals?${sp.toString()}`);
                    }}
                    className={`w-10 h-10 text-sm font-black transition-all ${
                      p === Number(page)
                        ? 'bg-on-surface text-surface'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
