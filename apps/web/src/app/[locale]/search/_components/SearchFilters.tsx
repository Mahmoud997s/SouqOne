'use client';

import { useState } from 'react';
import clsx from 'clsx';

// ─── Primitive components ────────────────────────────────────────────────────

/** Pill button group — for enums with 2-4 values */
function PillGroup({
  options,
  value,
  onChange,
  dark = false,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(value === o.value ? '' : o.value)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
            dark
              ? value === o.value
                ? 'bg-white text-primary border-white'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              : value === o.value
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Searchable select — for enums with 5+ values */
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  dark = false,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => { setOpen(!open); setSearch(''); }}
        className={clsx(
          'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all',
          dark
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
            : 'bg-surface-container border-outline-variant/20 text-on-surface hover:border-primary/40'
        )}
      >
        <span className={selected ? '' : (dark ? 'text-white/50' : 'text-on-surface-variant/60')}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={clsx('material-symbols-outlined text-sm transition-transform', open && 'rotate-180')}>
          expand_more
        </span>
      </button>

      {open && (
        <div className={clsx(
          'absolute top-full mt-1 w-full z-50 rounded-xl border shadow-lg overflow-hidden',
          dark ? 'bg-[#0B2447] border-white/20' : 'bg-surface-container-lowest border-outline-variant/20'
        )}>
          <div className="p-2 border-b border-outline-variant/10">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث..."
              className={clsx(
                'w-full text-xs px-2 py-1.5 rounded-lg outline-none',
                dark ? 'bg-white/10 text-white placeholder:text-white/40' : 'bg-surface-container text-on-surface placeholder:text-on-surface-variant/50'
              )}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {value && (
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); }}
                className={clsx('w-full text-right px-3 py-2 text-xs font-bold transition-colors',
                  dark ? 'text-white/40 hover:bg-white/10' : 'text-on-surface-variant/60 hover:bg-surface-container')}
              >
                إلغاء التحديد
              </button>
            )}
            {filtered.length === 0 && (
              <p className={clsx('px-3 py-2 text-xs', dark ? 'text-white/40' : 'text-on-surface-variant/60')}>لا نتائج</p>
            )}
            {filtered.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => { onChange(o.value); setOpen(false); setSearch(''); }}
                className={clsx(
                  'w-full text-right px-3 py-2 text-xs font-bold transition-colors',
                  value === o.value
                    ? dark ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                    : dark ? 'text-white hover:bg-white/10' : 'text-on-surface hover:bg-surface-container'
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Number range — two inputs side by side */
function RangeInputs({
  minVal, maxVal,
  onMinChange, onMaxChange,
  onBlur,
  unit,
  dark = false,
}: {
  minVal: string; maxVal: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
  onBlur: () => void;
  unit?: string;
  dark?: boolean;
}) {
  const base = clsx(
    'flex-1 min-w-0 text-xs font-bold px-3 py-2 rounded-xl border outline-none transition-all',
    dark
      ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50'
      : 'bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50'
  );
  return (
    <div className="flex items-center gap-2">
      <input type="number" min="0" value={minVal} onChange={e => onMinChange(e.target.value)} onBlur={onBlur}
        placeholder="من" className={base} />
      <span className={clsx('text-xs shrink-0', dark ? 'text-white/40' : 'text-on-surface-variant/50')}>—</span>
      <input type="number" min="0" value={maxVal} onChange={e => onMaxChange(e.target.value)} onBlur={onBlur}
        placeholder="إلى" className={base} />
      {unit && <span className={clsx('text-xs font-bold shrink-0', dark ? 'text-white/60' : 'text-on-surface-variant')}>{unit}</span>}
    </div>
  );
}

/** Toggle switch */
function Toggle({ value, onChange, label, dark = false }: {
  value: boolean; onChange: (v: boolean) => void; label: string; dark?: boolean;
}) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className="flex items-center justify-between w-full">
      <span className={clsx('text-xs font-bold', dark ? 'text-white' : 'text-on-surface')}>{label}</span>
      <div className={clsx('relative w-10 h-6 rounded-full transition-colors shrink-0',
        value ? 'bg-primary' : dark ? 'bg-white/20' : 'bg-outline-variant/40')}>
        <div className={clsx('absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all',
          value ? 'right-1' : 'right-5')} />
      </div>
    </button>
  );
}

/** Collapsible filter group */
function FilterGroup({
  icon, label, activeCount, children, defaultOpen = false, dark = false,
}: {
  icon: string; label: string; activeCount: number;
  children: React.ReactNode; defaultOpen?: boolean; dark?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={clsx('rounded-xl border overflow-hidden transition-all',
      dark ? 'border-white/15 bg-white/5' : 'border-outline-variant/15 bg-surface-container-lowest')}>
      <button type="button" onClick={() => setOpen(!open)}
        className={clsx('w-full flex items-center gap-2 px-4 py-3 transition-colors',
          dark ? 'hover:bg-white/5' : 'hover:bg-surface-container')}>
        <span className={clsx('material-symbols-outlined text-base shrink-0',
          dark ? 'text-white/70' : 'text-on-surface-variant')}>{icon}</span>
        <span className={clsx('flex-1 text-right text-sm font-black',
          dark ? 'text-white' : 'text-on-surface')}>{label}</span>
        {activeCount > 0 && (
          <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full shrink-0',
            dark ? 'bg-white text-primary' : 'bg-primary text-on-primary')}>
            {activeCount}
          </span>
        )}
        <span className={clsx('material-symbols-outlined text-sm transition-transform shrink-0',
          open && 'rotate-180', dark ? 'text-white/50' : 'text-on-surface-variant')}>
          expand_more
        </span>
      </button>
      {open && (
        <div className={clsx('px-4 pb-4 space-y-3 border-t',
          dark ? 'border-white/10' : 'border-outline-variant/10')}>
          <div className="pt-3">{children}</div>
        </div>
      )}
    </div>
  );
}

/** Row label inside a group */
function FilterRow({ label, children, dark = false }: { label: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className={clsx('text-[11px] font-bold', dark ? 'text-white/50' : 'text-on-surface-variant/70')}>{label}</p>
      {children}
    </div>
  );
}

// ─── Main FilterPanel ────────────────────────────────────────────────────────

export interface FilterState {
  // shared
  gov: string; sort: string; minP: string; maxP: string;
  // listings
  make: string; cond: string; fuel: string; trans: string; lt: string;
  model: string; yearMin: string; yearMax: string;
  // buses
  busType: string; busLT: string; capMin: string; capMax: string;
  // parts
  partCat: string;
  // services
  svcType: string; provType: string; homeServ: boolean;
  // jobs
  jobType: string; empType: string; lic: string;
  // transport
  trType: string;
  // trips
  tripType: string; sched: string;
}

export interface FilterSetters {
  setGov: (v: string) => void; setSort: (v: string) => void;
  setMinP: (v: string) => void; setMaxP: (v: string) => void;
  setMake: (v: string) => void; setCond: (v: string) => void;
  setFuel: (v: string) => void; setTrans: (v: string) => void;
  setLt: (v: string) => void; setModel: (v: string) => void;
  setYearMin: (v: string) => void; setYearMax: (v: string) => void;
  setBusType: (v: string) => void; setBusLT: (v: string) => void;
  setCapMin: (v: string) => void; setCapMax: (v: string) => void;
  setPartCat: (v: string) => void; setSvcType: (v: string) => void;
  setProvType: (v: string) => void; setHomeServ: (v: boolean) => void;
  setJobType: (v: string) => void; setEmpType: (v: string) => void;
  setLic: (v: string) => void; setTrType: (v: string) => void;
  setTripType: (v: string) => void; setSched: (v: string) => void;
}

interface SearchFiltersProps {
  activeTab: string;
  state: FilterState;
  setters: FilterSetters;
  govOpts: { value: string; label: string }[];
  condOpts: { value: string; label: string }[];
  fuelOpts: { value: string; label: string }[];
  transOpts: { value: string; label: string }[];
  years: string[];
  CAR_MAKES: string[];
  applyFilters: (ov?: Record<string, string>) => void;
  applyNow: (key: string, val: string) => void;
  activeFilterCount: number;
  clearAllFilters: () => void;
  /** true = dark hero background, false = light panel (mobile sheet) */
  dark?: boolean;
}

const LISTING_TYPES = [
  { value: 'SALE',   label: 'للبيع' },
  { value: 'RENTAL', label: 'إيجار' },
  { value: 'WANTED', label: 'مطلوب' },
];
const SORT_OPTS = [
  { value: '',           label: 'الأحدث' },
  { value: 'price:asc',  label: 'الأقل سعراً' },
  { value: 'price:desc', label: 'الأعلى سعراً' },
];
const BUS_TYPES = [
  { value: 'MINI_BUS',   label: 'ميني باص' },
  { value: 'MEDIUM_BUS', label: 'متوسط' },
  { value: 'LARGE_BUS',  label: 'كبير' },
  { value: 'COASTER',    label: 'كوستر' },
  { value: 'SCHOOL_BUS', label: 'مدرسية' },
];
const BUS_LT = [
  { value: 'BUS_SALE',              label: 'بيع' },
  { value: 'BUS_SALE_WITH_CONTRACT',label: 'بيع مع عقد' },
  { value: 'BUS_CONTRACT',          label: 'تعاقد' },
  { value: 'BUS_RENT',              label: 'إيجار' },
  { value: 'BUS_REQUEST',           label: 'طلب' },
];
const PART_CATS = [
  { value: 'ENGINE',      label: 'محرك' },
  { value: 'BODY',        label: 'هيكل' },
  { value: 'ELECTRICAL',  label: 'كهربائيات' },
  { value: 'SUSPENSION',  label: 'تعليق' },
  { value: 'BRAKES',      label: 'فرامل' },
  { value: 'INTERIOR',    label: 'داخلية' },
  { value: 'TIRES',       label: 'إطارات' },
  { value: 'BATTERIES',   label: 'بطاريات' },
  { value: 'OILS',        label: 'زيوت' },
  { value: 'ACCESSORIES', label: 'إكسسوارات' },
  { value: 'OTHER',       label: 'أخرى' },
];
const SVC_TYPES = [
  { value: 'MAINTENANCE',         label: 'صيانة' },
  { value: 'CLEANING',            label: 'تنظيف' },
  { value: 'MODIFICATION',        label: 'تعديل' },
  { value: 'INSPECTION',          label: 'فحص' },
  { value: 'BODYWORK',            label: 'هيكل وطلاء' },
  { value: 'ACCESSORIES_INSTALL', label: 'تركيب إكسسوارات' },
  { value: 'KEYS_LOCKS',          label: 'مفاتيح وأقفال' },
  { value: 'TOWING',              label: 'سحب' },
  { value: 'OTHER_SERVICE',       label: 'أخرى' },
];
const PROV_TYPES = [
  { value: 'WORKSHOP',   label: 'ورشة' },
  { value: 'INDIVIDUAL', label: 'فرد' },
  { value: 'MOBILE',     label: 'متنقل' },
  { value: 'COMPANY',    label: 'شركة' },
];
const JOB_TYPES = [
  { value: 'OFFERING', label: 'عرض عمل' },
  { value: 'HIRING',   label: 'طلب توظيف' },
];
const EMP_TYPES = [
  { value: 'FULL_TIME',  label: 'دوام كامل' },
  { value: 'PART_TIME',  label: 'جزئي' },
  { value: 'TEMPORARY',  label: 'مؤقت' },
  { value: 'CONTRACT',   label: 'عقد' },
];
const LIC_TYPES = [
  { value: 'LIGHT',      label: 'خفيفة' },
  { value: 'HEAVY',      label: 'ثقيلة' },
  { value: 'TRANSPORT',  label: 'نقل' },
  { value: 'BUS',        label: 'باص' },
  { value: 'MOTORCYCLE', label: 'دراجة' },
];
const TR_TYPES = [
  { value: 'CARGO',           label: 'شحن' },
  { value: 'FURNITURE',       label: 'أثاث' },
  { value: 'DELIVERY',        label: 'توصيل' },
  { value: 'HEAVY_TRANSPORT', label: 'نقل ثقيل' },
  { value: 'TRUCK_RENTAL',    label: 'تأجير شاحنة' },
  { value: 'OTHER_TRANSPORT', label: 'أخرى' },
];
const TRIP_TYPES = [
  { value: 'BUS_SUBSCRIPTION', label: 'اشتراك باص' },
  { value: 'SCHOOL_TRANSPORT', label: 'نقل مدرسي' },
  { value: 'TOURISM',          label: 'سياحة' },
  { value: 'CORPORATE',        label: 'شركات' },
  { value: 'CARPOOLING',       label: 'مشاركة سيارة' },
];
const SCHED_TYPES = [
  { value: 'SCHEDULE_DAILY',   label: 'يومي' },
  { value: 'SCHEDULE_WEEKLY',  label: 'أسبوعي' },
  { value: 'SCHEDULE_MONTHLY', label: 'شهري' },
  { value: 'ONE_TIME',         label: 'مرة واحدة' },
];

export function SearchFilters({
  activeTab, state, setters, govOpts, condOpts, fuelOpts, transOpts, years,
  CAR_MAKES, applyFilters, applyNow, activeFilterCount, clearAllFilters, dark = false,
}: SearchFiltersProps) {
  const d = dark;
  const isAll      = activeTab === '';
  const isListings = activeTab === 'listings';
  const isParts    = activeTab === 'parts';
  const isBuses    = activeTab === 'buses';
  const isServices = activeTab === 'services';
  const isJobs     = activeTab === 'jobs';
  const isTransport= activeTab === 'transport';
  const isTrips    = activeTab === 'trips';

  const makeOpts   = CAR_MAKES.map(m => ({ value: m, label: m }));
  const yearOpts   = years.map(y => ({ value: y, label: y }));

  // ── per-group active counts ──
  const cShared  = [state.gov, state.sort].filter(Boolean).length;
  const cPrice   = [state.minP, state.maxP].filter(Boolean).length;
  const cCar     = [state.make, state.cond, state.fuel, state.trans, state.lt, state.model, state.yearMin, state.yearMax].filter(Boolean).length;
  const cBusSpec = [state.busType, state.busLT, state.capMin, state.capMax].filter(Boolean).length;
  const cPartSpec= [state.partCat, state.cond].filter(Boolean).length;
  const cSvcSpec = [state.svcType, state.provType, state.homeServ ? 'x' : ''].filter(Boolean).length;
  const cJobSpec = [state.jobType, state.empType, state.lic].filter(Boolean).length;
  const cTrSpec  = [state.trType, state.provType].filter(Boolean).length;
  const cTripSpec= [state.tripType, state.sched].filter(Boolean).length;

  return (
    <div className={clsx('space-y-2', d ? 'pt-3' : 'p-1')}>

      {/* ── Clear all ── */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pb-1">
          <span className={clsx('text-xs font-bold', d ? 'text-white/60' : 'text-on-surface-variant')}>
            {activeFilterCount} فلتر مفعّل
          </span>
          <button type="button" onClick={clearAllFilters}
            className={clsx('flex items-center gap-1 text-xs font-black transition-colors',
              d ? 'text-white/80 hover:text-white' : 'text-primary hover:text-primary/70')}>
            <span className="material-symbols-outlined text-sm">filter_list_off</span>
            مسح الكل
          </button>
        </div>
      )}

      {/* ══ GROUP 1: الترتيب والموقع (all tabs) ══ */}
      {/* API param: sort, governorate */}
      <FilterGroup icon="sort" label="الترتيب والموقع" activeCount={cShared} defaultOpen dark={d}>
        <FilterRow label="ترتيب النتائج" dark={d}>
          {/* 3 values → PillGroup */}
          <PillGroup options={SORT_OPTS} value={state.sort}
            onChange={v => { setters.setSort(v); applyNow('sort', v); }} dark={d} />
        </FilterRow>
        <FilterRow label="المحافظة" dark={d}>
          {/* 12+ values → SearchableSelect */}
          <SearchableSelect options={govOpts} value={state.gov} placeholder="كل المحافظات"
            onChange={v => { setters.setGov(v); applyNow('governorate', v); }} dark={d} />
        </FilterRow>
      </FilterGroup>

      {/* ══ GROUP 2: السيارة — listings + isAll ══ */}
      {/* API /api/listings → make, model, listingType, condition, fuelType, transmission */}
      {(isListings || isAll) && (
        <FilterGroup icon="directions_car" label="السيارة" activeCount={cCar} dark={d}>
          <FilterRow label="نوع الإعلان" dark={d}>
            {/* 3 values → PillGroup */}
            <PillGroup options={LISTING_TYPES} value={state.lt}
              onChange={v => { setters.setLt(v); applyNow('listingType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="الماركة" dark={d}>
            <SearchableSelect options={makeOpts} value={state.make} placeholder="كل الماركات"
              onChange={v => { setters.setMake(v); applyNow('make', v); }} dark={d} />
          </FilterRow>
          {isListings && (
            <FilterRow label="الموديل" dark={d}>
              <input value={state.model} onChange={e => setters.setModel(e.target.value)}
                onBlur={() => applyFilters()}
                placeholder="مثال: Camry"
                className={clsx('w-full text-xs font-bold px-3 py-2 rounded-xl border outline-none transition-all',
                  d ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50'
                    : 'bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50')}
              />
            </FilterRow>
          )}
          <FilterRow label="الحالة" dark={d}>
            {/* 3 values → PillGroup */}
            <PillGroup options={condOpts} value={state.cond}
              onChange={v => { setters.setCond(v); applyNow('condition', v); }} dark={d} />
          </FilterRow>
          {isListings && (<>
            <FilterRow label="نوع الوقود" dark={d}>
              <SearchableSelect options={fuelOpts} value={state.fuel} placeholder="كل أنواع الوقود"
                onChange={v => { setters.setFuel(v); applyNow('fuelType', v); }} dark={d} />
            </FilterRow>
            <FilterRow label="ناقل الحركة" dark={d}>
              {/* 2 values → PillGroup */}
              <PillGroup options={transOpts} value={state.trans}
                onChange={v => { setters.setTrans(v); applyNow('transmission', v); }} dark={d} />
            </FilterRow>
            <FilterRow label="سنة الصنع" dark={d}>
              <div className="flex items-center gap-2">
                <SearchableSelect options={yearOpts} value={state.yearMin} placeholder="من"
                  onChange={v => { setters.setYearMin(v); applyNow('yearMin', v); }} dark={d} />
                <span className={clsx('text-xs shrink-0', d ? 'text-white/40' : 'text-on-surface-variant/50')}>—</span>
                <SearchableSelect options={yearOpts} value={state.yearMax} placeholder="إلى"
                  onChange={v => { setters.setYearMax(v); applyNow('yearMax', v); }} dark={d} />
              </div>
            </FilterRow>
          </>)}
        </FilterGroup>
      )}

      {/* ══ GROUP 3: السعر — listings, parts, buses, isAll ══ */}
      {/* API: listings→priceMin/priceMax, parts/buses→minPrice/maxPrice */}
      {(isAll || isListings || isParts || isBuses) && (
        <FilterGroup icon="payments" label="نطاق السعر" activeCount={cPrice} dark={d}>
          <RangeInputs minVal={state.minP} maxVal={state.maxP}
            onMinChange={setters.setMinP} onMaxChange={setters.setMaxP}
            onBlur={() => applyFilters()} unit="OMR" dark={d} />
        </FilterGroup>
      )}

      {/* ══ GROUP 4: قطع الغيار — parts ══ */}
      {/* API /api/parts → partCategory, condition, make */}
      {isParts && (
        <FilterGroup icon="settings" label="قطع الغيار" activeCount={cPartSpec} dark={d}>
          <FilterRow label="الفئة" dark={d}>
            {/* 11 values → SearchableSelect */}
            <SearchableSelect options={PART_CATS} value={state.partCat} placeholder="كل الفئات"
              onChange={v => { setters.setPartCat(v); applyNow('partCategory', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="الماركة" dark={d}>
            <SearchableSelect options={makeOpts} value={state.make} placeholder="كل الماركات"
              onChange={v => { setters.setMake(v); applyNow('make', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="الحالة" dark={d}>
            <PillGroup
              options={[{ value: 'NEW', label: 'جديد' }, { value: 'USED', label: 'مستعمل' }, { value: 'REFURBISHED', label: 'مجدد' }]}
              value={state.cond}
              onChange={v => { setters.setCond(v); applyNow('condition', v); }} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

      {/* ══ GROUP 5: الباصات — buses ══ */}
      {/* API /api/buses → busListingType, busType, make, minCapacity, maxCapacity */}
      {isBuses && (
        <FilterGroup icon="directions_bus" label="الباصات" activeCount={cBusSpec} dark={d}>
          <FilterRow label="نوع الإعلان" dark={d}>
            {/* 5 values → SearchableSelect */}
            <SearchableSelect options={BUS_LT} value={state.busLT} placeholder="كل الإعلانات"
              onChange={v => { setters.setBusLT(v); applyNow('busListingType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="نوع الباص" dark={d}>
            {/* 5 values → SearchableSelect */}
            <SearchableSelect options={BUS_TYPES} value={state.busType} placeholder="كل الأنواع"
              onChange={v => { setters.setBusType(v); applyNow('busType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="الماركة" dark={d}>
            <SearchableSelect options={makeOpts} value={state.make} placeholder="كل الماركات"
              onChange={v => { setters.setMake(v); applyNow('make', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="السعة (عدد الركاب)" dark={d}>
            <RangeInputs minVal={state.capMin} maxVal={state.capMax}
              onMinChange={setters.setCapMin} onMaxChange={setters.setCapMax}
              onBlur={() => applyFilters()} unit="راكب" dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

      {/* ══ GROUP 6: الخدمات — services ══ */}
      {/* API /api/services → serviceType, providerType, isHomeService */}
      {isServices && (
        <FilterGroup icon="home_repair_service" label="الخدمات" activeCount={cSvcSpec} dark={d}>
          <FilterRow label="نوع الخدمة" dark={d}>
            {/* 9 values → SearchableSelect */}
            <SearchableSelect options={SVC_TYPES} value={state.svcType} placeholder="كل الخدمات"
              onChange={v => { setters.setSvcType(v); applyNow('serviceType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="نوع المزود" dark={d}>
            {/* 4 values → PillGroup */}
            <PillGroup options={PROV_TYPES} value={state.provType}
              onChange={v => { setters.setProvType(v); applyNow('providerType', v); }} dark={d} />
          </FilterRow>
          <Toggle value={state.homeServ} label="خدمة منزلية فقط" dark={d}
            onChange={v => { setters.setHomeServ(v); applyFilters({ isHomeService: v ? 'true' : '' }); }} />
        </FilterGroup>
      )}

      {/* ══ GROUP 7: الوظائف — jobs ══ */}
      {/* API /api/jobs → jobType, employmentType, licenseType */}
      {isJobs && (
        <FilterGroup icon="work" label="الوظائف" activeCount={cJobSpec} dark={d}>
          <FilterRow label="نوع الوظيفة" dark={d}>
            {/* 2 values → PillGroup */}
            <PillGroup options={JOB_TYPES} value={state.jobType}
              onChange={v => { setters.setJobType(v); applyNow('jobType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="نوع التوظيف" dark={d}>
            {/* 4 values → PillGroup */}
            <PillGroup options={EMP_TYPES} value={state.empType}
              onChange={v => { setters.setEmpType(v); applyNow('employmentType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="نوع الرخصة" dark={d}>
            {/* 5 values → SearchableSelect */}
            <SearchableSelect options={LIC_TYPES} value={state.lic} placeholder="أي رخصة"
              onChange={v => { setters.setLic(v); applyNow('licenseType', v); }} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

      {/* ══ GROUP 8: النقل — transport ══ */}
      {/* API /api/transport → transportType, providerType */}
      {isTransport && (
        <FilterGroup icon="local_shipping" label="النقل" activeCount={cTrSpec} dark={d}>
          <FilterRow label="نوع النقل" dark={d}>
            {/* 6 values → SearchableSelect */}
            <SearchableSelect options={TR_TYPES} value={state.trType} placeholder="كل أنواع النقل"
              onChange={v => { setters.setTrType(v); applyNow('transportType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="نوع المزود" dark={d}>
            <PillGroup options={PROV_TYPES} value={state.provType}
              onChange={v => { setters.setProvType(v); applyNow('providerType', v); }} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

      {/* ══ GROUP 9: الرحلات — trips ══ */}
      {/* API /api/trips → tripType, scheduleType */}
      {isTrips && (
        <FilterGroup icon="route" label="الرحلات" activeCount={cTripSpec} dark={d}>
          <FilterRow label="نوع الرحلة" dark={d}>
            {/* 5 values → SearchableSelect */}
            <SearchableSelect options={TRIP_TYPES} value={state.tripType} placeholder="كل الرحلات"
              onChange={v => { setters.setTripType(v); applyNow('tripType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label="الجدول الزمني" dark={d}>
            {/* 4 values → PillGroup */}
            <PillGroup options={SCHED_TYPES} value={state.sched}
              onChange={v => { setters.setSched(v); applyNow('scheduleType', v); }} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

    </div>
  );
}
