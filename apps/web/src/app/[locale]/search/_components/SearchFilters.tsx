'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import clsx from 'clsx';
import { useModels, useRecentFilters, type RecentFilterEntry } from './useFilterIntelligence';
import { useDropdownPortal, DropdownPortal } from './DropdownPortal';

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
  const [pulsing, setPulsing] = useState<string | null>(null);

  function handleClick(v: string) {
    const next = value === v ? '' : v;
    if (next) {
      setPulsing(next);
      setTimeout(() => setPulsing(null), 210);
    }
    onChange(next);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          onClick={() => handleClick(o.value)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-bold border transition-colors',
            pulsing === o.value && 'pill-selected',
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

/** Searchable select — for enums with 5+ values.
 *  - dark=false (desktop): uses DropdownPortal (renders into document.body)
 *  - dark=true  (mobile BottomSheet): uses inline accordion (no portal needed)
 */
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

  const handleClose = useCallback(() => { setOpen(false); setSearch(''); }, []);
  const { triggerRef, pos } = useDropdownPortal(open && !dark, handleClose);
  const t = useTranslations('pages');

  // ── shared option list content ──
  function OptionList() {
    return (
      <>
        <div className="p-2 border-b border-outline-variant/10">
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('sfSearchPlaceholder')}
            className={clsx(
              'w-full text-xs px-2 py-1.5 rounded-lg outline-none',
              dark
                ? 'bg-white/10 text-white placeholder:text-white/40'
                : 'bg-surface-container text-on-surface placeholder:text-on-surface-variant/50'
            )}
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); handleClose(); }}
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
              onClick={() => { onChange(o.value); handleClose(); }}
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
      </>
    );
  }

  const triggerCls = clsx(
    'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-bold',
    'filter-input-focus transition-colors',
    dark
      ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
      : 'bg-surface-container border-outline-variant/20 text-on-surface hover:border-primary/40'
  );

  const panelCls = clsx(
    'rounded-xl border shadow-lg overflow-hidden',
    dark ? 'bg-[#0B2447] border-white/20' : 'bg-surface-container-lowest border-outline-variant/20'
  );

  // ── Mobile (inside BottomSheet): inline accordion, no portal ──
  if (dark) {
    return (
      <div>
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setSearch(''); }}
          className={triggerCls}
        >
          <span className={selected ? 'text-white' : 'text-white/50'}>
            {selected ? selected.label : placeholder}
          </span>
          <span className={clsx('material-symbols-outlined text-sm transition-transform duration-200', open && 'rotate-180')}>
            expand_more
          </span>
        </button>
        {open && (
          <div className={clsx(panelCls, 'mt-1 search-dropdown-enter')}>
            <OptionList />
          </div>
        )}
      </div>
    );
  }

  // ── Desktop: portal-based dropdown ──
  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className={triggerCls}
      >
        <span className={selected ? '' : 'text-on-surface-variant/60'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={clsx('material-symbols-outlined text-sm transition-transform duration-200', open && 'rotate-180')}>
          expand_more
        </span>
      </button>

      <DropdownPortal open={open} pos={pos} onClose={handleClose} triggerRef={triggerRef} className={panelCls}>
        <OptionList />
      </DropdownPortal>
    </div>
  );
}

/** Number range — two inputs side by side */
function RangeInputs({
  minVal, maxVal, onMinChange, onMaxChange, onBlur, unit, dark = false,
}: {
  minVal: string; maxVal: string; onMinChange: (v: string) => void; onMaxChange: (v: string) => void;
  onBlur: () => void;
  unit?: string;
  dark?: boolean;
}) {
  const t = useTranslations('pages');
  const base = clsx(
    'flex-1 min-w-0 text-xs font-bold px-3 py-2 rounded-xl border outline-none filter-input-focus',
    dark
      ? 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40'
      : 'bg-surface-container border-outline-variant/20 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/40'
  );
  return (
    <div className="flex items-center gap-2">
      <input type="number" min="0" value={minVal} onChange={e => onMinChange(e.target.value)} onBlur={onBlur}
        placeholder={t('sfPlaceholderFrom')} className={base} />
      <span className={clsx('text-xs shrink-0', dark ? 'text-white/40' : 'text-on-surface-variant/50')}>—</span>
      <input type="number" min="0" value={maxVal} onChange={e => onMaxChange(e.target.value)} onBlur={onBlur}
        placeholder={t('sfPlaceholderTo')} className={base} />
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
      className="flex items-center justify-between w-full group">
      <span className={clsx('text-xs font-bold', dark ? 'text-white' : 'text-on-surface')}>{label}</span>
      <div className={clsx(
        'relative w-11 h-6 rounded-full shrink-0',
        'transition-colors duration-200',
        value ? 'bg-primary' : dark ? 'bg-white/20' : 'bg-outline-variant/40'
      )}>
        <div className={clsx(
          'absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm',
          'transition-[right] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
          value ? 'right-1' : 'right-6'
        )} />
      </div>
    </button>
  );
}

/** Collapsible filter group */
function FilterGroup({
  icon, label, activeCount, children, defaultOpen = false, dark = false, onClear,
}: {
  icon: string; label: string; activeCount: number;
  children: React.ReactNode; defaultOpen?: boolean; dark?: boolean;
  onClear?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={clsx('rounded-xl border overflow-hidden',
      dark ? 'border-white/15 bg-white/5' : 'border-outline-variant/15 bg-surface-container-lowest')}>
      <button type="button" onClick={() => setOpen(!open)}
        className={clsx('w-full flex items-center gap-2 px-4 py-3 transition-colors',
          dark ? 'hover:bg-white/5' : 'hover:bg-surface-container')}>
        <span className={clsx('material-symbols-outlined text-base shrink-0',
          dark ? 'text-white/70' : 'text-on-surface-variant')}>{icon}</span>
        <span className={clsx('flex-1 text-right text-sm font-black',
          dark ? 'text-white' : 'text-on-surface')}>{label}</span>
        {activeCount > 0 && (
          <>
            <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full shrink-0',
              dark ? 'bg-white text-primary' : 'bg-primary text-on-primary')}>
              {activeCount}
            </span>
            {onClear && (
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onClear(); }}
                className={clsx(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 transition-colors',
                  dark
                    ? 'border-white/30 text-white/60 hover:bg-white/10'
                    : 'border-outline-variant/30 text-on-surface-variant/60 hover:text-error hover:border-error/30'
                )}
              >
                مسح
              </button>
            )}
          </>
        )}
        <span className={clsx('material-symbols-outlined text-sm transition-transform duration-200 shrink-0',
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

/** Dependent model dropdown with loading state */
function ModelSelect({
  brand, value, onChange, dark = false,
}: {
  brand: string; value: string; onChange: (v: string) => void; dark?: boolean;
}) {
  const t = useTranslations('pages');
  const { models: opts, loading } = useModels(brand);

  if (!brand) {
    return (
      <p className={clsx('text-[11px] italic', dark ? 'text-white/40' : 'text-on-surface-variant/50')}>
        {t('sfRowModel')}
      </p>
    );
  }

  if (loading) {
    return (
      <div className={clsx(
        'w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold',
        dark ? 'bg-white/10 border-white/20 text-white/50' : 'bg-surface-container border-outline-variant/20 text-on-surface-variant/50'
      )}>
        <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3"/>
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        {t('sfLoading')}
      </div>
    );
  }

  if (opts.length === 0) {
    return (
      <p className={clsx('text-[11px] italic', dark ? 'text-white/40' : 'text-on-surface-variant/50')}>
        {t('sfNoModels')}
      </p>
    );
  }

  return (
    <SearchableSelect
      options={opts.map(m => ({ value: m, label: m }))}
      value={value}
      onChange={onChange}
      placeholder={t('sfPlaceholderAllModels')}
      dark={dark}
    />
  );
}

/** Recent filter chips row */
function RecentFiltersRow({
  recents, onApply, dark = false,
}: {
  recents: RecentFilterEntry[];
  onApply: (params: Record<string, string>) => void;
  dark?: boolean;
}) {
  const t = useTranslations('pages');
  if (recents.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className={clsx('text-[10px] font-bold uppercase tracking-wide',
        dark ? 'text-white/40' : 'text-on-surface-variant/50')}>{t('sfRecentSearchLabel')}</p>
      <div className="flex flex-col gap-1.5">
        {recents.map((r, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onApply(r.params)}
            className={clsx(
              'text-right text-[11px] font-bold px-3 py-2 rounded-xl border truncate transition-colors',
              dark
                ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                : 'bg-surface-container border-outline-variant/15 text-on-surface-variant hover:border-primary/30 hover:text-primary'
            )}
          >
            <span className={clsx('ml-1.5', dark ? 'text-white/30' : 'text-on-surface-variant/40')}>↩</span>
            {r.label}
          </button>
        ))}
      </div>
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

export function SearchFilters({
  activeTab, state, setters, govOpts, condOpts, fuelOpts, transOpts, years,
  CAR_MAKES, applyFilters, applyNow, activeFilterCount, clearAllFilters, dark = false,
}: SearchFiltersProps) {
  const d = dark;
  const t = useTranslations('pages');

  const LISTING_TYPES = [
    { value: 'SALE',   label: t('sfListSale') },
    { value: 'RENTAL', label: t('sfListRental') },
    { value: 'WANTED', label: t('sfListWanted') },
  ];
  const SORT_OPTS = [
    { value: '',           label: t('sfSortNewest') },
    { value: 'price:asc',  label: t('sfSortLowest') },
    { value: 'price:desc', label: t('sfSortHighest') },
  ];
  const BUS_TYPES = [
    { value: 'MINI_BUS',   label: t('sfBusMini') },
    { value: 'MEDIUM_BUS', label: t('sfBusMedium') },
    { value: 'LARGE_BUS',  label: t('sfBusLarge') },
    { value: 'COASTER',    label: t('sfBusCoaster') },
    { value: 'SCHOOL_BUS', label: t('sfBusSchool') },
  ];
  const BUS_LT = [
    { value: 'BUS_SALE',               label: t('sfBusLtSale') },
    { value: 'BUS_SALE_WITH_CONTRACT', label: t('sfBusLtSaleContract') },
    { value: 'BUS_CONTRACT',           label: t('sfBusLtContract') },
    { value: 'BUS_RENT',               label: t('sfBusLtRent') },
    { value: 'BUS_REQUEST',            label: t('sfBusLtRequest') },
  ];
  const PART_CATS = [
    { value: 'ENGINE',      label: t('sfPartEngine') },
    { value: 'BODY',        label: t('sfPartBody') },
    { value: 'ELECTRICAL',  label: t('sfPartElectrical') },
    { value: 'SUSPENSION',  label: t('sfPartSuspension') },
    { value: 'BRAKES',      label: t('sfPartBrakes') },
    { value: 'INTERIOR',    label: t('sfPartInterior') },
    { value: 'TIRES',       label: t('sfPartTires') },
    { value: 'BATTERIES',   label: t('sfPartBatteries') },
    { value: 'OILS',        label: t('sfPartOils') },
    { value: 'ACCESSORIES', label: t('sfPartAccessories') },
    { value: 'OTHER',       label: t('sfPartOther') },
  ];
  const SVC_TYPES = [
    { value: 'MAINTENANCE',         label: t('sfSvcMaintenance') },
    { value: 'CLEANING',            label: t('sfSvcCleaning') },
    { value: 'MODIFICATION',        label: t('sfSvcModification') },
    { value: 'INSPECTION',          label: t('sfSvcInspection') },
    { value: 'BODYWORK',            label: t('sfSvcBodywork') },
    { value: 'ACCESSORIES_INSTALL', label: t('sfSvcAccessories') },
    { value: 'KEYS_LOCKS',          label: t('sfSvcKeys') },
    { value: 'TOWING',              label: t('sfSvcTowing') },
    { value: 'OTHER_SERVICE',       label: t('sfSvcOther') },
  ];
  const PROV_TYPES = [
    { value: 'WORKSHOP',   label: t('sfProvWorkshop') },
    { value: 'INDIVIDUAL', label: t('sfProvIndividual') },
    { value: 'MOBILE',     label: t('sfProvMobile') },
    { value: 'COMPANY',    label: t('sfProvCompany') },
  ];
  const JOB_TYPES = [
    { value: 'OFFERING', label: t('sfJobOffering') },
    { value: 'HIRING',   label: t('sfJobHiring') },
  ];
  const EMP_TYPES = [
    { value: 'FULL_TIME',  label: t('sfEmpFullTime') },
    { value: 'PART_TIME',  label: t('sfEmpPartTime') },
    { value: 'TEMPORARY',  label: t('sfEmpTemporary') },
    { value: 'CONTRACT',   label: t('sfEmpContract') },
  ];
  const LIC_TYPES = [
    { value: 'LIGHT',      label: t('sfLicLight') },
    { value: 'HEAVY',      label: t('sfLicHeavy') },
    { value: 'TRANSPORT',  label: t('sfLicTransport') },
    { value: 'BUS',        label: t('sfLicBus') },
    { value: 'MOTORCYCLE', label: t('sfLicMotorcycle') },
  ];
  const TR_TYPES = [
    { value: 'CARGO',           label: t('sfTrCargo') },
    { value: 'FURNITURE',       label: t('sfTrFurniture') },
    { value: 'DELIVERY',        label: t('sfTrDelivery') },
    { value: 'HEAVY_TRANSPORT', label: t('sfTrHeavy') },
    { value: 'TRUCK_RENTAL',    label: t('sfTrTruckRental') },
    { value: 'OTHER_TRANSPORT', label: t('sfTrOther') },
  ];
  const TRIP_TYPES = [
    { value: 'BUS_SUBSCRIPTION', label: t('sfTripBusSub') },
    { value: 'SCHOOL_TRANSPORT', label: t('sfTripSchool') },
    { value: 'TOURISM',          label: t('sfTripTourism') },
    { value: 'CORPORATE',        label: t('sfTripCorporate') },
    { value: 'CARPOOLING',       label: t('sfTripCarpooling') },
  ];
  const SCHED_TYPES = [
    { value: 'SCHEDULE_DAILY',   label: t('sfSchedDaily') },
    { value: 'SCHEDULE_WEEKLY',  label: t('sfSchedWeekly') },
    { value: 'SCHEDULE_MONTHLY', label: t('sfSchedMonthly') },
    { value: 'ONE_TIME',         label: t('sfSchedOneTime') },
  ];
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

  // ── recent filters (read-only — saving handled by page.tsx) ──
  const { recents } = useRecentFilters(activeTab);

  function applyRecent(params: Record<string, string>) {
    applyFilters(params);
  }

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

  // ── per-group clear handlers ──
  function clearShared()   { applyFilters({ governorate: '', sort: '' }); }
  function clearPrice()    { applyFilters({ minPrice: '', maxPrice: '' }); }
  function clearCar()      { applyFilters({ make: '', model: '', condition: '', fuelType: '', transmission: '', listingType: '', yearMin: '', yearMax: '' }); }
  function clearBusSpec()  { applyFilters({ busType: '', busListingType: '', capMin: '', capMax: '' }); }
  function clearPartSpec() { applyFilters({ partCategory: '', condition: '' }); }
  function clearSvcSpec()  { applyFilters({ serviceType: '', providerType: '', isHomeService: '' }); }
  function clearJobSpec()  { applyFilters({ jobType: '', employmentType: '', licenseType: '' }); }
  function clearTrSpec()   { applyFilters({ transportType: '', providerType: '' }); }
  function clearTripSpec() { applyFilters({ tripType: '', scheduleType: '' }); }

  return (
    <div className={clsx('space-y-2', d ? 'pt-3' : 'p-1')}>

      {/* ── Recent filters ── */}
      {recents.length > 0 && (
        <div className={clsx('rounded-xl border p-3 space-y-2',
          d ? 'border-white/10 bg-white/5' : 'border-outline-variant/15 bg-surface-container-lowest')}>
          <RecentFiltersRow recents={recents} onApply={applyRecent} dark={d} />
        </div>
      )}

      {/* ── Clear all ── */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between pb-1">
          <span className={clsx('text-xs font-bold', d ? 'text-white/60' : 'text-on-surface-variant')}>
            {t('sfActiveFilters', { count: activeFilterCount })}
          </span>
          <button type="button" onClick={clearAllFilters}
            className={clsx('flex items-center gap-1 text-xs font-black transition-colors',
              d ? 'text-white/80 hover:text-white' : 'text-primary hover:text-primary/70')}>
            <span className="material-symbols-outlined text-sm">filter_list_off</span>
            {t('sfClearAll')}
          </button>
        </div>
      )}

      {/* ══ GROUP 1: الترتيب والموقع (all tabs) ══ */}
      {/* API param: sort, governorate */}
      <FilterGroup icon="sort" label={t('sfGrpSortLoc')} activeCount={cShared} defaultOpen dark={d} onClear={cShared > 0 ? clearShared : undefined}>
        <FilterRow label={t('sfRowSort')} dark={d}>
          {/* 3 values → PillGroup */}
          <PillGroup options={SORT_OPTS} value={state.sort}
            onChange={v => { setters.setSort(v); applyNow('sort', v); }} dark={d} />
        </FilterRow>
        <FilterRow label={t('sfRowGov')} dark={d}>
          {/* 12+ values → SearchableSelect */}
          <SearchableSelect options={govOpts} value={state.gov} placeholder={t('sfPlaceholderAllGov')}
            onChange={v => { setters.setGov(v); applyNow('governorate', v); }} dark={d} />
        </FilterRow>
      </FilterGroup>

      {/* ══ GROUP 2: السيارة — listings + isAll ══ */}
      {/* API /api/listings → make, model, listingType, condition, fuelType, transmission */}
      {(isListings || isAll) && (
        <FilterGroup icon="directions_car" label={t('sfGrpCar')} activeCount={cCar} dark={d} onClear={cCar > 0 ? clearCar : undefined}>
          <FilterRow label={t('sfRowListType')} dark={d}>
            {/* 3 values → PillGroup */}
            <PillGroup options={LISTING_TYPES} value={state.lt}
              onChange={v => { setters.setLt(v); applyNow('listingType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowMake')} dark={d}>
            <SearchableSelect options={makeOpts} value={state.make} placeholder={t('sfPlaceholderAllMakes')}
              onChange={v => { setters.setMake(v); applyNow('make', v); }} dark={d} />
          </FilterRow>
          {isListings && (
            <FilterRow label={t('sfRowModel')} dark={d}>
              <ModelSelect
                brand={state.make}
                value={state.model}
                onChange={v => { setters.setModel(v); applyNow('model', v); }}
                dark={d}
              />
            </FilterRow>
          )}
          <FilterRow label={t('sfRowCond')} dark={d}>
            {/* 3 values → PillGroup */}
            <PillGroup options={condOpts} value={state.cond}
              onChange={v => { setters.setCond(v); applyNow('condition', v); }} dark={d} />
          </FilterRow>
          {isListings && (<>
            <FilterRow label={t('sfRowFuel')} dark={d}>
              <SearchableSelect options={fuelOpts} value={state.fuel} placeholder={t('sfPlaceholderAllFuels')}
                onChange={v => { setters.setFuel(v); applyNow('fuelType', v); }} dark={d} />
            </FilterRow>
            <FilterRow label={t('sfRowTrans')} dark={d}>
              {/* 2 values → PillGroup */}
              <PillGroup options={transOpts} value={state.trans}
                onChange={v => { setters.setTrans(v); applyNow('transmission', v); }} dark={d} />
            </FilterRow>
            <FilterRow label={t('sfRowYear')} dark={d}>
              <div className="flex items-center gap-2">
                <SearchableSelect options={yearOpts} value={state.yearMin} placeholder={t('sfPlaceholderFrom')}
                  onChange={v => { setters.setYearMin(v); applyNow('yearMin', v); }} dark={d} />
                <span className={clsx('text-xs shrink-0', d ? 'text-white/40' : 'text-on-surface-variant/50')}>—</span>
                <SearchableSelect options={yearOpts} value={state.yearMax} placeholder={t('sfPlaceholderTo')}
                  onChange={v => { setters.setYearMax(v); applyNow('yearMax', v); }} dark={d} />
              </div>
            </FilterRow>
          </>)}
        </FilterGroup>
      )}

      {/* ══ GROUP 3: السعر — listings, parts, buses, isAll ══ */}
      {/* API: listings→priceMin/priceMax, parts/buses→minPrice/maxPrice */}
      {(isAll || isListings || isParts || isBuses) && (
        <FilterGroup icon="payments" label={t('sfGrpPrice')} activeCount={cPrice} dark={d} onClear={cPrice > 0 ? clearPrice : undefined}>
          <RangeInputs minVal={state.minP} maxVal={state.maxP}
            onMinChange={setters.setMinP} onMaxChange={setters.setMaxP}
            onBlur={() => applyFilters()} unit="OMR" dark={d} />
        </FilterGroup>
      )}

      {/* ══ GROUP 4: قطع الغيار — parts ══ */}
      {/* API /api/parts → partCategory, condition, make */}
      {isParts && (
        <FilterGroup icon="settings" label={t('sfGrpParts')} activeCount={cPartSpec} dark={d} onClear={cPartSpec > 0 ? clearPartSpec : undefined}>
          <FilterRow label={t('sfRowCat')} dark={d}>
            {/* 11 values → SearchableSelect */}
            <SearchableSelect options={PART_CATS} value={state.partCat} placeholder={t('sfPlaceholderAllCats')}
              onChange={v => { setters.setPartCat(v); applyNow('partCategory', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowMake')} dark={d}>
            <SearchableSelect options={makeOpts} value={state.make} placeholder={t('sfPlaceholderAllMakes')}
              onChange={v => { setters.setMake(v); applyNow('make', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowCond')} dark={d}>
            <PillGroup
              options={[{ value: 'NEW', label: t('sfCondNew') }, { value: 'USED', label: t('sfCondUsed') }, { value: 'REFURBISHED', label: t('sfCondRefurbished') }]}
              value={state.cond}
              onChange={v => { setters.setCond(v); applyNow('condition', v); }} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

      {/* ══ GROUP 5: الباصات — buses ══ */}
      {/* API /api/buses → busListingType, busType, make, minCapacity, maxCapacity */}
      {isBuses && (
        <FilterGroup icon="directions_bus" label={t('sfGrpBus')} activeCount={cBusSpec} dark={d} onClear={cBusSpec > 0 ? clearBusSpec : undefined}>
          <FilterRow label={t('sfRowBusListType')} dark={d}>
            {/* 5 values → SearchableSelect */}
            <SearchableSelect options={BUS_LT} value={state.busLT} placeholder={t('sfPlaceholderAllListings')}
              onChange={v => { setters.setBusLT(v); applyNow('busListingType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowBusType')} dark={d}>
            {/* 5 values → SearchableSelect */}
            <SearchableSelect options={BUS_TYPES} value={state.busType} placeholder={t('sfPlaceholderAllTypes')}
              onChange={v => { setters.setBusType(v); applyNow('busType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowMake')} dark={d}>
            <SearchableSelect options={makeOpts} value={state.make} placeholder={t('sfPlaceholderAllMakes')}
              onChange={v => { setters.setMake(v); applyNow('make', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowCapacity')} dark={d}>
            <RangeInputs minVal={state.capMin} maxVal={state.capMax}
              onMinChange={setters.setCapMin} onMaxChange={setters.setCapMax}
              onBlur={() => applyFilters()} unit={t('sfUnitPassenger')} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

      {/* ══ GROUP 6: الخدمات — services ══ */}
      {/* API /api/services → serviceType, providerType, isHomeService */}
      {isServices && (
        <FilterGroup icon="home_repair_service" label={t('sfGrpServices')} activeCount={cSvcSpec} dark={d} onClear={cSvcSpec > 0 ? clearSvcSpec : undefined}>
          <FilterRow label={t('sfRowSvcType')} dark={d}>
            {/* 9 values → SearchableSelect */}
            <SearchableSelect options={SVC_TYPES} value={state.svcType} placeholder={t('sfPlaceholderAllServices')}
              onChange={v => { setters.setSvcType(v); applyNow('serviceType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowProvType')} dark={d}>
            {/* 4 values → PillGroup */}
            <PillGroup options={PROV_TYPES} value={state.provType}
              onChange={v => { setters.setProvType(v); applyNow('providerType', v); }} dark={d} />
          </FilterRow>
          <Toggle value={state.homeServ} label={t('sfToggleHome')} dark={d}
            onChange={v => { setters.setHomeServ(v); applyFilters({ isHomeService: v ? 'true' : '' }); }} />
        </FilterGroup>
      )}

      {/* ══ GROUP 7: الوظائف — jobs ══ */}
      {/* API /api/jobs → jobType, employmentType, licenseType */}
      {isJobs && (
        <FilterGroup icon="work" label={t('sfGrpJobs')} activeCount={cJobSpec} dark={d} onClear={cJobSpec > 0 ? clearJobSpec : undefined}>
          <FilterRow label={t('sfRowJobType')} dark={d}>
            {/* 2 values → PillGroup */}
            <PillGroup options={JOB_TYPES} value={state.jobType}
              onChange={v => { setters.setJobType(v); applyNow('jobType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowEmpType')} dark={d}>
            {/* 4 values → PillGroup */}
            <PillGroup options={EMP_TYPES} value={state.empType}
              onChange={v => { setters.setEmpType(v); applyNow('employmentType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowLic')} dark={d}>
            {/* 5 values → SearchableSelect */}
            <SearchableSelect options={LIC_TYPES} value={state.lic} placeholder={t('sfPlaceholderAnyLic')}
              onChange={v => { setters.setLic(v); applyNow('licenseType', v); }} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

      {/* ══ GROUP 8: النقل — transport ══ */}
      {/* API /api/transport → transportType, providerType */}
      {isTransport && (
        <FilterGroup icon="local_shipping" label={t('sfGrpTransport')} activeCount={cTrSpec} dark={d} onClear={cTrSpec > 0 ? clearTrSpec : undefined}>
          <FilterRow label={t('sfRowTrType')} dark={d}>
            {/* 6 values → SearchableSelect */}
            <SearchableSelect options={TR_TYPES} value={state.trType} placeholder={t('sfPlaceholderAllTrTypes')}
              onChange={v => { setters.setTrType(v); applyNow('transportType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowProvType')} dark={d}>
            <PillGroup options={PROV_TYPES} value={state.provType}
              onChange={v => { setters.setProvType(v); applyNow('providerType', v); }} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

      {/* ══ GROUP 9: الرحلات — trips ══ */}
      {/* API /api/trips → tripType, scheduleType */}
      {isTrips && (
        <FilterGroup icon="route" label={t('sfGrpTrips')} activeCount={cTripSpec} dark={d} onClear={cTripSpec > 0 ? clearTripSpec : undefined}>
          <FilterRow label={t('sfRowTripType')} dark={d}>
            {/* 5 values → SearchableSelect */}
            <SearchableSelect options={TRIP_TYPES} value={state.tripType} placeholder={t('sfPlaceholderAllTrips')}
              onChange={v => { setters.setTripType(v); applyNow('tripType', v); }} dark={d} />
          </FilterRow>
          <FilterRow label={t('sfRowSched')} dark={d}>
            {/* 4 values → PillGroup */}
            <PillGroup options={SCHED_TYPES} value={state.sched}
              onChange={v => { setters.setSched(v); applyNow('scheduleType', v); }} dark={d} />
          </FilterRow>
        </FilterGroup>
      )}

    </div>
  );
}
