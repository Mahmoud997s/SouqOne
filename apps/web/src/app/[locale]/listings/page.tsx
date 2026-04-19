'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
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
import { fuelOptions as fuelOptionsFn, conditionOptions as conditionOptionsFn, transmissionOptions as transmissionOptionsFn } from '@/lib/constants/mappings';
import { getGovernorates } from '@/lib/location-data';
import { useTranslations, useLocale } from 'next-intl';

const ListingsMap = dynamic(() => import('@/components/map/listings-map'), { ssr: false });

export default function ListingsPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[1440px] mx-auto px-4 md:px-8"><ListingSkeleton count={6} /></main></>}>
      <ListingsContent />
    </Suspense>
  );
}

function ListingsContent() {
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const tl = useTranslations('listings');
  const locale = useLocale();
  const fuelOpts = fuelOptionsFn(tm);
  const condOpts = conditionOptionsFn(tm).filter(o => ['NEW', 'USED', 'LIKE_NEW'].includes(o.value));
  const transmissionOpts = transmissionOptionsFn(tm);
  const governorateOpts = getGovernorates('OM', locale);

  const CAR_MAKES = [
    'Toyota', 'Nissan', 'Honda', 'Hyundai', 'Kia', 'Mitsubishi', 'Suzuki', 'Mazda',
    'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Lexus',
    'Infiniti', 'Land Rover', 'Jeep', 'Dodge', 'GMC', 'Isuzu', 'Subaru',
  ];

  const CURRENT_YEAR = new Date().getFullYear();
  const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1989 }, (_, i) => CURRENT_YEAR - i);

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
  const minPrice = searchParams.get('minPrice') || '';
  const sortBy = searchParams.get('sortBy') || '';
  const listingType = searchParams.get('listingType') || '';
  const bodyType = searchParams.get('bodyType') || '';
  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const yearMin = searchParams.get('yearMin') || '';
  const yearMax = searchParams.get('yearMax') || '';
  const mileageMax = searchParams.get('mileageMax') || '';
  const transmission = searchParams.get('transmission') || '';
  const governorate = searchParams.get('governorate') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [selectedFuels, setSelectedFuels] = useState<string[]>(fuelType ? fuelType.split(',') : []);
  const [selectedCondition, setSelectedCondition] = useState(condition);
  const [priceMax, setPriceMax] = useState(maxPrice);
  const [priceMin, setPriceMin] = useState(minPrice);
  const [selectedMake, setSelectedMake] = useState(make);
  const [modelInput, setModelInput] = useState(model);
  const [selectedYearMin, setSelectedYearMin] = useState(yearMin);
  const [selectedYearMax, setSelectedYearMax] = useState(yearMax);
  const [mileageMaxInput, setMileageMaxInput] = useState(mileageMax);
  const [selectedTransmission, setSelectedTransmission] = useState(transmission);
  const [selectedGovernorate, setSelectedGovernorate] = useState(governorate);

  const params = useMemo(() => {
    const p: Record<string, string> = { page, limit: '12' };
    if (listingType) p.listingType = listingType;
    if (search) p.search = search;
    if (fuelType) p.fuelType = fuelType;
    if (condition) p.condition = condition;
    if (bodyType) p.bodyType = bodyType;
    if (maxPrice) p.priceMax = maxPrice;
    if (minPrice) p.priceMin = minPrice;
    if (make) p.make = make;
    if (model) p.model = model;
    if (yearMin) p.yearMin = yearMin;
    if (yearMax) p.yearMax = yearMax;
    if (mileageMax) p.mileageMax = mileageMax;
    if (transmission) p.transmission = transmission;
    if (governorate) p.governorate = governorate;
    if (sortBy) {
      const [field, order] = sortBy.split('_');
      p.sortBy = field;
      if (order) p.sortOrder = order;
    }
    return p;
  }, [page, search, fuelType, condition, bodyType, maxPrice, minPrice, make, model, yearMin, yearMax, mileageMax, transmission, governorate, sortBy, listingType]);

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

  function buildParams(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    const vals: Record<string, string> = {
      listingType, search: searchInput, fuelType: selectedFuels.join(','),
      condition: selectedCondition, maxPrice: priceMax, minPrice: priceMin,
      make: selectedMake, model: modelInput, yearMin: selectedYearMin,
      yearMax: selectedYearMax, mileageMax: mileageMaxInput,
      transmission: selectedTransmission, governorate: selectedGovernorate,
      sortBy, ...overrides,
    };
    Object.entries(vals).forEach(([k, v]) => { if (v) p.set(k, v); });
    p.set('page', '1');
    return p;
  }

  function applyFilters() {
    const p = new URLSearchParams();
    if (listingType) p.set('listingType', listingType);
    if (searchInput) p.set('search', searchInput);
    if (selectedFuels.length) p.set('fuelType', selectedFuels.join(','));
    if (selectedCondition) p.set('condition', selectedCondition);
    if (priceMax) p.set('maxPrice', priceMax);
    if (priceMin) p.set('minPrice', priceMin);
    if (selectedMake) p.set('make', selectedMake);
    if (modelInput) p.set('model', modelInput);
    if (selectedYearMin) p.set('yearMin', selectedYearMin);
    if (selectedYearMax) p.set('yearMax', selectedYearMax);
    if (mileageMaxInput) p.set('mileageMax', mileageMaxInput);
    if (selectedTransmission) p.set('transmission', selectedTransmission);
    if (selectedGovernorate) p.set('governorate', selectedGovernorate);
    if (sortBy) p.set('sortBy', sortBy);
    p.set('page', '1');
    router.push(`/listings?${p.toString()}`);
  }

  const activeFilterCount = [make, model, yearMin, yearMax, minPrice, maxPrice, mileageMax, transmission, governorate, fuelType, condition].filter(Boolean).length;

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
    { value: 'SEDAN', label: tp('bodySedan'), icon: 'directions_car' },
    { value: 'SUV', label: tp('bodySUV'), icon: 'airport_shuttle' },
    { value: 'HATCHBACK', label: tp('bodyHatchback'), icon: 'electric_car' },
    { value: 'TRUCK', label: tp('bodyTruck'), icon: 'local_shipping' },
    { value: 'COUPE', label: tp('bodyCoupe'), icon: 'sports_score' },
    { value: 'VAN', label: tp('bodyVan'), icon: 'commute' },
    { value: 'CONVERTIBLE', label: tp('bodyConvertible'), icon: 'no_crash' },
    { value: 'WAGON', label: tp('bodyWagon'), icon: 'rv_hookup' },
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#004ac6] via-[#2563eb] to-[#0B2447]" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-20%] right-0 w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute bottom-[-20%] left-0 w-[50vw] md:w-[400px] h-[50vw] md:h-[400px] rounded-full bg-blue-300/[0.08] blur-3xl" />

        <div className="relative z-10 pt-16 pb-6 sm:pt-24 sm:pb-10 md:pt-28 md:pb-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 sm:mb-3 drop-shadow-sm">
              {tp('listingsTitle')}
            </h1>
            <p className="text-white/70 text-xs sm:text-sm md:text-base mb-4 sm:mb-8 max-w-lg mx-auto">
              {tp('listingsSubtitle')}
            </p>

            {/* Listing Type Tabs */}
            <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
              {[
                { value: '', label: tp('all'), icon: 'apps' },
                { value: 'SALE', label: tl('typeSale'), icon: 'sell' },
                { value: 'RENTAL', label: tl('typeRental'), icon: 'car_rental' },
                { value: 'WANTED', label: tp('listingsWanted'), icon: 'search' },
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
                      placeholder={tp('listingsSearch')}
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
                    <span className="hidden sm:inline">{tp('rentalsSearchBtn')}</span>
                  </button>
                </div>

                {/* Quick filter chips — Row 1: Condition + Fuel + Transmission */}
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-white/10">
                  {condOpts.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => { const next = selectedCondition === opt.value ? '' : opt.value; setSelectedCondition(next); router.push(`/listings?${buildParams({ condition: next })}`); }}
                      className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${selectedCondition === opt.value ? 'bg-white text-primary' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                      {opt.label}
                    </button>
                  ))}
                  <span className="w-px h-5 bg-white/20 mx-0.5 self-center shrink-0" />
                  {fuelOpts.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => { const next = selectedFuels.includes(opt.value) ? selectedFuels.filter(f => f !== opt.value) : [...selectedFuels, opt.value]; setSelectedFuels(next); router.push(`/listings?${buildParams({ fuelType: next.join(',') })}`); }}
                      className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${selectedFuels.includes(opt.value) ? 'bg-white text-primary' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                      {opt.label}
                    </button>
                  ))}
                  <span className="w-px h-5 bg-white/20 mx-0.5 self-center shrink-0" />
                  {transmissionOpts.map((opt) => (
                    <button key={opt.value} type="button"
                      onClick={() => { const next = selectedTransmission === opt.value ? '' : opt.value; setSelectedTransmission(next); router.push(`/listings?${buildParams({ transmission: next })}`); }}
                      className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${selectedTransmission === opt.value ? 'bg-white text-primary' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Quick filter chips — Row 2: Top Makes */}
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 mt-1.5">
                  {['Toyota', 'Nissan', 'Honda', 'Hyundai', 'Kia', 'BMW', 'Mercedes-Benz', 'Lexus', 'Ford', 'Mitsubishi'].map((m) => (
                    <button key={m} type="button"
                      onClick={() => { const next = selectedMake === m ? '' : m; setSelectedMake(next); router.push(`/listings?${buildParams({ make: next })}`); }}
                      className={`shrink-0 px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${selectedMake === m ? 'bg-white text-primary' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}>
                      <span className="material-symbols-outlined text-[11px]">directions_car</span>
                      {m}
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
                <span className="text-xs">{tp('listingsCount')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="material-symbols-outlined text-sm">verified</span>
                <span className="text-xs">{tp('listingsVerifiedSellers')}</span>
              </div>
              <Link href="/add-listing" className="flex items-center gap-1.5 text-white/80 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-sm">add_circle</span>
                <span className="text-xs font-bold">{tp('listingsAddFree')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ BROWSE BY TYPE ═══════════ */}
      <section className="bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-7 w-1 bg-primary rounded-full" />
            <h2 className="text-xl font-black text-on-surface">{tp('listingsBrowseByType')}</h2>
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
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Mobile Filter Toggle ── */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl px-4 py-2.5 min-h-[44px] text-sm font-black text-on-surface-variant hover:border-primary/30 transition-all"
          >
            <span className="material-symbols-outlined text-base">tune</span>
            {tp('filterResults')}
            {activeFilterCount > 0 && (
              <span className="bg-primary text-on-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
            )}
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>

          {/* ── Mobile Bottom Sheet Filters ── */}
          <BottomSheet open={showMobileFilters} onClose={() => setShowMobileFilters(false)} title={tp('filterResults')}>
            <div className="space-y-5 pb-4">
              {/* Make */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsMakeLabel')}</label>
                <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)} className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm">
                  <option value="">{tp('listingsAllMakes')}</option>
                  {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              {/* Model */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsModelLabel')}</label>
                <input type="text" value={modelInput} onChange={e => setModelInput(e.target.value)} placeholder={tp('listingsModelPlaceholder')} className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm" />
              </div>
              {/* Year Range */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsYearRange')}</label>
                <div className="flex gap-2">
                  <select value={selectedYearMin} onChange={e => setSelectedYearMin(e.target.value)} className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm">
                    <option value="">{tp('listingsYearFrom')}</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <select value={selectedYearMax} onChange={e => setSelectedYearMax(e.target.value)} className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm">
                    <option value="">{tp('listingsYearTo')}</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              {/* Price Range */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsPriceRange')}</label>
                <div className="flex gap-2">
                  <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder={tp('listingsMinPrice')} className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm" />
                  <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder={tp('listingsMaxPrice')} className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm" />
                </div>
              </div>
              {/* Mileage */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsMileageMax')}</label>
                <input type="number" value={mileageMaxInput} onChange={e => setMileageMaxInput(e.target.value)} placeholder={tp('listingsMileagePlaceholder')} className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm" />
              </div>
              {/* Condition */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsConditionLabel')}</label>
                <div className="flex flex-wrap gap-2">{condOpts.map(opt => <button key={opt.value} type="button" onClick={() => setSelectedCondition(selectedCondition === opt.value ? '' : opt.value)} className={`px-3.5 py-2 min-h-[44px] text-xs font-bold rounded-lg transition-all ${selectedCondition === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant'}`}>{opt.label}</button>)}</div>
              </div>
              {/* Fuel */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsFuelLabel')}</label>
                <div className="flex flex-wrap gap-2">{fuelOpts.map(opt => <button key={opt.value} type="button" onClick={() => toggleFuel(opt.value)} className={`px-3.5 py-2 min-h-[44px] text-xs font-bold rounded-lg transition-all ${selectedFuels.includes(opt.value) ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant'}`}>{opt.label}</button>)}</div>
              </div>
              {/* Transmission */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsTransmissionLabel')}</label>
                <div className="flex gap-2">{transmissionOpts.map(opt => <button key={opt.value} type="button" onClick={() => setSelectedTransmission(selectedTransmission === opt.value ? '' : opt.value)} className={`flex-1 py-2.5 min-h-[44px] text-xs font-bold rounded-lg transition-all ${selectedTransmission === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant'}`}>{opt.label}</button>)}</div>
              </div>
              {/* Governorate */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsGovernorateLabel')}</label>
                <select value={selectedGovernorate} onChange={e => setSelectedGovernorate(e.target.value)} className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm">
                  <option value="">{tp('listingsAllGovernorates')}</option>
                  {governorateOpts.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <button onClick={() => { applyFilters(); setShowMobileFilters(false); }} className="bg-primary text-on-primary w-full py-3 min-h-[44px] text-sm font-black rounded-xl hover:brightness-110 transition-colors">{tp('applyFilters')}</button>
            </div>
          </BottomSheet>

          {/* ── Desktop Sidebar Filters ── */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <div className="sticky top-24 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">tune</span>
                  <h2 className="text-sm font-black">{tp('filterResults')}</h2>
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-on-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </div>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setSelectedMake(''); setModelInput(''); setSelectedYearMin(''); setSelectedYearMax(''); setPriceMin(''); setPriceMax(''); setMileageMaxInput(''); setSelectedCondition(''); setSelectedFuels([]); setSelectedTransmission(''); setSelectedGovernorate(''); router.push('/listings'); }}
                    className="text-[11px] font-bold text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {tp('all')} ×
                  </button>
                )}
              </div>

              <div className="p-5 space-y-5 max-h-[calc(100vh-140px)] overflow-y-auto">
                {/* Make */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsMakeLabel')}</label>
                  <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)} className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm">
                    <option value="">{tp('listingsAllMakes')}</option>
                    {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsModelLabel')}</label>
                  <input type="text" value={modelInput} onChange={e => setModelInput(e.target.value)} placeholder={tp('listingsModelPlaceholder')} className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm" />
                </div>

                {/* Year Range */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsYearRange')}</label>
                  <div className="flex gap-2">
                    <select value={selectedYearMin} onChange={e => setSelectedYearMin(e.target.value)} className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-2 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm">
                      <option value="">{tp('listingsYearFrom')}</option>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select value={selectedYearMax} onChange={e => setSelectedYearMax(e.target.value)} className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-2 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm">
                      <option value="">{tp('listingsYearTo')}</option>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsPriceRange')}</label>
                  <div className="flex gap-2">
                    <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder={tp('listingsYearFrom')} className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm" />
                    <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder={tp('listingsYearTo')} className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm" />
                  </div>
                </div>

                {/* Mileage */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsMileageMax')}</label>
                  <input type="number" value={mileageMaxInput} onChange={e => setMileageMaxInput(e.target.value)} placeholder={tp('listingsMileagePlaceholder')} className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm" />
                </div>

                <div className="h-px bg-outline-variant/10" />

                {/* Condition */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsConditionLabel')}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {condOpts.map(opt => (
                      <button key={opt.value} type="button" onClick={() => setSelectedCondition(selectedCondition === opt.value ? '' : opt.value)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedCondition === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>

                {/* Transmission */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsTransmissionLabel')}</label>
                  <div className="flex gap-2">
                    {transmissionOpts.map(opt => (
                      <button key={opt.value} type="button" onClick={() => setSelectedTransmission(selectedTransmission === opt.value ? '' : opt.value)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${selectedTransmission === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsFuelLabel')}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {fuelOpts.map(opt => (
                      <button key={opt.value} type="button" onClick={() => toggleFuel(opt.value)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedFuels.includes(opt.value) ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high'}`}>{opt.label}</button>
                    ))}
                  </div>
                </div>

                {/* Governorate */}
                <div>
                  <label className="text-xs font-bold text-on-surface-variant block mb-2">{tp('listingsGovernorateLabel')}</label>
                  <select value={selectedGovernorate} onChange={e => setSelectedGovernorate(e.target.value)} className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm">
                    <option value="">{tp('listingsAllGovernorates')}</option>
                    {governorateOpts.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>

                <button onClick={applyFilters} className="bg-primary text-on-primary w-full py-2.5 text-sm font-black rounded-xl hover:brightness-110 transition-colors">
                  {tp('applyFilters')}
                </button>

                <Link href="/add-listing" className="block bg-on-surface text-surface font-black text-center py-2.5 rounded-xl hover:bg-primary hover:text-on-primary transition-all text-sm">
                  {tp('listingsAddYours')}
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black">
                  {listingType === 'SALE' ? tp('listingsForSale') : listingType === 'RENTAL' ? tp('listingsForRent') : listingType === 'WANTED' ? tp('listingsWantedCar') : tp('listingsAllCars')}
                </h2>
                <p className="text-on-surface-variant text-sm mt-0.5">
                  {data ? tp('listingsAvailable', { count: data.meta.total }) : tp('listingsBrowseLatest')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex border border-outline-variant/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2.5 min-h-[44px] text-xs font-black flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className="material-symbols-outlined text-sm">view_list</span>
                    {tp('listingsViewList')}
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2.5 min-h-[44px] text-xs font-black flex items-center gap-1 transition-all ${viewMode === 'map' ? 'bg-on-surface text-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}
                  >
                    <span className="material-symbols-outlined text-sm">map</span>
                    {tp('listingsViewMap')}
                  </button>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl py-2 px-3 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-xs font-bold"
                >
                  <option value="">{tm('sortNewest')}</option>
                  <option value="price_asc">{tm('sortPriceLow')}</option>
                  <option value="price_desc">{tm('sortPriceHigh')}</option>
                  <option value="year_desc">{tp('sortYearNewest')}</option>
                </select>
              </div>
            </div>

            {/* Radius Filter (when map view) */}
            {viewMode === 'map' && (
              <div className="mb-6 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-2xl p-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                  <span className="material-symbols-outlined text-primary">radar</span>
                  <span className="text-sm font-black text-on-surface">{tp('listingsSearchRadius')}:</span>
                  <input type="range" min={5} max={200} step={5} value={radius} onChange={(e) => setRadius(parseInt(e.target.value))} className="flex-1 accent-primary" />
                  <span className="text-sm font-black text-primary min-w-[50px]">{radius} {tp('listingsKm')}</span>
                </div>
                {!userLocation && (
                  <button onClick={requestLocation} className="flex items-center gap-2 bg-on-surface text-surface px-4 py-2 text-xs font-black rounded-xl hover:bg-primary hover:text-on-primary transition-all">
                    <span className="material-symbols-outlined text-sm">my_location</span>
                    {tp('listingsLocateMe')}
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
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
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
                      <span className="material-symbols-outlined icon-flip">chevron_right</span>
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
                      <span className="material-symbols-outlined icon-flip">chevron_left</span>
                    </button>
                  </div>
                )}
              </>
              )
            ) : (
              <EmptyState
                icon="search_off"
                title={tp('listingsNoResults')}
                description={search ? tp('listingsNoResultsFor', { query: search }) : tp('listingsNoListings')}
                action={{ label: tp('listingsAddListing'), href: '/add-listing' }}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
