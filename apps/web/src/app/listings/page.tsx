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
import { BottomSheet } from '@/components/ui/bottom-sheet';
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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
  const bodyType = searchParams.get('bodyType') || '';

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
    if (bodyType) p.bodyType = bodyType;
    if (maxPrice) p.priceMax = maxPrice;
    if (sortBy) {
      const [field, order] = sortBy.split('_');
      p.sortBy = field;
      if (order) p.sortOrder = order;
    }
    return p;
  }, [page, search, fuelType, condition, bodyType, maxPrice, sortBy, listingType]);

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
          bodyType: null, exteriorColor: null, interior: null, features: [], engineSize: null, horsepower: null, doors: null, seats: null, driveType: null,
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

  const bodyTypes = [
    { value: 'SEDAN', label: 'سيدان', icon: 'directions_car' },
    { value: 'SUV', label: 'دفع رباعي', icon: 'airport_shuttle' },
    { value: 'HATCHBACK', label: 'هاتشباك', icon: 'electric_car' },
    { value: 'TRUCK', label: 'بيك أب', icon: 'local_shipping' },
    { value: 'COUPE', label: 'كوبيه', icon: 'sports_score' },
    { value: 'VAN', label: 'ڤان', icon: 'commute' },
    { value: 'CONVERTIBLE', label: 'مكشوفة', icon: 'no_crash' },
    { value: 'WAGON', label: 'واغن', icon: 'rv_hookup' },
  ];

  function applyBodyFilter(body: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (bodyType === body) p.delete('bodyType'); else p.set('bodyType', body);
    p.set('page', '1');
    router.push(`/listings?${p.toString()}`);
  }

  return (
    <>
      <Navbar />

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#004ac6] via-[#2563eb] to-[#0B2447]" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-20%] right-0 w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute bottom-[-20%] left-0 w-[50vw] md:w-[400px] h-[50vw] md:h-[400px] rounded-full bg-blue-300/[0.08] blur-3xl" />

        <div className="relative z-10 pt-16 pb-6 sm:pt-24 sm:pb-10 md:pt-28 md:pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-3 drop-shadow-sm">
              اختر سيارتك من سوق وان
            </h1>
            <p className="text-white/70 text-xs sm:text-sm md:text-base mb-4 sm:mb-8 max-w-lg mx-auto">
              سيارات جديدة ومستعملة للبيع والإيجار في سلطنة عمان
            </p>

            {/* Listing Type Tabs */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {[
                { value: '', label: 'الكل', icon: 'apps' },
                { value: 'SALE', label: 'للبيع', icon: 'sell' },
                { value: 'RENTAL', label: 'للإيجار', icon: 'car_rental' },
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setListingType(tab.value)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    listingType === tab.value
                      ? 'bg-white text-primary shadow-lg'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm sm:text-base">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Box — Glass */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 shadow-[0_8px_40px_rgba(0,0,0,0.2)]">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex-1 flex items-center gap-2 bg-white/90 dark:bg-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 focus-within:ring-2 focus-within:ring-white/40 transition-all">
                    <span className="material-symbols-outlined text-primary/50 dark:text-white/40 text-xl shrink-0">search</span>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="ابحث عن ماركة، موديل، سنة..."
                      className="flex-1 bg-transparent text-sm font-medium text-on-surface dark:text-white placeholder:text-on-surface-variant/50 dark:placeholder:text-white/40 focus:outline-none min-w-0"
                    />
                    {searchInput && (
                      <button type="button" onClick={() => setSearchInput('')} className="text-on-surface-variant/40 hover:text-on-surface-variant shrink-0">
                        <span className="material-symbols-outlined text-lg">close</span>
                      </button>
                    )}
                  </div>
                  <button type="submit" className="shrink-0 bg-white text-primary px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 font-black text-xs sm:text-sm rounded-lg sm:rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all flex items-center gap-1.5 shadow-lg">
                    <span className="material-symbols-outlined text-base">search</span>
                    <span className="hidden sm:inline">بحث</span>
                  </button>
                </div>

                {/* Quick filter chips */}
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 sm:gap-2 sm:flex-wrap mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                  {conditionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedCondition(selectedCondition === opt.value ? '' : opt.value)}
                      className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all ${
                        selectedCondition === opt.value
                          ? 'bg-white text-primary'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                  <span className="w-px h-6 bg-white/20 mx-1 self-center" />
                  {fuelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleFuel(opt.value)}
                      className={`shrink-0 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all ${
                        selectedFuels.includes(opt.value)
                          ? 'bg-white text-primary'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </form>

            {/* Stats */}
            <div className="flex justify-center gap-3 sm:gap-6 mt-4 sm:mt-6">
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="material-symbols-outlined text-sm">directions_car</span>
                <span className="text-xs font-bold text-white">{data?.meta.total ?? '...'}</span>
                <span className="text-xs">إعلان</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="text-xs">بائعين موثوقين</span>
              </div>
              <Link href="/add-listing" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span className="text-xs font-bold">أضف إعلانك مجاناً</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BROWSE BY TYPE ═══════════ */}
      <section className="bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant/10" dir="rtl">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-7 w-1 bg-primary rounded-full" />
            <h2 className="text-xl font-black text-on-surface">تصفح حسب نوع السيارة</h2>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2 sm:gap-3">
            {bodyTypes.map((bt) => (
              <button
                key={bt.value}
                onClick={() => applyBodyFilter(bt.value)}
                className={`group flex flex-col items-center gap-1.5 sm:gap-2.5 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all duration-200 ${
                  bodyType === bt.value
                    ? 'bg-primary/10 dark:bg-primary/20 border-primary/30 shadow-sm'
                    : 'bg-surface-container-low/50 dark:bg-surface-container/50 border-outline-variant/10 hover:border-primary/20 hover:shadow-sm'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl sm:text-3xl transition-colors ${
                  bodyType === bt.value ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'
                }`}>{bt.icon}</span>
                <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight transition-colors ${
                  bodyType === bt.value ? 'text-primary' : 'text-on-surface-variant'
                }`}>{bt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ MAIN LISTINGS ═══════════ */}
      <main className="max-w-7xl mx-auto px-6 py-8" dir="rtl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Mobile Filter Toggle ── */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl px-4 py-2.5 min-h-[44px] text-sm font-black text-on-surface-variant hover:border-primary/30 transition-all"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            تصفية النتائج
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>

          {/* ── Mobile Bottom Sheet Filters ── */}
          <BottomSheet open={showMobileFilters} onClose={() => setShowMobileFilters(false)} title="تصفية النتائج">
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">السعر الأقصى (ر.ع)</label>
                <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="مثال: 15000" className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">الحالة</label>
                <div className="space-y-1.5">{conditionOptions.map((opt) => (<label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group py-1.5"><input type="radio" name="condition-mobile" checked={selectedCondition === opt.value} onChange={() => setSelectedCondition(selectedCondition === opt.value ? '' : opt.value)} className="w-4 h-4 accent-primary" /><span className="text-sm font-medium text-on-surface">{opt.label}</span></label>))}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">نوع الوقود</label>
                <div className="flex flex-wrap gap-2">{fuelOptions.map((opt) => (<button key={opt.value} onClick={() => toggleFuel(opt.value)} className={`px-3.5 py-2 min-h-[44px] text-xs font-bold rounded-lg transition-all ${selectedFuels.includes(opt.value) ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant'}`}>{opt.label}</button>))}</div>
              </div>
              <button onClick={() => { applyFilters(); setShowMobileFilters(false); }} className="bg-primary text-on-primary w-full py-3 min-h-[44px] text-sm font-black rounded-xl hover:brightness-110 transition-colors">تطبيق الفلاتر</button>
            </div>
          </BottomSheet>

          {/* ── Desktop Sidebar Filters ── */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-5 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl p-5 shadow-sm">
              <div>
                <h2 className="text-lg font-black mb-0.5">تصفية النتائج</h2>
                <p className="text-on-surface-variant text-xs">خصص بحثك</p>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">السعر الأقصى (ر.ع)</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="مثال: 15000"
                  className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm"
                />
              </div>

              {/* Condition */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">الحالة</label>
                <div className="space-y-1.5">
                  {conditionOptions.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group py-1">
                      <input
                        type="radio"
                        name="condition-sidebar"
                        checked={selectedCondition === opt.value}
                        onChange={() => setSelectedCondition(selectedCondition === opt.value ? '' : opt.value)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">نوع الوقود</label>
                <div className="flex flex-wrap gap-1.5">
                  {fuelOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => toggleFuel(opt.value)}
                      className={`px-3.5 py-2 min-h-[44px] text-xs font-bold rounded-lg transition-all ${
                        selectedFuels.includes(opt.value)
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={applyFilters} className="bg-primary text-on-primary w-full py-2.5 text-sm font-black rounded-xl hover:brightness-110 transition-colors">
                تطبيق الفلاتر
              </button>

              <Link
                href="/add-listing"
                className="block bg-on-surface text-surface font-black text-center py-2.5 rounded-xl hover:bg-primary hover:text-on-primary transition-all text-sm"
              >
                أضف إعلانك
              </Link>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  {listingType === 'SALE' ? 'سيارات للبيع' : listingType === 'RENTAL' ? 'سيارات للإيجار' : 'جميع السيارات'}
                </h2>
                <p className="text-on-surface-variant text-sm mt-0.5">
                  {data ? `${data.meta.total} إعلان متاح` : 'تصفح أحدث إعلانات السيارات'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex border border-outline-variant/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2.5 min-h-[44px] text-xs font-black flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className="material-symbols-outlined text-sm">view_list</span>
                    قائمة
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2.5 min-h-[44px] text-xs font-black flex items-center gap-1 transition-all ${viewMode === 'map' ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className="material-symbols-outlined text-sm">map</span>
                    خريطة
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl py-2 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-xs font-bold"
                >
                  <option value="">الأحدث</option>
                  <option value="price_asc">السعر: الأقل</option>
                  <option value="price_desc">السعر: الأعلى</option>
                  <option value="year_desc">السنة: الأحدث</option>
                </select>
              </div>
            </div>

            {/* Radius Filter (when map view) */}
            {viewMode === 'map' && (
              <div className="mb-6 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-2xl p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined text-primary">radar</span>
                  <span className="text-sm font-black text-on-surface">نطاق البحث:</span>
                  <input type="range" min={5} max={200} step={5} value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="flex-1 accent-primary" />
                  <span className="text-sm font-black text-primary min-w-[50px]">{radius} كم</span>
                </div>
                {!userLocation && (
                  <button onClick={requestLocation} className="flex items-center gap-2 bg-on-surface text-surface px-4 py-2 text-xs font-black rounded-xl hover:bg-primary hover:text-on-primary transition-all">
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
                      className="w-10 h-10 border border-outline-variant/10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-all disabled:opacity-30"
                    >
                      <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      const p = i + 1;
                      return (
                        <button
                          key={p}
                          onClick={() => goToPage(p)}
                          className={`w-10 h-10 flex items-center justify-center font-black text-sm rounded-xl transition-all ${
                            p === currentPage
                              ? 'bg-primary text-on-primary'
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
                          className={`w-10 h-10 flex items-center justify-center font-black text-sm rounded-xl transition-all ${
                            currentPage === totalPages
                              ? 'bg-primary text-on-primary'
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
                      className="w-10 h-10 border border-outline-variant/10 rounded-xl flex items-center justify-center hover:bg-surface-container transition-all disabled:opacity-30"
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
