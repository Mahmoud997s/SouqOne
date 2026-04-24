import type { ListingCategory } from '../types/category.types'
import type { FilterField, SortOption } from '../types/filters.types'
import { GOVERNORATE_OPTIONS } from './shared'

const GOVERNORATE_FIELD: FilterField = {
  key: 'governorate',
  labelAr: 'المحافظة',
  type: 'select',
  primary: false,
  options: GOVERNORATE_OPTIONS,
}

export const FILTERS_CONFIG: Record<ListingCategory, FilterField[]> = {

  cars: [
    {
      key: 'listingType',
      labelAr: 'نوع الإعلان',
      type: 'select',
      primary: true,
      options: [
        { value: 'SALE',   labelAr: 'للبيع' },
        { value: 'RENTAL', labelAr: 'للإيجار' },
        { value: 'WANTED', labelAr: 'مطلوب' },
      ],
    },
    {
      key: 'make',
      labelAr: 'الماركة',
      type: 'select',
      primary: true,
      options: [
        { value: 'Toyota',        labelAr: 'تويوتا' },
        { value: 'Nissan',        labelAr: 'نيسان' },
        { value: 'Honda',         labelAr: 'هوندا' },
        { value: 'Hyundai',       labelAr: 'هيونداي' },
        { value: 'Kia',           labelAr: 'كيا' },
        { value: 'Ford',          labelAr: 'فورد' },
        { value: 'BMW',           labelAr: 'بي إم دبليو' },
        { value: 'Mercedes-Benz', labelAr: 'مرسيدس' },
        { value: 'Lexus',         labelAr: 'لكزس' },
        { value: 'Mitsubishi',    labelAr: 'ميتسوبيشي' },
      ],
    },
    {
      key: 'priceMin_priceMax',
      labelAr: 'السعر',
      type: 'range',
      primary: true,
      min: 0,
      max: 100000,
      unit: 'ر.ع',
    },
    {
      key: 'yearMin_yearMax',
      labelAr: 'السنة',
      type: 'range',
      primary: false,
      min: 1990,
      max: new Date().getFullYear(),
    },
    {
      key: 'fuelType',
      labelAr: 'نوع الوقود',
      type: 'multiselect',
      primary: false,
      options: [
        { value: 'PETROL',   labelAr: 'بنزين' },
        { value: 'DIESEL',   labelAr: 'ديزل' },
        { value: 'HYBRID',   labelAr: 'هايبرد' },
        { value: 'ELECTRIC', labelAr: 'كهربائي' },
      ],
    },
    {
      key: 'transmission',
      labelAr: 'ناقل الحركة',
      type: 'select',
      primary: false,
      options: [
        { value: 'AUTOMATIC', labelAr: 'أوتوماتيك' },
        { value: 'MANUAL',    labelAr: 'يدوي' },
      ],
    },
    {
      key: 'condition',
      labelAr: 'الحالة',
      type: 'select',
      primary: false,
      options: [
        { value: 'NEW',      labelAr: 'جديد' },
        { value: 'USED',     labelAr: 'مستعمل' },
        { value: 'LIKE_NEW', labelAr: 'شبه جديد' },
      ],
    },
    {
      key: 'bodyType',
      labelAr: 'نوع الهيكل',
      type: 'select',
      primary: false,
      options: [
        { value: 'SEDAN',     labelAr: 'سيدان' },
        { value: 'SUV',       labelAr: 'SUV' },
        { value: 'PICKUP',    labelAr: 'بيك أب' },
        { value: 'HATCHBACK', labelAr: 'هاتشباك' },
        { value: 'COUPE',     labelAr: 'كوبيه' },
        { value: 'VAN',       labelAr: 'فان' },
      ],
    },
    {
      key: 'governorate',
      labelAr: 'المحافظة',
      type: 'select',
      primary: false,
      options: [
        { value: 'muscat',         labelAr: 'مسقط' },
        { value: 'dhofar',         labelAr: 'ظفار' },
        { value: 'dakhliya',       labelAr: 'الداخلية' },
        { value: 'batinah_north',  labelAr: 'شمال الباطنة' },
        { value: 'batinah_south',  labelAr: 'جنوب الباطنة' },
        { value: 'sharqiya_north', labelAr: 'شمال الشرقية' },
        { value: 'sharqiya_south', labelAr: 'جنوب الشرقية' },
        { value: 'dhahira',        labelAr: 'الظاهرة' },
        { value: 'buraimi',        labelAr: 'البريمي' },
        { value: 'wusta',          labelAr: 'الوسطى' },
        { value: 'musandam',       labelAr: 'مسندم' },
      ],
    },
    {
      key: 'mileageMax',
      labelAr: 'الكيلومترات (أقل من)',
      type: 'select',
      primary: false,
      options: [
        { value: '30000',  labelAr: 'أقل من 30,000 كم' },
        { value: '60000',  labelAr: 'أقل من 60,000 كم' },
        { value: '100000', labelAr: 'أقل من 100,000 كم' },
        { value: '150000', labelAr: 'أقل من 150,000 كم' },
      ],
    },
  ],

  buses: [
    {
      key: 'busListingType',
      labelAr: 'نوع الإعلان',
      type: 'select',
      primary: true,
      options: [
        { value: 'BUS_SALE',               labelAr: 'للبيع' },
        { value: 'BUS_SALE_WITH_CONTRACT', labelAr: 'بيع مع عقد' },
        { value: 'BUS_RENT',               labelAr: 'للإيجار' },
        { value: 'BUS_CONTRACT',           labelAr: 'تعاقد' },
      ],
    },
    {
      key: 'busType',
      labelAr: 'نوع الحافلة',
      type: 'select',
      primary: true,
      options: [
        { value: 'MINI_BUS',    labelAr: 'ميني باص' },
        { value: 'SCHOOL_BUS',  labelAr: 'حافلة مدرسية' },
        { value: 'CITY_BUS',    labelAr: 'حافلة مدينة' },
        { value: 'COACH',       labelAr: 'كوتش' },
        { value: 'DOUBLE_DECK', labelAr: 'طابقين' },
      ],
    },
    {
      key: 'minPrice_maxPrice',
      labelAr: 'السعر',
      type: 'range',
      primary: true,
      min: 0,
      max: 200000,
      unit: 'ر.ع',
    },
    {
      key: 'make',
      labelAr: 'الماركة',
      type: 'select',
      primary: false,
      options: [
        { value: 'Toyota', labelAr: 'تويوتا' },
        { value: 'Hino',   labelAr: 'هينو' },
        { value: 'Isuzu',  labelAr: 'إيسوزو' },
        { value: 'Yutong', labelAr: 'يوتونج' },
        { value: 'Scania', labelAr: 'سكانيا' },
        { value: 'Volvo',  labelAr: 'فولفو' },
      ],
    },
    {
      key: 'minCapacity_maxCapacity',
      labelAr: 'سعة الركاب',
      type: 'range',
      primary: false,
      min: 10,
      max: 60,
      unit: 'راكب',
    },
    GOVERNORATE_FIELD,
  ],

  equipment: [
    {
      key: 'listingType',
      labelAr: 'نوع الإعلان',
      type: 'select',
      primary: true,
      options: [
        { value: 'EQUIPMENT_SALE', labelAr: 'للبيع' },
        { value: 'EQUIPMENT_RENT', labelAr: 'للإيجار' },
      ],
    },
    {
      key: 'equipmentType',
      labelAr: 'نوع المعدة',
      type: 'select',
      primary: true,
      options: [
        { value: 'EXCAVATOR',  labelAr: 'حفار' },
        { value: 'CRANE',      labelAr: 'رافعة' },
        { value: 'FORKLIFT',   labelAr: 'رافعة شوكية' },
        { value: 'BULLDOZER',  labelAr: 'جرافة' },
        { value: 'COMPRESSOR', labelAr: 'ضاغط هواء' },
        { value: 'GENERATOR',  labelAr: 'مولد كهربائي' },
        { value: 'MIXER',      labelAr: 'خلاطة خرسانة' },
        { value: 'PUMP',       labelAr: 'مضخة' },
      ],
    },
    GOVERNORATE_FIELD,
  ],

  parts: [
    {
      key: 'partCategory',
      labelAr: 'الفئة',
      type: 'select',
      primary: true,
      options: [
        { value: 'ENGINE',       labelAr: 'محرك' },
        { value: 'BODY',         labelAr: 'هيكل' },
        { value: 'ELECTRICAL',   labelAr: 'كهرباء' },
        { value: 'SUSPENSION',   labelAr: 'تعليق' },
        { value: 'BRAKES',       labelAr: 'فرامل' },
        { value: 'TRANSMISSION', labelAr: 'ناقل حركة' },
        { value: 'COOLING',      labelAr: 'تبريد' },
        { value: 'EXHAUST',      labelAr: 'عادم' },
        { value: 'INTERIOR',     labelAr: 'داخلية' },
        { value: 'TIRES',        labelAr: 'إطارات' },
      ],
    },
    {
      key: 'condition',
      labelAr: 'الحالة',
      type: 'select',
      primary: true,
      options: [
        { value: 'NEW',         labelAr: 'جديد' },
        { value: 'USED',        labelAr: 'مستعمل' },
        { value: 'REFURBISHED', labelAr: 'مجدد' },
      ],
    },
    {
      key: 'minPrice_maxPrice',
      labelAr: 'السعر',
      type: 'range',
      primary: true,
      min: 0,
      max: 5000,
      unit: 'ر.ع',
    },
    {
      key: 'make',
      labelAr: 'توافق مع',
      type: 'select',
      primary: false,
      options: [
        { value: 'Toyota',        labelAr: 'تويوتا' },
        { value: 'Nissan',        labelAr: 'نيسان' },
        { value: 'Honda',         labelAr: 'هوندا' },
        { value: 'Hyundai',       labelAr: 'هيونداي' },
        { value: 'Kia',           labelAr: 'كيا' },
        { value: 'Ford',          labelAr: 'فورد' },
        { value: 'BMW',           labelAr: 'بي إم دبليو' },
        { value: 'Mercedes-Benz', labelAr: 'مرسيدس' },
      ],
    },
    GOVERNORATE_FIELD,
  ],

  services: [
    {
      key: 'serviceType',
      labelAr: 'نوع الخدمة',
      type: 'select',
      primary: true,
      options: [
        { value: 'MAINTENANCE', labelAr: 'صيانة' },
        { value: 'CLEANING',    labelAr: 'تنظيف' },
        { value: 'INSPECTION',  labelAr: 'فحص' },
        { value: 'BODYWORK',    labelAr: 'هيكلة' },
        { value: 'ELECTRICAL',  labelAr: 'كهرباء' },
        { value: 'TIRES',       labelAr: 'إطارات' },
        { value: 'AC',          labelAr: 'تكييف' },
        { value: 'PAINT',       labelAr: 'دهان' },
      ],
    },
    {
      key: 'providerType',
      labelAr: 'نوع المزود',
      type: 'select',
      primary: true,
      options: [
        { value: 'WORKSHOP',   labelAr: 'ورشة' },
        { value: 'INDIVIDUAL', labelAr: 'فرد' },
        { value: 'MOBILE',     labelAr: 'متنقل' },
        { value: 'COMPANY',    labelAr: 'شركة' },
      ],
    },
    {
      key: 'isHomeService',
      labelAr: 'خدمة منزلية',
      type: 'toggle',
      primary: true,
    },
    GOVERNORATE_FIELD,
  ],
}

export const SORT_CONFIG: Record<ListingCategory, SortOption[]> = {
  cars: [
    { value: 'createdAt_desc', labelAr: 'الأحدث' },
    { value: 'price_asc',      labelAr: 'السعر: الأقل' },
    { value: 'price_desc',     labelAr: 'السعر: الأعلى' },
    { value: 'year_desc',      labelAr: 'الأحدث سنة' },
    { value: 'mileage_asc',    labelAr: 'أقل كيلومترات' },
    { value: 'viewCount_desc', labelAr: 'الأكثر مشاهدة' },
  ],
  buses: [
    { value: 'newest',     labelAr: 'الأحدث' },
    { value: 'price_asc',  labelAr: 'السعر: الأقل' },
    { value: 'price_desc', labelAr: 'السعر: الأعلى' },
  ],
  equipment: [{ value: 'createdAt_desc', labelAr: 'الأحدث' }],
  parts: [
    { value: 'createdAt_desc', labelAr: 'الأحدث' },
    { value: 'price_asc',      labelAr: 'السعر: الأقل' },
    { value: 'price_desc',     labelAr: 'السعر: الأعلى' },
  ],
  services:  [{ value: 'createdAt_desc', labelAr: 'الأحدث' }],
}

export const CATEGORY_FILTERS     = FILTERS_CONFIG
export const CATEGORY_SORT_OPTIONS = SORT_CONFIG