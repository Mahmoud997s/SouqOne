// ─── Translator type ───
type T = (key: string) => string;

// ─── Fuel ───
export const FUEL_LABELS: Record<string, string> = {
  PETROL: 'بنزين',
  DIESEL: 'ديزل',
  HYBRID: 'هايبرد',
  ELECTRIC: 'كهربائي',
};
export const FUEL_OPTIONS = Object.entries(FUEL_LABELS).map(([value, label]) => ({ value, label }));

export function fuelLabels(t: T): Record<string, string> {
  return { PETROL: t('fuelPetrol'), DIESEL: t('fuelDiesel'), HYBRID: t('fuelHybrid'), ELECTRIC: t('fuelElectric') };
}
export function fuelOptions(t: T) { return Object.entries(fuelLabels(t)).map(([value, label]) => ({ value, label })); }

// ─── Transmission ───
export const TRANSMISSION_LABELS: Record<string, string> = {
  AUTOMATIC: 'أوتوماتيك',
  MANUAL: 'عادي',
};
export const TRANSMISSION_OPTIONS = Object.entries(TRANSMISSION_LABELS).map(([value, label]) => ({ value, label }));

export function transmissionLabels(t: T): Record<string, string> {
  return { AUTOMATIC: t('transmissionAutomatic'), MANUAL: t('transmissionManual') };
}
export function transmissionOptions(t: T) { return Object.entries(transmissionLabels(t)).map(([value, label]) => ({ value, label })); }

// ─── Condition ───
export const CONDITION_LABELS: Record<string, string> = {
  NEW: 'جديد',
  USED: 'مستعمل',
  LIKE_NEW: 'شبه جديد',
  GOOD: 'جيد',
  FAIR: 'مقبول',
  POOR: 'ضعيف',
};
export const CONDITION_OPTIONS = Object.entries(CONDITION_LABELS).map(([value, label]) => ({ value, label }));

export function conditionLabels(t: T): Record<string, string> {
  return { NEW: t('conditionNew'), USED: t('conditionUsed'), LIKE_NEW: t('conditionLikeNew'), GOOD: t('conditionGood'), FAIR: t('conditionFair'), POOR: t('conditionPoor') };
}
export function conditionOptions(t: T) { return Object.entries(conditionLabels(t)).map(([value, label]) => ({ value, label })); }

// ─── Unified Badge System ───
// All overlay badges use solid colors for readability on any image background.
// Base size: text-[10px] font-black px-2 py-0.5

const CONDITION_BADGE_CLS: Record<string, string> = {
  NEW:      'bg-emerald-600 text-white text-[10px] font-black',
  LIKE_NEW: 'bg-teal-600 text-white text-[10px] font-black',
  USED:     'bg-slate-500 text-white text-[10px] font-black',
  GOOD:     'bg-sky-600 text-white text-[10px] font-black',
  FAIR:     'bg-amber-500 text-white text-[10px] font-black',
  POOR:     'bg-rose-600 text-white text-[10px] font-black',
};

export const CONDITION_BADGE: Record<string, { label: string; cls: string }> = {
  NEW:      { label: 'جديد',      cls: CONDITION_BADGE_CLS.NEW },
  LIKE_NEW: { label: 'شبه جديد',  cls: CONDITION_BADGE_CLS.LIKE_NEW },
  USED:     { label: 'مستعمل',    cls: CONDITION_BADGE_CLS.USED },
  GOOD:     { label: 'جيد',       cls: CONDITION_BADGE_CLS.GOOD },
  FAIR:     { label: 'مقبول',     cls: CONDITION_BADGE_CLS.FAIR },
  POOR:     { label: 'ضعيف',      cls: CONDITION_BADGE_CLS.POOR },
};

export function conditionBadge(t: T): Record<string, { label: string; cls: string }> {
  return {
    NEW:      { label: t('conditionNew'),    cls: CONDITION_BADGE_CLS.NEW },
    LIKE_NEW: { label: t('conditionLikeNew'), cls: CONDITION_BADGE_CLS.LIKE_NEW },
    USED:     { label: t('conditionUsed'),   cls: CONDITION_BADGE_CLS.USED },
    GOOD:     { label: t('conditionGood'),   cls: CONDITION_BADGE_CLS.GOOD },
    FAIR:     { label: t('conditionFair'),   cls: CONDITION_BADGE_CLS.FAIR },
    POOR:     { label: t('conditionPoor'),   cls: CONDITION_BADGE_CLS.POOR },
  };
}

const PART_CONDITION_BADGE_CLS: Record<string, string> = {
  NEW:         'bg-emerald-600 text-white',
  USED:        'bg-slate-500 text-white',
  REFURBISHED: 'bg-sky-600 text-white',
};

export const PART_CONDITION_BADGE: Record<string, { label: string; cls: string }> = {
  NEW:         { label: 'جديد',  cls: PART_CONDITION_BADGE_CLS.NEW },
  USED:        { label: 'مستعمل', cls: PART_CONDITION_BADGE_CLS.USED },
  REFURBISHED: { label: 'مجدد',  cls: PART_CONDITION_BADGE_CLS.REFURBISHED },
};

export function partConditionBadge(t: T): Record<string, { label: string; cls: string }> {
  return {
    NEW:         { label: t('conditionNew'),         cls: PART_CONDITION_BADGE_CLS.NEW },
    USED:        { label: t('conditionUsed'),        cls: PART_CONDITION_BADGE_CLS.USED },
    REFURBISHED: { label: t('conditionRefurbished'), cls: PART_CONDITION_BADGE_CLS.REFURBISHED },
  };
}

// Solid badge colors per entity category
export const BADGE_COLORS = {
  rental:    'bg-emerald-600 text-white',
  wanted:    'bg-orange-500 text-white',
  service:   'bg-violet-600 text-white',
  transport: 'bg-rose-600 text-white',
  trip:      'bg-teal-600 text-white',
  schedule:  'bg-slate-500 text-white',
  insurance: 'bg-indigo-600 text-white',
  original:  'bg-primary text-on-primary',
  mobile:    'bg-emerald-600 text-white',
} as const;

// ─── Listing Type ───
export const LISTING_TYPE_LABELS: Record<string, string> = {
  SALE: 'للبيع',
  RENTAL: 'للإيجار',
  WANTED: 'مطلوب',
};

export function listingTypeLabels(t: T): Record<string, string> {
  return { SALE: t('typeSale'), RENTAL: t('typeRental'), WANTED: t('typeWanted') };
}

// Light pill colors for feature tags in card body
export const PILL_COLORS = {
  green:   'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  primary: 'bg-primary/10 text-primary',
  info:    'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  neutral: 'bg-surface-container-low text-on-surface-variant',
} as const;

// ─── Drive Type ───
export const DRIVE_LABELS: Record<string, string> = {
  FWD: 'أمامي',
  RWD: 'خلفي',
  AWD: 'رباعي',
  '4WD': 'رباعي',
};

export function driveLabels(t: T): Record<string, string> {
  return { FWD: t('driveFWD'), RWD: t('driveRWD'), AWD: t('driveAWD'), '4WD': t('drive4WD') };
}

// ─── Cancellation Policy ───
export const CANCEL_LABELS: Record<string, string> = {
  FREE: 'إلغاء مجاني',
  FLEXIBLE: 'مرن',
  MODERATE: 'متوسط',
  STRICT: 'صارم',
};
export const CANCEL_OPTIONS = ['FREE', 'FLEXIBLE', 'MODERATE', 'STRICT'] as const;

export function cancelLabels(t: T): Record<string, string> {
  return { FREE: t('cancelFree'), FLEXIBLE: t('cancelFlexible'), MODERATE: t('cancelModerate'), STRICT: t('cancelStrict') };
}

// ─── Booking Status ───
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  ACTIVE: 'نشط',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  REJECTED: 'مرفوض',
};

export function bookingStatusLabels(t: T): Record<string, string> {
  return { PENDING: t('bookingPending'), CONFIRMED: t('bookingConfirmed'), ACTIVE: t('bookingActive'), COMPLETED: t('bookingCompleted'), CANCELLED: t('bookingCancelled'), REJECTED: t('bookingRejected') };
}

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-900/20 text-amber-400 border-s-4 border-amber-400',
  CONFIRMED: 'bg-green-900/20 text-green-400 border-s-4 border-green-400',
  ACTIVE: 'bg-blue-900/20 text-blue-400 border-s-4 border-blue-400',
  COMPLETED: 'bg-white/5 text-on-surface-variant border-s-4 border-outline-variant',
  CANCELLED: 'bg-red-900/20 text-red-400 border-s-4 border-red-400',
  REJECTED: 'bg-red-900/20 text-red-400 border-s-4 border-red-400',
};

export const BOOKING_STATUS_COLORS_BORDER: Record<string, string> = {
  PENDING: 'bg-amber-900/20 text-amber-400 border-amber-500',
  CONFIRMED: 'bg-green-900/20 text-green-400 border-green-500',
  ACTIVE: 'bg-blue-900/20 text-blue-400 border-blue-500',
  COMPLETED: 'bg-white/5 text-on-surface-variant border-outline-variant',
  CANCELLED: 'bg-red-900/20 text-red-400 border-red-500',
  REJECTED: 'bg-red-900/20 text-red-400 border-red-500',
};

export const BOOKING_STATUS_FILTERS = ['', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;

// ─── Exterior Colors ───
const EXTERIOR_COLOR_DATA: { key: string; hex: string }[] = [
  { key: 'white', hex: '#FFFFFF' },
  { key: 'pearlWhite', hex: '#F5F5F0' },
  { key: 'silver', hex: '#C0C0C0' },
  { key: 'gray', hex: '#808080' },
  { key: 'darkGray', hex: '#505050' },
  { key: 'mineralGray', hex: '#6B6B6B' },
  { key: 'black', hex: '#1A1A1A' },
  { key: 'obsidianBlack', hex: '#0B0B0B' },
  { key: 'red', hex: '#CC0000' },
  { key: 'carmineRed', hex: '#960018' },
  { key: 'burgundy', hex: '#722F37' },
  { key: 'blue', hex: '#1E3A8A' },
  { key: 'lightBlue', hex: '#60A5FA' },
  { key: 'navy', hex: '#1B1F3B' },
  { key: 'green', hex: '#166534' },
  { key: 'britishGreen', hex: '#1B4D3E' },
  { key: 'oliveGreen', hex: '#556B2F' },
  { key: 'beige', hex: '#D4C5A9' },
  { key: 'gold', hex: '#C9A84C' },
  { key: 'bronze', hex: '#8C6E46' },
  { key: 'brown', hex: '#6B3A2A' },
  { key: 'orange', hex: '#EA580C' },
  { key: 'yellow', hex: '#EAB308' },
  { key: 'purple', hex: '#7C3AED' },
];

export const EXTERIOR_COLORS: { value: string; label: string; hex: string }[] = [
  { value: 'أبيض', label: 'أبيض', hex: '#FFFFFF' },
  { value: 'أبيض لؤلؤي', label: 'أبيض لؤلؤي', hex: '#F5F5F0' },
  { value: 'فضي', label: 'فضي', hex: '#C0C0C0' },
  { value: 'رمادي', label: 'رمادي', hex: '#808080' },
  { value: 'رمادي داكن', label: 'رمادي داكن', hex: '#505050' },
  { value: 'رمادي منيرال', label: 'رمادي منيرال', hex: '#6B6B6B' },
  { value: 'أسود', label: 'أسود', hex: '#1A1A1A' },
  { value: 'أسود أوبسيديان', label: 'أسود أوبسيديان', hex: '#0B0B0B' },
  { value: 'أحمر', label: 'أحمر', hex: '#CC0000' },
  { value: 'أحمر كارمين', label: 'أحمر كارمين', hex: '#960018' },
  { value: 'خمري', label: 'خمري', hex: '#722F37' },
  { value: 'أزرق', label: 'أزرق', hex: '#1E3A8A' },
  { value: 'أزرق فاتح', label: 'أزرق فاتح', hex: '#60A5FA' },
  { value: 'كحلي', label: 'كحلي', hex: '#1B1F3B' },
  { value: 'أخضر', label: 'أخضر', hex: '#166534' },
  { value: 'أخضر بريطاني', label: 'أخضر بريطاني', hex: '#1B4D3E' },
  { value: 'أخضر زيتي', label: 'أخضر زيتي', hex: '#556B2F' },
  { value: 'بيج', label: 'بيج', hex: '#D4C5A9' },
  { value: 'ذهبي', label: 'ذهبي', hex: '#C9A84C' },
  { value: 'برونزي', label: 'برونزي', hex: '#8C6E46' },
  { value: 'بني', label: 'بني', hex: '#6B3A2A' },
  { value: 'برتقالي', label: 'برتقالي', hex: '#EA580C' },
  { value: 'أصفر', label: 'أصفر', hex: '#EAB308' },
  { value: 'بنفسجي', label: 'بنفسجي', hex: '#7C3AED' },
];

export function exteriorColors(t: T): { value: string; label: string; hex: string }[] {
  return EXTERIOR_COLOR_DATA.map(c => ({ value: c.key, label: t(c.key), hex: c.hex }));
}

// ─── Interior Colors ───
const INTERIOR_COLOR_DATA: { key: string; hex: string }[] = [
  { key: 'blackLeather', hex: '#1A1A1A' },
  { key: 'beigeLeather', hex: '#D4C5A9' },
  { key: 'brownLeather', hex: '#6B3A2A' },
  { key: 'whiteLeather', hex: '#F5F5F0' },
  { key: 'redLeather', hex: '#CC0000' },
  { key: 'cognacLeather', hex: '#9A4E28' },
  { key: 'napaBlackLeather', hex: '#0B0B0B' },
  { key: 'grayLeather', hex: '#808080' },
  { key: 'blackFabric', hex: '#2A2A2A' },
  { key: 'grayFabric', hex: '#909090' },
  { key: 'beigeFabric', hex: '#C8B896' },
];

export const INTERIOR_COLORS: { value: string; label: string; hex: string }[] = [
  { value: 'جلد أسود', label: 'جلد أسود', hex: '#1A1A1A' },
  { value: 'جلد بيج', label: 'جلد بيج', hex: '#D4C5A9' },
  { value: 'جلد بني', label: 'جلد بني', hex: '#6B3A2A' },
  { value: 'جلد أبيض', label: 'جلد أبيض', hex: '#F5F5F0' },
  { value: 'جلد أحمر', label: 'جلد أحمر', hex: '#CC0000' },
  { value: 'جلد كوجناك', label: 'جلد كوجناك', hex: '#9A4E28' },
  { value: 'جلد نابا أسود', label: 'جلد نابا أسود', hex: '#0B0B0B' },
  { value: 'جلد رمادي', label: 'جلد رمادي', hex: '#808080' },
  { value: 'قماش أسود', label: 'قماش أسود', hex: '#2A2A2A' },
  { value: 'قماش رمادي', label: 'قماش رمادي', hex: '#909090' },
  { value: 'قماش بيج', label: 'قماش بيج', hex: '#C8B896' },
];

export function interiorColors(t: T): { value: string; label: string; hex: string }[] {
  return INTERIOR_COLOR_DATA.map(c => ({ value: c.key, label: t(c.key), hex: c.hex }));
}

// ─── Body Type ───
export const BODY_OPTIONS = ['SEDAN', 'SUV', 'HATCHBACK', 'COUPE', 'TRUCK', 'VAN', 'CONVERTIBLE', 'WAGON'] as const;

// ─── Drive Options ───
export const DRIVE_OPTIONS = ['FWD', 'RWD', 'AWD', '4WD'] as const;

// ─── Sort ───
export const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'الأحدث' },
  { value: 'createdAt_asc', label: 'الأقدم' },
  { value: 'price_asc', label: 'السعر: الأقل' },
  { value: 'price_desc', label: 'السعر: الأعلى' },
  { value: 'year_desc', label: 'السنة: الأحدث' },
];

export function sortOptions(t: T) {
  return [
    { value: 'createdAt_desc', label: t('sortNewest') },
    { value: 'createdAt_asc', label: t('sortOldest') },
    { value: 'price_asc', label: t('sortPriceLow') },
    { value: 'price_desc', label: t('sortPriceHigh') },
    { value: 'year_desc', label: t('sortYearNew') },
  ];
}
