// ─── Fuel ───
export const FUEL_LABELS: Record<string, string> = {
  PETROL: 'بنزين',
  DIESEL: 'ديزل',
  HYBRID: 'هايبرد',
  ELECTRIC: 'كهربائي',
};
export const FUEL_OPTIONS = Object.entries(FUEL_LABELS).map(([value, label]) => ({ value, label }));

// ─── Transmission ───
export const TRANSMISSION_LABELS: Record<string, string> = {
  AUTOMATIC: 'أوتوماتيك',
  MANUAL: 'عادي',
};
export const TRANSMISSION_OPTIONS = Object.entries(TRANSMISSION_LABELS).map(([value, label]) => ({ value, label }));

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

// ─── Unified Badge System ───
// All overlay badges use solid colors for readability on any image background.
// Base size: text-[10px] font-black px-2 py-0.5

export const CONDITION_BADGE: Record<string, { label: string; cls: string }> = {
  NEW:      { label: 'جديد',      cls: 'bg-emerald-600 text-white text-[10px] font-black' },
  LIKE_NEW: { label: 'شبه جديد',  cls: 'bg-teal-600 text-white text-[10px] font-black' },
  USED:     { label: 'مستعمل',    cls: 'bg-slate-500 text-white text-[10px] font-black' },
  GOOD:     { label: 'جيد',       cls: 'bg-sky-600 text-white text-[10px] font-black' },
  FAIR:     { label: 'مقبول',     cls: 'bg-amber-500 text-white text-[10px] font-black' },
  POOR:     { label: 'ضعيف',      cls: 'bg-rose-600 text-white text-[10px] font-black' },
};

export const PART_CONDITION_BADGE: Record<string, { label: string; cls: string }> = {
  NEW:         { label: 'جديد',  cls: 'bg-emerald-600 text-white' },
  USED:        { label: 'مستعمل', cls: 'bg-slate-500 text-white' },
  REFURBISHED: { label: 'مجدد',  cls: 'bg-sky-600 text-white' },
};

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

// ─── Cancellation Policy ───
export const CANCEL_LABELS: Record<string, string> = {
  FREE: 'إلغاء مجاني',
  FLEXIBLE: 'مرن',
  MODERATE: 'متوسط',
  STRICT: 'صارم',
};
export const CANCEL_OPTIONS = ['FREE', 'FLEXIBLE', 'MODERATE', 'STRICT'] as const;

// ─── Booking Status ───
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  CONFIRMED: 'مؤكد',
  ACTIVE: 'نشط',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  REJECTED: 'مرفوض',
};

export const BOOKING_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-900/20 text-amber-400 border-r-4 border-amber-400',
  CONFIRMED: 'bg-green-900/20 text-green-400 border-r-4 border-green-400',
  ACTIVE: 'bg-blue-900/20 text-blue-400 border-r-4 border-blue-400',
  COMPLETED: 'bg-white/5 text-on-surface-variant border-r-4 border-outline-variant',
  CANCELLED: 'bg-red-900/20 text-red-400 border-r-4 border-red-400',
  REJECTED: 'bg-red-900/20 text-red-400 border-r-4 border-red-400',
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

// ─── Interior Colors ───
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
