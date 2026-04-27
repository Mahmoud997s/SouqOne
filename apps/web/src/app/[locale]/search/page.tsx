'use client';

import { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useSearch, type SearchHit } from '@/lib/api/search';
import { useListings } from '@/lib/api/listings';
import { useParts } from '@/lib/api/parts';
import { useBusListings } from '@/lib/api/buses';
import { useCarServices } from '@/lib/api/services';
import { useJobs } from '@/lib/api/jobs';
import { useTransportServices } from '@/lib/api/transport';
import { useTrips } from '@/lib/api/trips';
import { conditionOptions as conditionOptionsFn, fuelOptions as fuelOptionsFn, transmissionOptions as transmissionOptionsFn } from '@/lib/constants/mappings';
import { getGovernorates, resolveLocationLabel } from '@/lib/location-data';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { FilterBar, type FilterDef } from './_components/FilterBar';
import { MobileSheet, MobileFilterBar } from './_components/MobileSheet';
import { ActiveFilters, buildActiveFilters, type ActiveFilter } from './_components/ActiveFilters';

// ─── Entity config ───
const ENTITY_CFG: Record<string, { labelKey: string; icon: string; color: string; href: (h: SearchHit) => string }> = {
  listings:    { labelKey: 'cars',      icon: 'directions_car',          color: 'bg-blue-500',    href: h => `/sale/car/${h.id}` },
  parts:       { labelKey: 'parts',     icon: 'settings',                color: 'bg-orange-500',  href: h => `/sale/part/${h.id}` },
  buses:       { labelKey: 'buses',     icon: 'directions_bus',          color: 'bg-green-500',   href: h => `/sale/bus/${h.id}` },
  services:    { labelKey: 'services',  icon: 'home_repair_service',     color: 'bg-violet-500',  href: h => `/sale/service/${h.id}` },
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
  const [showMobileFilters, setShowMobileFilters] = useState(false); // mobile sheet
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
  void YEAR_NOW; // year range available for future use

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
  // when make is cleared, also clear model
  function applyFiltersWithMakeReset(ov: Record<string, string>) {
    if ('make' in ov && !ov.make) ov.model = '';
    applyFilters(ov);
  }

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
    if (sortParam)   p.sort = sortParam === 'price:asc' ? 'price_asc' : sortParam === 'price:desc' ? 'price_desc' : 'newest';
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

  // ── flat values record for FilterBar / MobileSheet ──
  const filterValues: Record<string, string> = {
    governorate: govParam, sort: sortParam,
    minPrice: minPParam, maxPrice: maxPParam,
    make: makeParam, condition: condParam, fuelType: fuelParam,
    transmission: transParam, listingType: ltParam,
    model: modelParam, yearMin: yearMinParam, yearMax: yearMaxParam,
    busType: busTypeParam, busListingType: busLTParam,
    capMin: capMinParam, capMax: capMaxParam,
    partCategory: partCatParam,
    serviceType: svcTypeParam, providerType: provTypeParam,
    isHomeService: homeParam,
    jobType: jobTypeParam, employmentType: empTypeParam, licenseType: licParam,
    transportType: trTypeParam,
    tripType: tripTypeParam, scheduleType: schedParam,
  };

  const SORT_OPTS = [
    { value: '',            label: 'الأحدث' },
    { value: 'price:asc',  label: 'الأقل سعراً' },
    { value: 'price:desc', label: 'الأعلى سعراً' },
  ];

  const makeOpts = CAR_MAKES.map(m => ({ value: m, label: m }));

  const LISTING_TYPE_OPTS = [
    { value: 'SALE', label: 'للبيع' }, { value: 'RENTAL', label: 'إيجار' }, { value: 'WANTED', label: 'مطلوب' },
  ];
  const BUS_TYPE_OPTS = [
    { value: 'MINI_BUS', label: 'ميني باص' }, { value: 'MEDIUM_BUS', label: 'متوسط' },
    { value: 'LARGE_BUS', label: 'كبير' }, { value: 'COASTER', label: 'كوستر' }, { value: 'SCHOOL_BUS', label: 'مدرسية' },
  ];
  const BUS_LT_OPTS = [
    { value: 'BUS_SALE', label: 'بيع' }, { value: 'BUS_SALE_WITH_CONTRACT', label: 'بيع مع عقد' },
    { value: 'BUS_CONTRACT', label: 'تعاقد' }, { value: 'BUS_RENT', label: 'إيجار' }, { value: 'BUS_REQUEST', label: 'طلب' },
  ];
  const PART_CAT_OPTS = [
    { value: 'ENGINE', label: 'محرك' }, { value: 'BODY', label: 'هيكل' }, { value: 'ELECTRICAL', label: 'كهربائيات' },
    { value: 'SUSPENSION', label: 'تعليق' }, { value: 'BRAKES', label: 'فرامل' }, { value: 'INTERIOR', label: 'داخلية' },
    { value: 'TIRES', label: 'إطارات' }, { value: 'BATTERIES', label: 'بطاريات' }, { value: 'OILS', label: 'زيوت' },
    { value: 'ACCESSORIES', label: 'إكسسوارات' }, { value: 'OTHER', label: 'أخرى' },
  ];
  const SVC_TYPE_OPTS = [
    { value: 'MAINTENANCE', label: 'صيانة' }, { value: 'CLEANING', label: 'تنظيف' }, { value: 'MODIFICATION', label: 'تعديل' },
    { value: 'INSPECTION', label: 'فحص' }, { value: 'BODYWORK', label: 'هيكل وطلاء' },
    { value: 'ACCESSORIES_INSTALL', label: 'تركيب إكسسوارات' }, { value: 'KEYS_LOCKS', label: 'مفاتيح وأقفال' },
    { value: 'TOWING', label: 'سحب' }, { value: 'OTHER_SERVICE', label: 'أخرى' },
  ];
  const PROV_TYPE_OPTS = [
    { value: 'WORKSHOP', label: 'ورشة' }, { value: 'INDIVIDUAL', label: 'فرد' },
    { value: 'MOBILE', label: 'متنقل' }, { value: 'COMPANY', label: 'شركة' },
  ];
  const JOB_TYPE_OPTS = [{ value: 'OFFERING', label: 'عرض عمل' }, { value: 'HIRING', label: 'توظيف' }];
  const EMP_TYPE_OPTS = [
    { value: 'FULL_TIME', label: 'دوام كامل' }, { value: 'PART_TIME', label: 'جزئي' },
    { value: 'TEMPORARY', label: 'مؤقت' }, { value: 'CONTRACT', label: 'عقد' },
  ];
  const LIC_OPTS = [
    { value: 'LIGHT', label: 'خفيفة' }, { value: 'HEAVY', label: 'ثقيلة' },
    { value: 'TRANSPORT', label: 'نقل' }, { value: 'BUS', label: 'باص' }, { value: 'MOTORCYCLE', label: 'دراجة' },
  ];
  const TR_TYPE_OPTS = [
    { value: 'CARGO', label: 'شحن' }, { value: 'FURNITURE', label: 'أثاث' }, { value: 'DELIVERY', label: 'توصيل' },
    { value: 'HEAVY_TRANSPORT', label: 'نقل ثقيل' }, { value: 'TRUCK_RENTAL', label: 'تأجير شاحنة' }, { value: 'OTHER_TRANSPORT', label: 'أخرى' },
  ];
  const TRIP_TYPE_OPTS = [
    { value: 'BUS_SUBSCRIPTION', label: 'اشتراك باص' }, { value: 'SCHOOL_TRANSPORT', label: 'نقل مدرسي' },
    { value: 'TOURISM', label: 'سياحة' }, { value: 'CORPORATE', label: 'شركات' }, { value: 'CARPOOLING', label: 'مشاركة سيارة' },
  ];
  const SCHED_TYPE_OPTS = [
    { value: 'SCHEDULE_DAILY', label: 'يومي' }, { value: 'SCHEDULE_WEEKLY', label: 'أسبوعي' },
    { value: 'SCHEDULE_MONTHLY', label: 'شهري' }, { value: 'ONE_TIME', label: 'مرة واحدة' },
  ];

  // FilterDef list per tab — ordered most-important first (RTL = leftmost in chip row)
  const tabFilterDefs: FilterDef[] = [
    // ── always ──
    { key: 'governorate', label: 'المحافظة', type: 'enum', options: govOpts },
    // ── listings + all ──
    ...(isListings || isAll ? [
      { key: 'make',        label: 'الماركة',     type: 'enum' as const, options: makeOpts },
      { key: 'condition',   label: 'الحالة',      type: 'enum' as const, options: condOpts },
      { key: 'listingType', label: 'نوع الإعلان', type: 'enum' as const, options: LISTING_TYPE_OPTS },
    ] : []),
    ...(isListings ? [
      { key: 'fuelType',    label: 'الوقود',      type: 'enum' as const, options: fuelOpts },
      { key: 'transmission',label: 'ناقل الحركة', type: 'enum' as const, options: transOpts },
      { key: 'yearMin',     label: 'السنة',       type: 'range' as const, pairedKey: 'yearMax', pairedLabel: 'حتى' },
    ] : []),
    // ── price ──
    ...(isListings || isParts || isBuses || isAll ? [
      { key: 'minPrice', label: 'السعر', type: 'range' as const, pairedKey: 'maxPrice', unit: 'OMR' },
    ] : []),
    // ── parts ──
    ...(isParts ? [
      { key: 'partCategory', label: 'الفئة', type: 'enum' as const, options: PART_CAT_OPTS },
      { key: 'condition',    label: 'الحالة', type: 'enum' as const, options: condOpts },
    ] : []),
    // ── buses ──
    ...(isBuses ? [
      { key: 'busType',       label: 'نوع الباص',   type: 'enum' as const, options: BUS_TYPE_OPTS },
      { key: 'busListingType',label: 'نوع الإعلان', type: 'enum' as const, options: BUS_LT_OPTS },
      { key: 'capMin',        label: 'الطاقة',      type: 'range' as const, pairedKey: 'capMax', unit: 'راكب' },
    ] : []),
    // ── services ──
    ...(isServices ? [
      { key: 'serviceType',  label: 'الخدمة',    type: 'enum' as const, options: SVC_TYPE_OPTS },
      { key: 'providerType', label: 'المزود',    type: 'enum' as const, options: PROV_TYPE_OPTS },
      { key: 'isHomeService',label: 'خدمة منزلية', type: 'boolean' as const },
    ] : []),
    // ── jobs ──
    ...(isJobs ? [
      { key: 'jobType',       label: 'نوع الوظيفة',  type: 'enum' as const, options: JOB_TYPE_OPTS },
      { key: 'employmentType',label: 'التوظيف',       type: 'enum' as const, options: EMP_TYPE_OPTS },
      { key: 'licenseType',   label: 'الرخصة',        type: 'enum' as const, options: LIC_OPTS },
    ] : []),
    // ── transport ──
    ...(isTransport ? [
      { key: 'transportType', label: 'النقل',    type: 'enum' as const, options: TR_TYPE_OPTS },
      { key: 'providerType',  label: 'المزود',   type: 'enum' as const, options: PROV_TYPE_OPTS },
    ] : []),
    // ── trips ──
    ...(isTrips ? [
      { key: 'tripType',     label: 'الرحلة',  type: 'enum' as const, options: TRIP_TYPE_OPTS },
      { key: 'scheduleType', label: 'الجدول',  type: 'enum' as const, options: SCHED_TYPE_OPTS },
    ] : []),
  ];

  // ── active filter chips ──
  const activeFilters: ActiveFilter[] = buildActiveFilters({
    govParam, sortParam, minPParam, maxPParam,
    makeParam, condParam, fuelParam, transParam, ltParam, modelParam,
    yearMinParam, yearMaxParam, busTypeParam, busLTParam, capMinParam, capMaxParam,
    partCatParam, svcTypeParam, provTypeParam, homeParam,
    jobTypeParam, empTypeParam, licParam, trTypeParam, tripTypeParam, schedParam,
    govOpts,
  });

  function removeFilter(key: string) {
    const ov: Record<string, string> = { [key]: '' };
    // removing one side of a range also clears the paired param
    if (key === 'minPrice') ov.maxPrice = '';
    if (key === 'maxPrice') ov.minPrice = '';
    if (key === 'capMin')   ov.capMax   = '';
    if (key === 'capMax')   ov.capMin   = '';
    if (key === 'yearMin')  ov.yearMax  = '';
    if (key === 'yearMax')  ov.yearMin  = '';
    applyFilters(ov);
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

          </div>
        </div>
      </section>

      {/* ── Desktop: horizontal filter chip bar (hidden on mobile) ── */}
      <div className="hidden sm:block">
        <FilterBar
          filters={tabFilterDefs}
          values={filterValues}
          onApply={applyFiltersWithMakeReset}
          activeTab={activeTab}
          total={total}
          allFiltersContent={
            <div className="space-y-2">
              {tabFilterDefs.map(def => (
                <AllFiltersGroup key={def.key} def={def} values={filterValues} onApply={applyFiltersWithMakeReset} />
              ))}
            </div>
          }
        />
      </div>

      {/* ── Mobile: full-screen sheet ── */}
      <MobileSheet
        open={showMobileFilters}
        onClose={() => setShowMobileFilters(false)}
        filters={tabFilterDefs}
        values={filterValues}
        onApply={applyFiltersWithMakeReset}
        onClearAll={clearAllFilters}
        total={total}
        activeFilterCount={activeFilterCount}
      />

      {/* ── Active filter chips — below filter bar ── */}
      {activeFilters.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 pt-3">
          <ActiveFilters
            filters={activeFilters}
            onRemove={removeFilter}
            onClearAll={clearAllFilters}
            isLoading={isLoading}
            total={total}
          />
        </div>
      )}

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 sm:pb-8">
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
            <div className={`results-grid grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4${isLoading ? ' results-grid-loading' : ''}`}>
              {items.map((item, idx) => {
                const cfg = ENTITY_CFG[item._entityType ?? activeTab];
                const imgUrl = getItemImage(item);
                const price = getItemPrice(item);
                const href = getItemHref(item);
                return (
                  <Link key={item.id} href={href}
                    className="search-card-enter group bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200 flex flex-col"
                    style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}>
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
                          {resolveLocationLabel(item.governorate, locale)}
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

      {/* ── Mobile sticky bottom filter bar ── */}
      <MobileFilterBar
        activeFilterCount={activeFilterCount}
        sortValue={sortParam}
        sortOptions={SORT_OPTS}
        onOpenFilters={() => setShowMobileFilters(true)}
        onApplySort={v => applyFilters({ sort: v })}
      />

      <Footer />
    </>
  );
}

// ─── AllFiltersGroup — reused inside the all-filters modal ─────────────────
function AllFiltersGroup({
  def, values, onApply,
}: {
  def: FilterDef;
  values: Record<string, string>;
  onApply: (ov: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [minDraft, setMinDraft] = useState(values[def.key] ?? '');
  const [maxDraft, setMaxDraft] = useState(def.pairedKey ? (values[def.pairedKey] ?? '') : '');
  const currentVal = values[def.key] ?? '';
  const currentPaired = def.pairedKey ? (values[def.pairedKey] ?? '') : '';
  const isActive = !!currentVal || !!currentPaired;

  return (
    <div className="border border-outline-variant/15 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-right bg-surface-container-lowest hover:bg-surface-container transition-colors"
      >
        <span className="text-sm font-black text-on-surface">{def.label}</span>
        <div className="flex items-center gap-2">
          {isActive && <span className="w-2 h-2 rounded-full bg-primary" />}
          <span className={clsx('material-symbols-outlined text-sm text-on-surface-variant transition-transform duration-200', open && 'rotate-180')}>expand_more</span>
        </div>
      </button>
      {open && (
        <div className="border-t border-outline-variant/10 p-4">
          {def.type === 'enum' && def.options && (
            <div className="flex flex-wrap gap-2">
              {currentVal && (
                <button type="button" onClick={() => onApply({ [def.key]: '' })}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border border-outline-variant/20 text-on-surface-variant/60 hover:bg-surface-container">
                  إلغاء
                </button>
              )}
              {def.options.map(o => (
                <button key={o.value} type="button"
                  onClick={() => onApply({ [def.key]: currentVal === o.value ? '' : o.value })}
                  className={clsx('px-4 py-1.5 rounded-full text-xs font-bold border transition-all',
                    currentVal === o.value
                      ? 'bg-primary border-primary text-on-primary'
                      : 'border-outline-variant/20 text-on-surface hover:border-primary/40')}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
          {def.type === 'range' && (
            <div className="flex items-center gap-3">
              <input type="number" value={minDraft} onChange={e => setMinDraft(e.target.value)} placeholder="من"
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-outline-variant/20 bg-surface-container outline-none focus:border-primary/50" />
              <input type="number" value={maxDraft} onChange={e => setMaxDraft(e.target.value)} placeholder="إلى"
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-outline-variant/20 bg-surface-container outline-none focus:border-primary/50" />
              {def.unit && <span className="text-xs text-on-surface-variant/60 font-bold shrink-0">{def.unit}</span>}
              <button type="button"
                onClick={() => { const ov: Record<string, string> = { [def.key]: minDraft }; if (def.pairedKey) ov[def.pairedKey] = maxDraft; onApply(ov); }}
                className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-black shrink-0 hover:brightness-110 transition-all">
                تطبيق
              </button>
            </div>
          )}
          {def.type === 'boolean' && (
            <button type="button" onClick={() => onApply({ [def.key]: currentVal !== 'true' ? 'true' : '' })}
              className="flex items-center justify-between w-full">
              <span className="text-sm font-bold text-on-surface">{def.label}</span>
              <div className={clsx('relative w-11 h-6 rounded-full shrink-0 transition-colors duration-200', currentVal === 'true' ? 'bg-primary' : 'bg-outline-variant/40')}>
                <div className={clsx('absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200', currentVal === 'true' ? 'right-1' : 'right-6')} />
              </div>
            </button>
          )}
        </div>
      )}
    </div>
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
