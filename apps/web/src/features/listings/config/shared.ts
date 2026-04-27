import type { FilterOption } from '../types/filters.types'

// ── Governorates ─────────────────────────────────────────────────────────────
// Values MUST match what listing-form stores in DB (from location-data.ts → getGovernorates)

export const GOVERNORATE_OPTIONS: FilterOption[] = [
  { value: 'OM_MUS', labelAr: 'مسقط' },
  { value: 'OM_DHO', labelAr: 'ظفار' },
  { value: 'OM_DAK', labelAr: 'الداخلية' },
  { value: 'OM_BAN', labelAr: 'شمال الباطنة' },
  { value: 'OM_BAS', labelAr: 'جنوب الباطنة' },
  { value: 'OM_SHN', labelAr: 'شمال الشرقية' },
  { value: 'OM_SHS', labelAr: 'جنوب الشرقية' },
  { value: 'OM_DHA', labelAr: 'الظاهرة' },
  { value: 'OM_BUR', labelAr: 'البريمي' },
  { value: 'OM_WUS', labelAr: 'الوسطى' },
  { value: 'OM_MSN', labelAr: 'مسندم' },
]

// ── Wilayats / Cities by Governorate ─────────────────────────────────────────
// City values MUST match what listing-form stores in DB (Arabic city name from location-data.ts)

export const WILAYAT_BY_GOVERNORATE: Record<string, FilterOption[]> = {
  OM_MUS: [
    { value: 'مسقط',     labelAr: 'مسقط' },
    { value: 'مطرح',     labelAr: 'مطرح' },
    { value: 'بوشر',     labelAr: 'بوشر' },
    { value: 'العامرات', labelAr: 'العامرات' },
    { value: 'قريات',    labelAr: 'قريات' },
    { value: 'السيب',    labelAr: 'السيب' },
  ],
  OM_DHO: [
    { value: 'صلالة',                labelAr: 'صلالة' },
    { value: 'طاقة',                 labelAr: 'طاقة' },
    { value: 'مرباط',                labelAr: 'مرباط' },
    { value: 'سدح',                  labelAr: 'سدح' },
    { value: 'ضلكوت',                labelAr: 'ضلكوت' },
    { value: 'رخيوت',                labelAr: 'رخيوت' },
    { value: 'مقشن',                 labelAr: 'مقشن' },
    { value: 'ثمريت',                labelAr: 'ثمريت' },
    { value: 'شليم وجزر الحلانيات', labelAr: 'شليم وجزر الحلانيات' },
    { value: 'المزيونة',             labelAr: 'المزيونة' },
  ],
  OM_DAK: [
    { value: 'نزوى',    labelAr: 'نزوى' },
    { value: 'بهلاء',   labelAr: 'بهلاء' },
    { value: 'سمائل',   labelAr: 'سمائل' },
    { value: 'أدم',     labelAr: 'أدم' },
    { value: 'الحمراء', labelAr: 'الحمراء' },
    { value: 'منح',     labelAr: 'منح' },
    { value: 'إزكي',    labelAr: 'إزكي' },
    { value: 'بدبد',    labelAr: 'بدبد' },
  ],
  OM_BAN: [
    { value: 'صحار',     labelAr: 'صحار' },
    { value: 'شناص',     labelAr: 'شناص' },
    { value: 'لوى',      labelAr: 'لوى' },
    { value: 'صحم',      labelAr: 'صحم' },
    { value: 'الخابورة', labelAr: 'الخابورة' },
    { value: 'السويق',   labelAr: 'السويق' },
  ],
  OM_BAS: [
    { value: 'الرستاق',      labelAr: 'الرستاق' },
    { value: 'العوابي',      labelAr: 'العوابي' },
    { value: 'نخل',          labelAr: 'نخل' },
    { value: 'وادي المعاول', labelAr: 'وادي المعاول' },
    { value: 'بركاء',        labelAr: 'بركاء' },
    { value: 'المصنعة',      labelAr: 'المصنعة' },
  ],
  OM_SHN: [
    { value: 'إبراء',          labelAr: 'إبراء' },
    { value: 'المضيبي',        labelAr: 'المضيبي' },
    { value: 'بدية',           labelAr: 'بدية' },
    { value: 'القابل',         labelAr: 'القابل' },
    { value: 'وادي بني خالد', labelAr: 'وادي بني خالد' },
    { value: 'دماء والطائيين', labelAr: 'دماء والطائيين' },
  ],
  OM_SHS: [
    { value: 'صور',               labelAr: 'صور' },
    { value: 'جعلان بني بو حسن', labelAr: 'جعلان بني بو حسن' },
    { value: 'جعلان بني بو علي', labelAr: 'جعلان بني بو علي' },
    { value: 'الكامل والوافي',    labelAr: 'الكامل والوافي' },
    { value: 'مصيرة',            labelAr: 'مصيرة' },
  ],
  OM_DHA: [
    { value: 'عبري', labelAr: 'عبري' },
    { value: 'ينقل', labelAr: 'ينقل' },
    { value: 'ضنك',  labelAr: 'ضنك' },
  ],
  OM_BUR: [
    { value: 'البريمي', labelAr: 'البريمي' },
    { value: 'محضة',    labelAr: 'محضة' },
    { value: 'السنينة', labelAr: 'السنينة' },
  ],
  OM_WUS: [
    { value: 'هيماء',  labelAr: 'هيماء' },
    { value: 'محوت',   labelAr: 'محوت' },
    { value: 'الدقم',  labelAr: 'الدقم' },
    { value: 'الجازر', labelAr: 'الجازر' },
  ],
  OM_MSN: [
    { value: 'خصب',   labelAr: 'خصب' },
    { value: 'بخاء',  labelAr: 'بخاء' },
    { value: 'دبا',   labelAr: 'دبا' },
    { value: 'مدحاء', labelAr: 'مدحاء' },
  ],
}
