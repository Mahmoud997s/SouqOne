'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { useListings, useSearch, type SearchHit } from '@/lib/api';
import { haversineDistance } from '@/lib/geo-utils';
import { getImageUrl } from '@/lib/image-utils';
import { FUEL_OPTIONS, CONDITION_OPTIONS } from '@/lib/constants/mappings';

const ListingsMap = dynamic(() => import('@/components/map/listings-map'), { ssr: false });

export default function ListingsPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[1440px] mx-auto px-4 md:px-8"><ListingSkeleton count={6} /></main></>}>
      <ListingsContent />
    </Suspense>
  );
}

const fuelOptions = FUEL_OPTIONS;

const conditionOptions = CONDITION_OPTIONS.filter(o => ['NEW', 'USED', 'LIKE_NEW'].includes(o.value));

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(50);

  useEffect(() => {
    const cachedLat = sessionStorage.getItem('userLat');
    const cachedLng = sessionStorage.getItem('userLng');
    if (cachedLat && cachedLng) {
      setUserLocation({ lat: parseFloat(cachedLat), lng: parseFloat(cachedLng) });
    }
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        sessionStorage.setItem('userLat', String(loc.lat));
        sessionStorage.setItem('userLng', String(loc.lng));
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const fuelType = searchParams.get('fuelType') || '';
  const condition = searchParams.get('condition') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const listingType = searchParams.get('listingType') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [selectedFuels, setSelectedFuels] = useState<string[]>(fuelType ? fuelType.split(',') : []);
  const [selectedCondition, setSelectedCondition] = useState(condition);
  const [priceMax, setPriceMax] = useState(maxPrice);

  const params = useMemo(() => {
    const p: Record<string, string> = { page, limit: '12' };
    if (listingType) p.listingType = listingType;
    if (search) p.search = search;
    if (fuelType) p.fuelType = fuelType;
    if (condition) p.condition = condition;
    if (maxPrice) p.priceMax = maxPrice;
    if (sortBy) {
      const [field, order] = sortBy.split('_');
      p.sortBy = field;
      if (order) p.sortOrder = order;
    }
    return p;
  }, [page, search, fuelType, condition, maxPrice, sortBy, listingType]);

  function setListingType(type: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (type) p.set('listingType', type); else p.delete('listingType');
    p.set('page', '1');
    router.push(`/listings?${p.toString()}`);
  }

  // Use Meilisearch when there's a search query, otherwise use Prisma
  const meiliParams = useMemo(() => {
    const p: Record<string, any> = { entityType: 'listings', page: parseInt(page), limit: 12 };
    if (search) p.q = search;
    if (condition) p.condition = condition;
    if (maxPrice) p.maxPrice = parseInt(maxPrice);
    if (listingType) p.listingType = listingType;
    if (sortBy) {
      if (sortBy === 'price_asc') p.sortBy = 'price:asc';
      else if (sortBy === 'price_desc') p.sortBy = 'price:desc';
      else p.sortBy = 'newest';
    }
    return p;
  }, [page, search, condition, maxPrice, sortBy, listingType]);

  const usesMeili = !!search;
  const meiliResult = useSearch(usesMeili ? meiliParams : {});
  const prismaResult = useListings(params);

  // Normalize Meilisearch results to match ListingItem shape
  const data = useMemo(() => {
    if (usesMeili && meiliResult.data) {
      return {
        items: meiliResult.data.items.map((hit: SearchHit) => ({
          id: hit.id,
          title: hit.title,
          slug: hit.slug || '',
          make: hit.make || '',
          model: hit.model || '',
          year: hit.year || 0,
          price: String(hit.price ?? '0'),
          currency: hit.currency || 'OMR',
          mileage: (hit as any).mileage ?? null,
          fuelType: (hit as any).fuelType ?? null,
          transmission: (hit as any).transmission ?? null,
          condition: hit.condition ?? null,
          governorate: hit.governorate ?? null,
          city: hit.city ?? null,
          description: hit.description || '',
          isPriceNegotiable: false,
          listingType: (hit as any).listingType ?? 'SALE',
          dailyPrice: (hit as any).dailyPrice ?? null,
          weeklyPrice: (hit as any).weeklyPrice ?? null,
          monthlyPrice: (hit as any).monthlyPrice ?? null,
          viewCount: (hit as any).viewCount ?? 0,
          status: hit.status || 'ACTIVE',
          createdAt: typeof hit.createdAt === 'number' ? new Date(hit.createdAt).toISOString() : (hit.createdAt || ''),
          latitude: null,
          longitude: null,
          bodyType: null, exteriorColor: null, interior: null, engineSize: null, horsepower: null, doors: null, seats: null, driveType: null,
          images: hit.imageUrl ? [{ id: 'meili', url: hit.imageUrl, isPrimary: true }] : [],
          seller: { id: '', username: '', displayName: null, avatarUrl: null, phone: null, governorate: null, isVerified: false, createdAt: '' },
        })),
        meta: meiliResult.data.meta,
      };
    }
    return prismaResult.data ?? null;
  }, [usesMeili, meiliResult.data, prismaResult.data]);

  const isLoading = usesMeili ? meiliResult.isLoading : prismaResult.isLoading;
  const isError = usesMeili ? meiliResult.isError : prismaResult.isError;
  const refetch = usesMeili ? meiliResult.refetch : prismaResult.refetch;

  function applyFilters() {
    const p = new URLSearchParams();
    if (listingType) p.set('listingType', listingType);
    if (searchInput) p.set('search', searchInput);
    if (selectedFuels.length) p.set('fuelType', selectedFuels.join(','));
    if (selectedCondition) p.set('condition', selectedCondition);
    if (priceMax) p.set('maxPrice', priceMax);
    if (sortBy) p.set('sortBy', sortBy);
    p.set('page', '1');
    router.push(`/listings?${p.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  function toggleFuel(fuel: string) {
    setSelectedFuels((prev) =>
      prev.includes(fuel) ? prev.filter((f) => f !== fuel) : [...prev, fuel],
    );
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/listings?${params.toString()}`);
  }

  function setSort(val: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', val);
    params.set('page', '1');
    router.push(`/listings?${params.toString()}`);
  }

  const currentPage = parseInt(page);
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Sidebar Filters ── */}
          <aside className="lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-6 bg-surface-container-lowest border border-outline-variant/10 p-6 shadow-sm">
              <div>
                <h2 className="text-xl font-black mb-1">الفلاتر</h2>
                <p className="text-on-surface-variant text-sm">تخصيص نتائج البحث</p>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block mb-3">السعر الأقصى</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="مثال: 15000"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block mb-3">الحالة</label>
                <div className="space-y-2">
                  {conditionOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="condition"
                        checked={selectedCondition === opt.value}
                        onChange={() => setSelectedCondition(selectedCondition === opt.value ? '' : opt.value)}
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="text-xs font-black text-on-surface-variant uppercase tracking-widest block mb-3">نوع الوقود</label>
                <div className="flex flex-wrap gap-2">
                  {fuelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFuel(opt.value)}
                      className={`px-4 py-2 text-sm font-black transition-all ${
                        selectedFuels.includes(opt.value)
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={applyFilters} className="bg-primary text-on-primary w-full py-3 text-sm font-black hover:brightness-110 transition-colors">
                تطبيق الفلاتر
              </button>

              <Link
                href="/add-listing"
                className="block bg-on-surface text-surface font-black text-center py-3 hover:bg-primary hover:text-on-primary transition-all text-sm"
              >
                أضف إعلانك
              </Link>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Listing type tabs */}
            <div className="flex items-center gap-1 mb-6 border-b border-outline-variant/10">
              {[
                { value: '', label: 'الكل', icon: 'apps' },
                { value: 'SALE', label: 'للبيع', icon: 'sell' },
                { value: 'RENTAL', label: 'للإيجار', icon: 'car_rental' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setListingType(tab.value)}
                  className={`flex items-center gap-1.5 px-5 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
                    listingType === tab.value
                      ? 'text-primary border-primary'
                      : 'text-on-surface-variant border-transparent hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-black">السوق</h1>
                <p className="text-on-surface-variant text-sm mt-1">
                  {data ? `${data.meta.total} إعلان متاح` : 'تصفح أحدث إعلانات السيارات'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Map/List Toggle */}
                <div className="flex border border-outline-variant/10 overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2.5 text-sm font-black flex items-center gap-1.5 transition-all ${viewMode === 'list' ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className="material-symbols-outlined text-base">view_list</span>
                    قائمة
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2.5 text-sm font-black flex items-center gap-1.5 transition-all ${viewMode === 'map' ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className="material-symbols-outlined text-base">map</span>
                    خريطة
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant/10 py-2.5 px-4 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm font-bold"
                >
                  <option value="">الأحدث</option>
                  <option value="price_asc">السعر: الأقل</option>
                  <option value="price_desc">السعر: الأعلى</option>
                  <option value="year_desc">السنة: الأحدث</option>
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-0 mb-8">
              <div className="relative flex-1">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">search</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="ابحث عن ماركة، موديل..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 py-3 pr-12 pl-4 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm"
                />
              </div>
              <button type="submit" className="bg-primary text-on-primary px-8 py-3 text-sm font-black hover:brightness-110 transition-colors">بحث</button>
            </form>

            {/* Radius Filter (when map view or location available) */}
            {viewMode === 'map' && (
              <div className="mb-6 bg-surface-container-lowest border border-outline-variant/10 p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined text-primary">radar</span>
                  <span className="text-sm font-black text-on-surface">نطاق البحث:</span>
                  <input
                    type="range"
                    min={5}
                    max={200}
                    step={5}
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="flex-1 accent-primary"
                  />
                  <span className="text-sm font-black text-primary min-w-[50px]">{radius} كم</span>
                </div>
                {!userLocation && (
                  <button
                    onClick={requestLocation}
                    className="flex items-center gap-2 bg-on-surface text-surface px-4 py-2 text-xs font-black hover:bg-primary hover:text-on-primary transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">my_location</span>
                    حدد موقعي
                  </button>
                )}
              </div>
            )}

            {/* Results */}
            {isLoading ? (
              <ListingSkeleton count={6} />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : data && data.items.length > 0 ? (
              viewMode === 'map' ? (
                /* Map View */
                <ListingsMap
                  height="h-[600px]"
                  userLocation={userLocation}
                  listings={data.items
                    .filter(item => {
                      if (!item.latitude || !item.longitude) return false;
                      if (userLocation) {
                        const dist = haversineDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude);
                        return dist <= radius;
                      }
                      return true;
                    })
                    .map(item => {
                      const img = item.images?.find(i => i.isPrimary) ?? item.images?.[0];
                      return {
                        id: item.id,
                        title: item.title,
                        price: item.price,
                        currency: item.currency,
                        latitude: item.latitude!,
                        longitude: item.longitude!,
                        listingType: item.listingType,
                        imageUrl: getImageUrl(img?.url),
                        governorate: item.governorate,
                        make: item.make,
                        model: item.model,
                        year: item.year,
                      };
                    })}
                />
              ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {data.items.map((item) => {
                    const primaryImage = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
                    return (
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
                        imageUrl={getImageUrl(primaryImage?.url)}
                        viewCount={item.viewCount}
                        createdAt={item.createdAt}
                        isVerified={item.seller?.isVerified}
                        isPriceNegotiable={item.isPriceNegotiable}
                        listingType={item.listingType}
                        dailyPrice={item.dailyPrice}
                        monthlyPrice={item.monthlyPrice}
                      />
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="w-11 h-11 border border-outline-variant/10 flex items-center justify-center hover:bg-surface-container transition-all disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`w-11 h-11 flex items-center justify-center font-black text-sm transition-all ${
                            p === currentPage
                              ? 'bg-on-surface text-surface'
                              : 'border border-outline-variant/10 text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="text-on-surface-variant">...</span>
                        <button
                          onClick={() => goToPage(totalPages)}
                          className={`w-11 h-11 flex items-center justify-center font-black text-sm transition-all ${
                            currentPage === totalPages
                              ? 'bg-on-surface text-surface'
                              : 'border border-outline-variant/10 text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="w-11 h-11 border border-outline-variant/10 flex items-center justify-center hover:bg-surface-container transition-all disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                  </div>
                )}
              </>
              )
            ) : (
              <EmptyState
                icon="search_off"
                title="لا توجد نتائج"
                description={search ? `لم نجد نتائج لـ "${search}"` : 'لا توجد إعلانات حالياً'}
                action={{ label: 'أضف إعلان', href: '/add-listing' }}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
