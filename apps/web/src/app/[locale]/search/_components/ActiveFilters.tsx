'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActiveFilter {
  key: string;       // URL param key to remove
  label: string;     // full Arabic label e.g. "ماركة: تويوتا"
  group?: string;    // optional group key for color coding
}

interface ActiveFiltersProps {
  filters: ActiveFilter[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
  isLoading?: boolean;
  total?: number;
}

// ─── Single chip ─────────────────────────────────────────────────────────────

function FilterChip({
  filter,
  onRemove,
}: {
  filter: ActiveFilter;
  onRemove: (key: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [removing, setRemoving] = useState(false);

  // scale-in on mount
  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
  }, []);

  function handleRemove() {
    setRemoving(true);
    // wait for collapse transition then call parent
    setTimeout(() => onRemove(filter.key), 220);
  }

  return (
    <span
      style={{
        transition: removing
          ? 'max-width 220ms ease, opacity 220ms ease, padding 220ms ease, margin 220ms ease'
          : 'transform 150ms ease, opacity 150ms ease',
        maxWidth: removing ? '0px' : '280px',
        opacity: removing ? 0 : visible ? 1 : 0,
        transform: !removing && visible ? 'scale(1)' : 'scale(0.85)',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        paddingLeft: removing ? 0 : undefined,
        paddingRight: removing ? 0 : undefined,
        marginLeft: removing ? 0 : undefined,
        marginRight: removing ? 0 : undefined,
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 shrink-0"
    >
      {filter.label}
      <button
        type="button"
        onClick={handleRemove}
        aria-label={`إزالة ${filter.label}`}
        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors shrink-0"
      >
        <X size={10} strokeWidth={3} />
      </button>
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ActiveFilters({ filters, onRemove, onClearAll, isLoading, total }: ActiveFiltersProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowVisible, setRowVisible] = useState(false);
  const [prevTotal, setPrevTotal] = useState(total);
  const [highlight, setHighlight] = useState(false);

  // slide-down + fade when row appears
  useEffect(() => {
    if (filters.length > 0) {
      requestAnimationFrame(() => requestAnimationFrame(() => setRowVisible(true)));
    } else {
      setRowVisible(false);
    }
  }, [filters.length > 0]); // eslint-disable-line

  // highlight animation when total changes
  useEffect(() => {
    if (total !== prevTotal && !isLoading) {
      setHighlight(true);
      setPrevTotal(total);
      setTimeout(() => setHighlight(false), 600);
    }
  }, [total, isLoading]); // eslint-disable-line

  if (filters.length === 0) return null;

  return (
    <div
      style={{
        transition: 'max-height 250ms ease, opacity 250ms ease, transform 250ms ease',
        maxHeight: rowVisible ? '120px' : '0px',
        opacity: rowVisible ? 1 : 0,
        transform: rowVisible ? 'translateY(0)' : 'translateY(-8px)',
        overflow: 'hidden',
      }}
    >
      <div
        ref={rowRef}
        className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar"
        dir="rtl"
      >
        {/* Active count + loading indicator */}
        <div className="shrink-0 flex items-center gap-1.5">
          {isLoading ? (
            <span className="text-[11px] text-on-surface-variant/60 font-medium animate-pulse">
              جارٍ التحديث...
            </span>
          ) : total !== undefined ? (
            <span
              className={clsx(
                'text-[11px] font-bold transition-colors duration-300',
                highlight ? 'text-primary' : 'text-on-surface-variant/70'
              )}
            >
              {total.toLocaleString('ar-EG')} نتيجة
            </span>
          ) : null}
          <span className="text-outline-variant/30 text-xs">|</span>
        </div>

        {/* Chips */}
        {filters.map(f => (
          <FilterChip key={f.key} filter={f} onRemove={onRemove} />
        ))}

        {/* Clear all — always last */}
        {filters.length > 1 && (
          <button
            type="button"
            onClick={onClearAll}
            className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border border-error/30 text-error bg-error/5 hover:bg-error/10 transition-colors"
          >
            <X size={10} strokeWidth={3} />
            مسح الكل
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Label builder ────────────────────────────────────────────────────────────

const ENUM_LABELS: Record<string, string> = {
  // sort
  'price:asc':  'الأقل سعراً',
  'price:desc': 'الأعلى سعراً',
  // listing type
  SALE: 'للبيع', RENTAL: 'للإيجار', WANTED: 'مطلوب',
  // condition
  NEW: 'جديد', USED: 'مستعمل', LIKE_NEW: 'شبه جديد', FAIR: 'مقبول', POOR: 'سيئ',
  REFURBISHED: 'مجدد',
  // fuel
  PETROL: 'بنزين', DIESEL: 'ديزل', HYBRID: 'هجين', ELECTRIC: 'كهربائي',
  // transmission
  AUTOMATIC: 'أوتوماتيك', MANUAL: 'يدوي',
  // bus type
  MINI_BUS: 'ميني باص', MEDIUM_BUS: 'باص متوسط', LARGE_BUS: 'باص كبير',
  COASTER: 'كوستر', SCHOOL_BUS: 'مدرسية',
  // bus listing type
  BUS_SALE: 'بيع', BUS_SALE_WITH_CONTRACT: 'بيع مع عقد',
  BUS_CONTRACT: 'تعاقد', BUS_RENT: 'إيجار', BUS_REQUEST: 'طلب',
  // part category
  ENGINE: 'محرك', BODY: 'هيكل', ELECTRICAL: 'كهربائيات',
  SUSPENSION: 'تعليق', BRAKES: 'فرامل', INTERIOR: 'داخلية',
  TIRES: 'إطارات', BATTERIES: 'بطاريات', OILS: 'زيوت',
  ACCESSORIES: 'إكسسوارات', OTHER: 'أخرى',
  // service type
  MAINTENANCE: 'صيانة', CLEANING: 'تنظيف', MODIFICATION: 'تعديل',
  INSPECTION: 'فحص', BODYWORK: 'هيكل وطلاء', ACCESSORIES_INSTALL: 'تركيب إكسسوارات',
  KEYS_LOCKS: 'مفاتيح وأقفال', TOWING: 'سحب', OTHER_SERVICE: 'أخرى',
  // provider type
  WORKSHOP: 'ورشة', INDIVIDUAL: 'فرد', MOBILE: 'متنقل', COMPANY: 'شركة',
  // job type
  OFFERING: 'عرض عمل', HIRING: 'طلب توظيف',
  // employment type
  FULL_TIME: 'دوام كامل', PART_TIME: 'دوام جزئي', TEMPORARY: 'مؤقت', CONTRACT: 'عقد',
  // license type
  LIGHT: 'رخصة خفيفة', HEAVY: 'رخصة ثقيلة', TRANSPORT: 'رخصة نقل',
  BUS: 'رخصة باص', MOTORCYCLE: 'رخصة دراجة',
  // transport type
  CARGO: 'شحن', FURNITURE: 'أثاث', DELIVERY: 'توصيل',
  HEAVY_TRANSPORT: 'نقل ثقيل', TRUCK_RENTAL: 'تأجير شاحنة', OTHER_TRANSPORT: 'أخرى',
  // trip type
  BUS_SUBSCRIPTION: 'اشتراك باص', SCHOOL_TRANSPORT: 'نقل مدرسي',
  TOURISM: 'سياحة', CORPORATE: 'شركات', CARPOOLING: 'مشاركة سيارة',
  // schedule type
  SCHEDULE_DAILY: 'يومي', SCHEDULE_WEEKLY: 'أسبوعي',
  SCHEDULE_MONTHLY: 'شهري', ONE_TIME: 'مرة واحدة',
};

function enumLabel(val: string): string {
  return ENUM_LABELS[val] ?? val;
}

export interface BuildFiltersInput {
  govParam: string;
  sortParam: string;
  minPParam: string;
  maxPParam: string;
  makeParam: string;
  condParam: string;
  fuelParam: string;
  transParam: string;
  ltParam: string;
  modelParam: string;
  yearMinParam: string;
  yearMaxParam: string;
  busTypeParam: string;
  busLTParam: string;
  capMinParam: string;
  capMaxParam: string;
  partCatParam: string;
  svcTypeParam: string;
  provTypeParam: string;
  homeParam: string;
  jobTypeParam: string;
  empTypeParam: string;
  licParam: string;
  trTypeParam: string;
  tripTypeParam: string;
  schedParam: string;
  govOpts: { value: string; label: string }[];
}

/** Builds the ActiveFilter[] list from current URL param values */
export function buildActiveFilters(p: BuildFiltersInput): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  const add = (key: string, label: string) => filters.push({ key, label });

  if (p.govParam) {
    const label = p.govOpts.find(g => g.value === p.govParam)?.label ?? p.govParam;
    add('governorate', `المحافظة: ${label}`);
  }
  if (p.sortParam)    add('sort',         `الترتيب: ${enumLabel(p.sortParam)}`);

  // price range — treated as one chip if both set, two chips if only one
  if (p.minPParam && p.maxPParam) {
    add('minPrice', `السعر: ${Number(p.minPParam).toLocaleString('ar-EG')} - ${Number(p.maxPParam).toLocaleString('ar-EG')} ر.ع`);
  } else if (p.minPParam) {
    add('minPrice', `السعر من: ${Number(p.minPParam).toLocaleString('ar-EG')} ر.ع`);
  } else if (p.maxPParam) {
    add('maxPrice', `السعر إلى: ${Number(p.maxPParam).toLocaleString('ar-EG')} ر.ع`);
  }

  if (p.makeParam)    add('make',          `الماركة: ${p.makeParam}`);
  if (p.modelParam)   add('model',         `الموديل: ${p.modelParam}`);
  if (p.condParam)    add('condition',     `الحالة: ${enumLabel(p.condParam)}`);
  if (p.fuelParam)    add('fuelType',      `الوقود: ${enumLabel(p.fuelParam)}`);
  if (p.transParam)   add('transmission',  `ناقل الحركة: ${enumLabel(p.transParam)}`);
  if (p.ltParam)      add('listingType',   `نوع الإعلان: ${enumLabel(p.ltParam)}`);

  // year range
  if (p.yearMinParam && p.yearMaxParam) {
    add('yearMin', `السنة: ${p.yearMinParam} - ${p.yearMaxParam}`);
  } else if (p.yearMinParam) {
    add('yearMin', `السنة من: ${p.yearMinParam}`);
  } else if (p.yearMaxParam) {
    add('yearMax', `السنة إلى: ${p.yearMaxParam}`);
  }

  if (p.busTypeParam) add('busType',       `نوع الباص: ${enumLabel(p.busTypeParam)}`);
  if (p.busLTParam)   add('busListingType',`إعلان الباص: ${enumLabel(p.busLTParam)}`);

  // capacity range
  if (p.capMinParam && p.capMaxParam) {
    add('capMin', `السعة: ${p.capMinParam} - ${p.capMaxParam} راكب`);
  } else if (p.capMinParam) {
    add('capMin', `السعة من: ${p.capMinParam} راكب`);
  } else if (p.capMaxParam) {
    add('capMax', `السعة إلى: ${p.capMaxParam} راكب`);
  }

  if (p.partCatParam) add('partCategory',  `الفئة: ${enumLabel(p.partCatParam)}`);
  if (p.svcTypeParam) add('serviceType',   `الخدمة: ${enumLabel(p.svcTypeParam)}`);
  if (p.provTypeParam)add('providerType',  `المزود: ${enumLabel(p.provTypeParam)}`);
  if (p.homeParam === 'true') add('isHomeService', 'خدمة منزلية: نعم');

  if (p.jobTypeParam) add('jobType',       `الوظيفة: ${enumLabel(p.jobTypeParam)}`);
  if (p.empTypeParam) add('employmentType',`التوظيف: ${enumLabel(p.empTypeParam)}`);
  if (p.licParam)     add('licenseType',   `الرخصة: ${enumLabel(p.licParam)}`);
  if (p.trTypeParam)  add('transportType', `النقل: ${enumLabel(p.trTypeParam)}`);
  if (p.tripTypeParam)add('tripType',      `الرحلة: ${enumLabel(p.tripTypeParam)}`);
  if (p.schedParam)   add('scheduleType',  `الجدول: ${enumLabel(p.schedParam)}`);

  return filters;
}
