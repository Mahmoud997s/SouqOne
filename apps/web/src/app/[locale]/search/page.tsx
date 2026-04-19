'use client';

import { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useSearch, type SearchHit } from '@/lib/api/search';
import { useListings } from '@/lib/api/listings';
import { useParts } from '@/lib/api/parts';
import { useBusListings } from '@/lib/api/buses';
import { useCarServices } from '@/lib/api/services';
import { useJobs } from '@/lib/api/jobs';
import { useTransportServices } from '@/lib/api/transport';
import { useTrips } from '@/lib/api/trips';
import { conditionOptions as conditionOptionsFn, fuelOptions as fuelOptionsFn, transmissionOptions as transmissionOptionsFn } from '@/lib/constants/mappings';
import { getGovernorates } from '@/lib/location-data';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';

// ─── Entity config ───
const ENTITY_CFG: Record<string, { labelKey: string; icon: string; color: string; href: (h: SearchHit) => string }> = {
  listings:    { labelKey: 'cars',      icon: 'directions_car',          color: 'bg-blue-500',    href: h => `/listings/${h.slug || h.id}` },
  parts:       { labelKey: 'parts',     icon: 'settings',                color: 'bg-orange-500',  href: h => `/parts/${h.slug || h.id}` },
  buses:       { labelKey: 'buses',     icon: 'directions_bus',          color: 'bg-green-500',   href: h => `/buses/${h.slug || h.id}` },
  services:    { labelKey: 'services',  icon: 'home_repair_service',     color: 'bg-violet-500',  href: h => `/services/${h.slug || h.id}` },
  jobs:        { labelKey: 'jobs',      icon: 'work',                    color: 'bg-teal-500',    href: h => `/jobs/${h.slug || h.id}` },
  transport:   { labelKey: 'transport', icon: 'local_shipping',          color: 'bg-sky-500',     href: h => `/transport/${h.slug || h.id}` },
  trips:       { labelKey: 'trips',     icon: 'route',                   color: 'bg-emerald-500', href: h => `/trips/${h.slug || h.id}` },
};

const TABS = [
  { value: '',           icon: 'apps',                labelKey: 'all' },
  { value: 'listings',   icon: 'directions_car',      labelKey: 'cars' },
  { value: 'parts',      icon: 'settings',            labelKey: 'parts' },
  { value: 'buses',      icon: 'directions_bus',      labelKey: 'buses' },
  { value: 'services',   icon: 'home_repair_service', labelKey: 'services' },
  { value: 'jobs',       icon: 'work',                labelKey: 'jobs' },
  { value: 'transport',  icon: 'local_shipping',      labelKey: 'transport' },
  { value: 'trips',      icon: 'route',               labelKey: 'trips' },
];

const CAR_MAKES = [
  'Toyota', 'Nissan', 'Honda', 'Hyundai', 'Kia', 'Mitsubishi',
  'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus',
  'Land Rover', 'Jeep', 'GMC', 'Isuzu', 'Subaru', 'Mazda',
];

const RECENT_KEY = 'carone.recent_searches';
function getRecent(): string[] { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } }
function saveRecent(q: string) { const r = getRecent().filter(s => s !== q); r.unshift(q); localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 6))); }

export default function SearchPage() {
  return (
    <Suspense fallback={<><Navbar /><div className="pt-32 flex justify-center"><span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span></div></>}>
      <SearchContent />
    </Suspense>
  );
}

// ─── shared select style ───
const SEL = 'shrink-0 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold rounded-xl py-2 px-3 outline-none cursor-pointer';
const SEL_OPT = 'text-on-surface bg-surface';

function SearchContent() {
  const ts  = useTranslations('search');
  const tm  = useTranslations('mappings');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── URL params ──
  const qParam    = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || '';

  // ── shared filters ──
  const govParam     = searchParams.get('governorate') || '';
  const sortParam    = searchParams.get('sort') || '';
  const minPParam    = searchParams.get('minPrice') || '';
  const maxPParam    = searchParams.get('maxPrice') || '';
  // listings-specific
  const makeParam    = searchParams.get('make') || '';
  const condParam    = searchParams.get('condition') || '';
  const fuelParam    = searchParams.get('fuelType') || '';
  const transParam   = searchParams.get('transmission') || '';
  const ltParam      = searchParams.get('listingType') || '';
  const modelParam   = searchParams.get('model') || '';
  const yearMinParam = searchParams.get('yearMin') || '';
  const yearMaxParam = searchParams.get('yearMax') || '';
  // buses-specific
  const busTypeParam = searchParams.get('busType') || '';
  const busLTParam   = searchParams.get('busListingType') || '';
  const capMinParam  = searchParams.get('capMin') || '';
  const capMaxParam  = searchParams.get('capMax') || '';
  // parts-specific
  const partCatParam = searchParams.get('partCategory') || '';
  // services-specific
  const svcTypeParam = searchParams.get('serviceType') || '';
  const provTypeParam= searchParams.get('providerType') || '';
  const homeParam    = searchParams.get('isHomeService') || '';
  // jobs-specific
  const jobTypeParam = searchParams.get('jobType') || '';
  const empTypeParam = searchParams.get('employmentType') || '';
  const licParam     = searchParams.get('licenseType') || '';
  // transport-specific
  const trTypeParam  = searchParams.get('transportType') || '';
  // trips-specific
  const tripTypeParam= searchParams.get('tripType') || '';
  const schedParam   = searchParams.get('scheduleType') || '';

  // ── local UI state ──
  const [query,    setQuery]    = useState(qParam);
  const [activeTab,setActiveTab]= useState(typeParam);
  const [page,     setPage]     = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // filter local state mirrors
  const [gov,      setGov]      = useState(govParam);
  const [sort,     setSort]     = useState(sortParam);
  const [minP,     setMinP]     = useState(minPParam);
  const [maxP,     setMaxP]     = useState(maxPParam);
  const [make,     setMake]     = useState(makeParam);
  const [cond,     setCond]     = useState(condParam);
  const [fuel,     setFuel]     = useState(fuelParam);
  const [trans,    setTrans]    = useState(transParam);
  const [lt,       setLt]       = useState(ltParam);
  const [model,    setModel]    = useState(modelParam);
  const [yearMin,  setYearMin]  = useState(yearMinParam);
  const [yearMax,  setYearMax]  = useState(yearMaxParam);
  const [busType,  setBusType]  = useState(busTypeParam);
  const [busLT,    setBusLT]    = useState(busLTParam);
  const [capMin,   setCapMin]   = useState(capMinParam);
  const [capMax,   setCapMax]   = useState(capMaxParam);
  const [partCat,  setPartCat]  = useState(partCatParam);
  const [svcType,  setSvcType]  = useState(svcTypeParam);
  const [provType, setProvType] = useState(provTypeParam);
  const [homeServ, setHomeServ] = useState(homeParam === 'true');
  const [jobType,  setJobType]  = useState(jobTypeParam);
  const [empType,  setEmpType]  = useState(empTypeParam);
  const [lic,      setLic]      = useState(licParam);
  const [trType,   setTrType]   = useState(trTypeParam);
  const [tripType, setTripType] = useState(tripTypeParam);
  const [sched,    setSched]    = useState(schedParam);

  // ── option lists ──
  const govOpts  = getGovernorates('OM', locale);
  const condOpts = conditionOptionsFn(tm).filter(o => ['NEW','USED','LIKE_NEW'].includes(o.value));
  const fuelOpts = fuelOptionsFn(tm);
  const transOpts= transmissionOptionsFn(tm);
  const YEAR_NOW = new Date().getFullYear();
  const years    = Array.from({ length: YEAR_NOW - 1989 }, (_, i) => String(YEAR_NOW - i));

  useEffect(() => { setPage(1); }, [qParam, typeParam, govParam, sortParam, minPParam, maxPParam,
    makeParam, condParam, fuelParam, transParam, ltParam, modelParam, yearMinParam, yearMaxParam,
    busTypeParam, busLTParam, capMinParam, capMaxParam, partCatParam, svcTypeParam, provTypeParam,
    homeParam, jobTypeParam, empTypeParam, licParam, trTypeParam, tripTypeParam, schedParam]);

  // ── build URL from current state ──
  function buildURL(ov: Record<string, string> = {}) {
    const vals: Record<string, string> = {
      q: query, type: activeTab, governorate: gov, sort,
      minPrice: minP, maxPrice: maxP,
      make, condition: cond, fuelType: fuel, transmission: trans, listingType: lt,
      model, yearMin, yearMax,
      busType, busListingType: busLT, capMin, capMax,
      partCategory: partCat,
      serviceType: svcType, providerType: provType,
      isHomeService: homeServ ? 'true' : '',
      jobType, employmentType: empType, licenseType: lic,
      transportType: trType, tripType, scheduleType: sched,
      ...ov,
    };
    const p = new URLSearchParams();
    Object.entries(vals).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/search?${p.toString()}`;
  }

  function applyFilters(ov: Record<string, string> = {}) { setPage(1); router.push(buildURL(ov)); }
  function applyNow(key: string, val: string) { applyFilters({ [key]: val }); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    applyFilters({ q: query.trim() });
  }

  // active filter count (exclude q + type)
  const activeFilterCount = [
    govParam, sortParam, minPParam, maxPParam, makeParam, condParam, fuelParam, transParam, ltParam,
    modelParam, yearMinParam, yearMaxParam, busTypeParam, busLTParam, capMinParam, capMaxParam,
    partCatParam, svcTypeParam, provTypeParam, homeParam, jobTypeParam, empTypeParam, licParam,
    trTypeParam, tripTypeParam, schedParam,
  ].filter(Boolean).length;

  function clearAllFilters() {
    [setGov,setSort,setMinP,setMaxP,setMake,setCond,setFuel,setTrans,setLt,setModel,
     setYearMin,setYearMax,setBusType,setBusLT,setCapMin,setCapMax,setPartCat,setSvcType,
     setProvType,setJobType,setEmpType,setLic,setTrType,setTripType,setSched]
      .forEach(fn => fn(''));
    setHomeServ(false);
    const p = new URLSearchParams();
    if (qParam) p.set('q', qParam);
    if (activeTab) p.set('type', activeTab);
    router.push(`/search?${p.toString()}`);
  }

  // ── per-tab API calls ──
  const isAll      = activeTab === '';
  const isListings = activeTab === 'listings';
  const isParts    = activeTab === 'parts';
  const isBuses    = activeTab === 'buses';
  const isServices = activeTab === 'services';
  const isJobs     = activeTab === 'jobs';
  const isTransport= activeTab === 'transport';
  const isTrips    = activeTab === 'trips';

  const listingsParams = useMemo(() => {
    const p: Record<string,string> = { page: String(page), limit: '20' };
    if (qParam)     p.search      = qParam;
    if (govParam)   p.governorate = govParam;
    if (makeParam)  p.make        = makeParam;
    if (condParam)  p.condition   = condParam;
    if (fuelParam)  p.fuelType    = fuelParam;
    if (transParam) p.transmission= transParam;
    if (ltParam)    p.listingType = ltParam;
    if (modelParam) p.model       = modelParam;
    if (yearMinParam) p.yearMin   = yearMinParam;
    if (yearMaxParam) p.yearMax   = yearMaxParam;
    if (minPParam)  p.priceMin    = minPParam;
    if (maxPParam)  p.priceMax    = maxPParam;
    if (sortParam)  { const [f,o] = sortParam.split(':'); p.sortBy = f; p.sortOrder = o || 'desc'; }
    return p;
  }, [page, qParam, govParam, makeParam, condParam, fuelParam, transParam, ltParam, modelParam, yearMinParam, yearMaxParam, minPParam, maxPParam, sortParam]);

  const partsParams = useMemo(() => {
    const p: Record<string,string> = { page: String(page), limit: '20' };
    if (qParam)      p.search       = qParam;
    if (govParam)    p.governorate  = govParam;
    if (makeParam)   p.make         = makeParam;
    if (condParam)   p.condition    = condParam;
    if (partCatParam)p.partCategory = partCatParam;
    if (minPParam)   p.minPrice     = minPParam;
    if (maxPParam)   p.maxPrice     = maxPParam;
    return p;
  }, [page, qParam, govParam, makeParam, condParam, partCatParam, minPParam, maxPParam]);

  const busesParams = useMemo(() => {
    const p: Record<string,string> = { page: String(page), limit: '20' };
    if (qParam)      p.search         = qParam;
    if (govParam)    p.governorate    = govParam;
    if (makeParam)   p.make           = makeParam;
    if (busTypeParam)p.busType        = busTypeParam;
    if (busLTParam)  p.busListingType = busLTParam;
    if (minPParam)   p.minPrice       = minPParam;
    if (maxPParam)   p.maxPrice       = maxPParam;
    if (capMinParam) p.minCapacity    = capMinParam;
    if (capMaxParam) p.maxCapacity    = capMaxParam;
    if (sortParam)   p.sort           = sortParam;
    return p;
  }, [page, qParam, govParam, makeParam, busTypeParam, busLTParam, minPParam, maxPParam, capMinParam, capMaxParam, sortParam]);

  const servicesParams = useMemo(() => {
    const p: Record<string,string> = { page: String(page), limit: '20' };
    if (qParam)      p.search       = qParam;
    if (govParam)    p.governorate  = govParam;
    if (svcTypeParam)p.serviceType  = svcTypeParam;
    if (provTypeParam)p.providerType= provTypeParam;
    if (homeParam)   p.isHomeService= homeParam;
    return p;
  }, [page, qParam, govParam, svcTypeParam, provTypeParam, homeParam]);

  const jobsParams = useMemo(() => {
    const p: Record<string,string> = { page: String(page), limit: '20' };
    if (qParam)      p.search         = qParam;
    if (govParam)    p.governorate    = govParam;
    if (jobTypeParam)p.jobType        = jobTypeParam;
    if (empTypeParam)p.employmentType = empTypeParam;
    if (licParam)    p.licenseType    = licParam;
    if (sortParam)   { const [f,o] = sortParam.split(':'); p.sortBy = f; p.sortOrder = o || 'desc'; }
    return p;
  }, [page, qParam, govParam, jobTypeParam, empTypeParam, licParam, sortParam]);

  const transportParams = useMemo(() => {
    const p: Record<string,string> = { page: String(page), limit: '20' };
    if (qParam)      p.search        = qParam;
    if (govParam)    p.governorate   = govParam;
    if (trTypeParam) p.transportType = trTypeParam;
    if (provTypeParam)p.providerType = provTypeParam;
    return p;
  }, [page, qParam, govParam, trTypeParam, provTypeParam]);

  const tripsParams = useMemo(() => {
    const p: Record<string,string> = { page: String(page), limit: '20' };
    if (qParam)       p.search       = qParam;
    if (govParam)     p.governorate  = govParam;
    if (tripTypeParam)p.tripType     = tripTypeParam;
    if (schedParam)   p.scheduleType = schedParam;
    return p;
  }, [page, qParam, govParam, tripTypeParam, schedParam]);

  const searchResult   = useSearch({ q: qParam||undefined, entityType: typeParam||undefined, governorate: govParam||undefined, sortBy: (sortParam as any)||undefined, minPrice: minPParam?Number(minPParam):undefined, maxPrice: maxPParam?Number(maxPParam):undefined, make: makeParam||undefined, condition: condParam||undefined, page, limit: 20 }, isAll && !!qParam);
  const listingsResult = useListings(listingsParams, isListings);
  const partsResult    = useParts(partsParams,       isParts);
  const busesResult    = useBusListings(busesParams, isBuses);
  const servicesResult = useCarServices(servicesParams, isServices);
  const jobsResult     = useJobs(jobsParams,         isJobs);
  const transportResult= useTransportServices(transportParams, isTransport);
  const tripsResult    = useTrips(tripsParams,       isTrips);

  type AnyItem = { id: string; title: string; slug?: string; imageUrl?: string | null; images?: {url:string}[]; price?: any; basePrice?: any; priceFrom?: any; pricePerTrip?: any; make?: string; model?: string; year?: number; governorate?: string; currency?: string; jobType?: string; employmentType?: string; tripType?: string; serviceType?: string; busType?: string; _entityType?: string };
  type TabResult = { items: AnyItem[]; total: number; totalPages: number; isLoading: boolean; isError: boolean };

  const activeResult: TabResult = useMemo(() => {
    function wrap(r: any, entityType: string): TabResult {
      const items = (r.data?.items ?? []).map((i: any) => ({ ...i, _entityType: entityType }));
      return { items, total: r.data?.meta?.total ?? 0, totalPages: r.data?.meta?.totalPages ?? 1, isLoading: r.isLoading, isError: r.isError };
    }
    if (isListings)  return wrap(listingsResult, 'listings');
    if (isParts)     return wrap(partsResult,    'parts');
    if (isBuses)     return wrap(busesResult,    'buses');
    if (isServices)  return wrap(servicesResult, 'services');
    if (isJobs)      return wrap(jobsResult,     'jobs');
    if (isTransport) return wrap(transportResult,'transport');
    if (isTrips)     return wrap(tripsResult,    'trips');
    // isAll — use Meilisearch
    const sr = searchResult;
    return { items: sr.data?.items ?? [], total: sr.data?.meta?.total ?? 0, totalPages: sr.data?.meta?.totalPages ?? 1, isLoading: sr.isLoading, isError: sr.isError };
  }, [isAll, isListings, isParts, isBuses, isServices, isJobs, isTransport, isTrips,
      searchResult, listingsResult, partsResult, busesResult, servicesResult, jobsResult, transportResult, tripsResult]); // eslint-disable-line

  const { items, total, totalPages, isLoading, isError } = activeResult;

  // ── Dynamic inline filter row per tab ──
  function InlineFilters() {
    return (
      <div className="flex overflow-x-auto no-scrollbar gap-2 mt-3 pb-2 items-center">
        {/* Sort */}
        <select value={sort} onChange={e => { setSort(e.target.value); applyNow('sort', e.target.value); }} className={SEL}>
          <option value="" className={SEL_OPT}>الأحدث</option>
          <option value="price:asc"  className={SEL_OPT}>الأقل سعراً</option>
          <option value="price:desc" className={SEL_OPT}>الأعلى سعراً</option>
          {isJobs && <option value="salary:desc" className={SEL_OPT}>أعلى راتب</option>}
        </select>

        {/* Governorate — all tabs */}
        <select value={gov} onChange={e => { setGov(e.target.value); applyNow('governorate', e.target.value); }} className={SEL}>
          <option value="" className={SEL_OPT}>كل المحافظات</option>
          {govOpts.map(g => <option key={g.value} value={g.value} className={SEL_OPT}>{g.label}</option>)}
        </select>

        {/* Price range — listings, parts, buses */}
        {(isAll || isListings || isParts || isBuses) && (<>
          <input type="number" value={minP} onChange={e => setMinP(e.target.value)} onBlur={() => applyFilters()}
            placeholder="سعر من" className="shrink-0 w-24 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl py-2 px-3 outline-none placeholder:text-white/50" />
          <input type="number" value={maxP} onChange={e => setMaxP(e.target.value)} onBlur={() => applyFilters()}
            placeholder="سعر إلى" className="shrink-0 w-24 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl py-2 px-3 outline-none placeholder:text-white/50" />
        </>)}

        {/* Listing type — listings only */}
        {isListings && (
          <select value={lt} onChange={e => { setLt(e.target.value); applyNow('listingType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>بيع وإيجار</option>
            <option value="SALE"    className={SEL_OPT}>للبيع</option>
            <option value="RENTAL"  className={SEL_OPT}>للإيجار</option>
            <option value="WANTED"  className={SEL_OPT}>مطلوب</option>
          </select>
        )}

        {/* Make — listings, buses, parts */}
        {(isListings || isBuses || isParts || isAll) && (
          <select value={make} onChange={e => { setMake(e.target.value); applyNow('make', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل الماركات</option>
            {CAR_MAKES.map(m => <option key={m} value={m} className={SEL_OPT}>{m}</option>)}
          </select>
        )}

        {/* Condition — listings, parts */}
        {(isListings || isParts || isAll) && (
          <select value={cond} onChange={e => { setCond(e.target.value); applyNow('condition', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل الحالات</option>
            {condOpts.map(o => <option key={o.value} value={o.value} className={SEL_OPT}>{o.label}</option>)}
          </select>
        )}

        {/* Fuel type — listings only */}
        {isListings && (
          <select value={fuel} onChange={e => { setFuel(e.target.value); applyNow('fuelType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل أنواع الوقود</option>
            {fuelOpts.map(o => <option key={o.value} value={o.value} className={SEL_OPT}>{o.label}</option>)}
          </select>
        )}

        {/* Transmission — listings only */}
        {isListings && (
          <select value={trans} onChange={e => { setTrans(e.target.value); applyNow('transmission', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل ناقلات الحركة</option>
            {transOpts.map(o => <option key={o.value} value={o.value} className={SEL_OPT}>{o.label}</option>)}
          </select>
        )}

        {/* Year range — listings only */}
        {isListings && (<>
          <select value={yearMin} onChange={e => { setYearMin(e.target.value); applyNow('yearMin', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>سنة من</option>
            {years.map(y => <option key={y} value={y} className={SEL_OPT}>{y}</option>)}
          </select>
          <select value={yearMax} onChange={e => { setYearMax(e.target.value); applyNow('yearMax', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>سنة إلى</option>
            {years.map(y => <option key={y} value={y} className={SEL_OPT}>{y}</option>)}
          </select>
        </>)}

        {/* Bus type — buses only */}
        {isBuses && (
          <select value={busType} onChange={e => { setBusType(e.target.value); applyNow('busType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل أنواع الباصات</option>
            <option value="MINI_BUS"   className={SEL_OPT}>ميني باص</option>
            <option value="MEDIUM_BUS" className={SEL_OPT}>باص متوسط</option>
            <option value="LARGE_BUS"  className={SEL_OPT}>باص كبير</option>
            <option value="COASTER"    className={SEL_OPT}>كوستر</option>
            <option value="SCHOOL_BUS" className={SEL_OPT}>حافلة مدرسية</option>
          </select>
        )}

        {/* Bus listing type — buses only */}
        {isBuses && (
          <select value={busLT} onChange={e => { setBusLT(e.target.value); applyNow('busListingType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل أنواع الإعلانات</option>
            <option value="BUS_SALE"              className={SEL_OPT}>بيع</option>
            <option value="BUS_SALE_WITH_CONTRACT" className={SEL_OPT}>بيع مع عقد</option>
            <option value="BUS_RENT"              className={SEL_OPT}>إيجار</option>
            <option value="BUS_REQUEST"           className={SEL_OPT}>طلب</option>
          </select>
        )}

        {/* Capacity range — buses only */}
        {isBuses && (<>
          <input type="number" value={capMin} onChange={e => setCapMin(e.target.value)} onBlur={() => applyFilters()}
            placeholder="سعة من" className="shrink-0 w-20 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl py-2 px-3 outline-none placeholder:text-white/50" />
          <input type="number" value={capMax} onChange={e => setCapMax(e.target.value)} onBlur={() => applyFilters()}
            placeholder="سعة إلى" className="shrink-0 w-20 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl py-2 px-3 outline-none placeholder:text-white/50" />
        </>)}

        {/* Part category — parts only */}
        {isParts && (
          <select value={partCat} onChange={e => { setPartCat(e.target.value); applyNow('partCategory', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل الفئات</option>
            <option value="ENGINE"      className={SEL_OPT}>محرك</option>
            <option value="BODY"        className={SEL_OPT}>هيكل</option>
            <option value="ELECTRICAL"  className={SEL_OPT}>كهربائيات</option>
            <option value="SUSPENSION"  className={SEL_OPT}>تعليق</option>
            <option value="BRAKES"      className={SEL_OPT}>فرامل</option>
            <option value="INTERIOR"    className={SEL_OPT}>داخلية</option>
            <option value="COOLING"     className={SEL_OPT}>تبريد</option>
            <option value="TRANSMISSION" className={SEL_OPT}>ناقل حركة</option>
            <option value="OTHER"       className={SEL_OPT}>أخرى</option>
          </select>
        )}

        {/* Service type — services only */}
        {isServices && (
          <select value={svcType} onChange={e => { setSvcType(e.target.value); applyNow('serviceType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل الخدمات</option>
            <option value="MAINTENANCE"  className={SEL_OPT}>صيانة</option>
            <option value="CLEANING"     className={SEL_OPT}>تنظيف</option>
            <option value="MODIFICATION" className={SEL_OPT}>تعديل</option>
            <option value="INSPECTION"   className={SEL_OPT}>فحص</option>
            <option value="TOWING"       className={SEL_OPT}>سحب</option>
            <option value="RECOVERY"     className={SEL_OPT}>إنقاذ</option>
          </select>
        )}

        {/* Provider type — services, transport */}
        {(isServices || isTransport) && (
          <select value={provType} onChange={e => { setProvType(e.target.value); applyNow('providerType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل المزودين</option>
            <option value="WORKSHOP"   className={SEL_OPT}>ورشة</option>
            <option value="INDIVIDUAL" className={SEL_OPT}>فرد</option>
            <option value="MOBILE"     className={SEL_OPT}>متنقل</option>
            <option value="COMPANY"    className={SEL_OPT}>شركة</option>
          </select>
        )}

        {/* Home service toggle — services only */}
        {isServices && (
          <button onClick={() => { const v = !homeServ; setHomeServ(v); applyFilters({ isHomeService: v ? 'true' : '' }); }}
            className={`shrink-0 flex items-center gap-1.5 text-xs font-bold rounded-xl py-2 px-3 border transition-all ${homeServ ? 'bg-white text-primary border-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/15'}`}>
            <span className="material-symbols-outlined text-sm">home</span>
            خدمة منزلية
          </button>
        )}

        {/* Job type — jobs only */}
        {isJobs && (
          <select value={jobType} onChange={e => { setJobType(e.target.value); applyNow('jobType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل الوظائف</option>
            <option value="OFFERING" className={SEL_OPT}>عرض عمل</option>
            <option value="HIRING"   className={SEL_OPT}>طلب توظيف</option>
          </select>
        )}

        {/* Employment type — jobs only */}
        {isJobs && (
          <select value={empType} onChange={e => { setEmpType(e.target.value); applyNow('employmentType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>نوع التوظيف</option>
            <option value="FULL_TIME"  className={SEL_OPT}>دوام كامل</option>
            <option value="PART_TIME"  className={SEL_OPT}>دوام جزئي</option>
            <option value="TEMPORARY"  className={SEL_OPT}>مؤقت</option>
            <option value="CONTRACT"   className={SEL_OPT}>عقد</option>
          </select>
        )}

        {/* License type — jobs only */}
        {isJobs && (
          <select value={lic} onChange={e => { setLic(e.target.value); applyNow('licenseType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>نوع الرخصة</option>
            <option value="LIGHT"      className={SEL_OPT}>خفيفة</option>
            <option value="HEAVY"      className={SEL_OPT}>ثقيلة</option>
            <option value="TRANSPORT"  className={SEL_OPT}>نقل</option>
            <option value="BUS"        className={SEL_OPT}>باص</option>
            <option value="MOTORCYCLE" className={SEL_OPT}>دراجة</option>
          </select>
        )}

        {/* Transport type — transport only */}
        {isTransport && (
          <select value={trType} onChange={e => { setTrType(e.target.value); applyNow('transportType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل أنواع النقل</option>
            <option value="CARGO"           className={SEL_OPT}>شحن</option>
            <option value="FURNITURE"       className={SEL_OPT}>أثاث</option>
            <option value="DELIVERY"        className={SEL_OPT}>توصيل</option>
            <option value="CRANE_TRANSPORT" className={SEL_OPT}>رافعة</option>
            <option value="OTHER_TRANSPORT" className={SEL_OPT}>أخرى</option>
          </select>
        )}

        {/* Trip type — trips only */}
        {isTrips && (
          <select value={tripType} onChange={e => { setTripType(e.target.value); applyNow('tripType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل الرحلات</option>
            <option value="BUS_SUBSCRIPTION"  className={SEL_OPT}>اشتراك باص</option>
            <option value="SCHOOL_TRANSPORT"  className={SEL_OPT}>نقل مدرسي</option>
            <option value="TOURISM"           className={SEL_OPT}>سياحة</option>
            <option value="AIRPORT_TRANSFER"  className={SEL_OPT}>نقل مطار</option>
            <option value="CARPOOLING"        className={SEL_OPT}>مشاركة سيارة</option>
          </select>
        )}

        {/* Schedule type — trips only */}
        {isTrips && (
          <select value={sched} onChange={e => { setSched(e.target.value); applyNow('scheduleType', e.target.value); }} className={SEL}>
            <option value="" className={SEL_OPT}>كل الجداول</option>
            <option value="SCHEDULE_DAILY"   className={SEL_OPT}>يومي</option>
            <option value="SCHEDULE_WEEKLY"  className={SEL_OPT}>أسبوعي</option>
            <option value="SCHEDULE_MONTHLY" className={SEL_OPT}>شهري</option>
            <option value="ON_DEMAND"        className={SEL_OPT}>عند الطلب</option>
          </select>
        )}

        {/* Clear filters */}
        {activeFilterCount > 0 && (
          <button onClick={clearAllFilters}
            className="shrink-0 flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-xl py-2 px-3 transition-all">
            <span className="material-symbols-outlined text-sm">filter_list_off</span>
            مسح ({activeFilterCount})
          </button>
        )}
      </div>
    );
  }

  // helper: get image url from item (SearchHit vs individual API item)
  function getItemImage(item: AnyItem) {
    if (item.imageUrl) return getImageUrl(item.imageUrl);
    if (item.images && item.images.length > 0) return getImageUrl(item.images[0].url);
    return null;
  }

  function getItemPrice(item: AnyItem) {
    return item.price ?? item.basePrice ?? item.priceFrom ?? item.pricePerTrip;
  }

  function getItemHref(item: AnyItem) {
    const et = item._entityType ?? activeTab;
    const cfg = ENTITY_CFG[et];
    return cfg ? cfg.href(item as any) : '#';
  }

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#004ac6] via-[#2563eb] to-[#0B2447]">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 pt-20 pb-6 sm:pt-24 sm:pb-8">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-5">
              <h1 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm mb-1">{ts('searchInSouqOne')}</h1>
              {qParam && (
                <p className="text-white/60 text-sm">
                  {total > 0 ? `${total} نتيجة لـ "${qParam}"` : ts('noResultsFor', { query: qParam })}
                </p>
              )}
            </div>

            {/* Search input */}
            <form onSubmit={handleSubmit}>
              <div className="flex items-center bg-white dark:bg-surface-container rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] overflow-hidden">
                <span className="material-symbols-outlined text-primary/40 text-xl px-4 shrink-0">search</span>
                <input ref={inputRef} type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={ts('searchPlaceholder')}
                  className="flex-1 py-4 text-sm font-medium text-on-surface bg-transparent focus:outline-none placeholder:text-on-surface-variant/40"
                  autoFocus />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="px-2 text-on-surface-variant/40 hover:text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
                <button type="submit" className="bg-primary text-white px-6 py-4 text-sm font-black hover:brightness-110 transition-all shrink-0">
                  {ts('searchBtn')}
                </button>
              </div>
            </form>

            {/* Recent searches */}
            {!qParam && getRecent().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <span className="text-white/50 text-xs self-center">{ts('recentSearches')}:</span>
                {getRecent().map((r, i) => (
                  <button key={i} onClick={() => { setQuery(r); saveRecent(r); applyFilters({ q: r }); }}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full transition-all">
                    <span className="material-symbols-outlined text-[11px]">history</span>
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mt-4 pb-1">
              {TABS.map(tab => (
                <button key={tab.value}
                  onClick={() => { setActiveTab(tab.value); applyFilters({ type: tab.value }); }}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.value ? 'bg-white text-primary shadow-md' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {ts(tab.labelKey as Parameters<typeof ts>[0])}
                </button>
              ))}
            </div>

            {/* Desktop inline filters */}
            <div className="hidden sm:block">
              <InlineFilters />
            </div>

            {/* Mobile filter button */}
            <div className="sm:hidden mt-3 flex items-center gap-2">
              <button onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-xl py-2 px-3 transition-all hover:bg-white/20">
                <span className="material-symbols-outlined text-sm">tune</span>
                فلاتر
                {activeFilterCount > 0 && (
                  <span className="bg-white text-primary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile bottom sheet */}
      <BottomSheet open={showMobileFilters} onClose={() => setShowMobileFilters(false)} title="فلاتر البحث">
        <div className="p-4 space-y-4">
          <InlineFilters />
          <button onClick={() => { applyFilters(); setShowMobileFilters(false); }}
            className="w-full bg-primary text-on-primary py-3 text-sm font-black rounded-xl hover:brightness-110 transition-colors mt-2">
            تطبيق الفلاتر
          </button>
        </div>
      </BottomSheet>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {!qParam ? (
          <EmptyPrompt onSearch={q => { setQuery(q); saveRecent(q); applyFilters({ q }); }} ts={ts} />
        ) : isLoading ? (
          <SearchSkeleton />
        ) : isError ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-error mb-3 block">error_outline</span>
            <p className="text-on-surface-variant">حدث خطأ، حاول مجدداً</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">search_off</span>
            <p className="text-xl font-black text-on-surface mb-1">{ts('noResultsFor', { query: qParam })}</p>
            <p className="text-on-surface-variant text-sm">جرّب كلمات أخرى أو تصفّح الأقسام</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-on-surface-variant">{total} نتيجة</p>
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters} className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">
                  {activeFilterCount} فلتر مفعّل · مسح الكل
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map(item => {
                const cfg = ENTITY_CFG[item._entityType ?? activeTab];
                const imgUrl = getItemImage(item);
                const price = getItemPrice(item);
                const href = getItemHref(item);
                return (
                  <Link key={item.id} href={href}
                    className="group bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200 flex flex-col">
                    <div className="relative h-44 bg-surface-container-low overflow-hidden">
                      {imgUrl ? (
                        <Image src={imgUrl as string} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">{cfg?.icon ?? 'category'}</span>
                        </div>
                      )}
                      {cfg && (
                        <span className={`absolute top-2 start-2 ${cfg.color} text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1`}>
                          <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
                          {ts(cfg.labelKey as any)}
                        </span>
                      )}
                      {item.governorate && (
                        <span className="absolute bottom-2 start-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-sm">
                          <span className="material-symbols-outlined text-[11px]">location_on</span>
                          {item.governorate}
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col gap-1">
                      <p className="text-sm font-black text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{item.title}</p>
                      {(item.make || item.model || item.year) && (
                        <p className="text-xs text-on-surface-variant">{[item.make, item.model, item.year].filter(Boolean).join(' · ')}</p>
                      )}
                      {price !== undefined && price !== null && (
                        <p className="text-base font-black text-primary mt-auto pt-2">
                          {Number(price).toLocaleString()} <span className="text-xs font-bold text-on-surface-variant">{item.currency ?? 'OMR'}</span>
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  className="w-10 h-10 border border-outline-variant/15 rounded-xl flex items-center justify-center hover:bg-surface-container disabled:opacity-30 transition-all">
                  <span className="material-symbols-outlined icon-flip">chevron_right</span>
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-10 h-10 flex items-center justify-center font-black text-sm rounded-xl transition-all ${p === page ? 'bg-primary text-on-primary' : 'border border-outline-variant/15 hover:bg-surface-container'}`}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="w-10 h-10 border border-outline-variant/15 rounded-xl flex items-center justify-center hover:bg-surface-container disabled:opacity-30 transition-all">
                  <span className="material-symbols-outlined icon-flip">chevron_left</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

// ─── Empty prompt ───
function EmptyPrompt({ onSearch, ts }: { onSearch: (q: string) => void; ts: any }) {
  const popular = ['تويوتا كامري', 'نيسان باترول', 'هوندا سيفيك', 'BMW 2024', 'قطع غيار'];
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <span className="material-symbols-outlined text-4xl text-primary">search</span>
      </div>
      <h2 className="text-xl font-black text-on-surface mb-2">ابحث عن أي شيء</h2>
      <p className="text-on-surface-variant text-sm mb-8">سيارات، قطع غيار، خدمات، وظائف، باصات...</p>
      <p className="text-xs font-bold text-on-surface-variant mb-3">{ts('popularSearches')}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {popular.map(s => (
          <button key={s} onClick={() => onSearch(s)}
            className="bg-surface-container hover:bg-primary hover:text-on-primary px-4 py-2 rounded-xl text-sm font-bold transition-all">{s}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ───
function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-44 bg-surface-container-low" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-surface-container-low rounded-lg w-3/4" />
            <div className="h-3 bg-surface-container-low rounded-lg w-1/2" />
            <div className="h-5 bg-surface-container-low rounded-lg w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
