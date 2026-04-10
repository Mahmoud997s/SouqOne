/**
 * Translates raw backend validation errors (class-validator / NestJS)
 * into user-friendly Arabic messages.
 */

const FIELD_NAMES: Record<string, string> = {
  title: 'العنوان',
  description: 'الوصف',
  make: 'الماركة',
  model: 'الموديل',
  year: 'سنة الصنع',
  price: 'السعر',
  mileage: 'المسافة المقطوعة',
  fuelType: 'نوع الوقود',
  transmission: 'ناقل الحركة',
  condition: 'الحالة',
  governorate: 'المحافظة',
  city: 'المدينة',
  contactPhone: 'رقم الهاتف',
  whatsapp: 'رقم الواتساب',
  providerName: 'اسم المزود',
  providerType: 'نوع المزود',
  serviceType: 'نوع الخدمة',
  transportType: 'نوع النقل',
  tripType: 'نوع الرحلة',
  scheduleType: 'نوع الجدول',
  pricingType: 'نوع التسعير',
  offerType: 'نوع العرض',
  listingType: 'نوع الإعلان',
  routeFrom: 'نقطة الانطلاق',
  routeTo: 'الوجهة',
  partCategory: 'نوع القطعة',
  pricePerTrip: 'سعر الرحلة',
  priceMonthly: 'الاشتراك الشهري',
  basePrice: 'السعر الأساسي',
  pricePerKm: 'سعر الكيلومتر',
  priceFrom: 'السعر من',
  priceTo: 'السعر إلى',
  dailyPrice: 'السعر اليومي',
  weeklyPrice: 'السعر الأسبوعي',
  monthlyPrice: 'السعر الشهري',
  depositAmount: 'مبلغ التأمين',
  capacity: 'السعة',
  availableSeats: 'المقاعد المتاحة',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  username: 'اسم المستخدم',
  displayName: 'الاسم',
  website: 'الموقع الإلكتروني',
  address: 'العنوان التفصيلي',
  partNumber: 'رقم القطعة',
  vehicleType: 'نوع المركبة',
  vehicleCapacity: 'سعة الحمولة',
  cancellationPolicy: 'سياسة الإلغاء',
};

const ENUM_VALUES_AR: Record<string, Record<string, string>> = {
  scheduleType: { SCHEDULE_DAILY: 'يومي', SCHEDULE_WEEKLY: 'أسبوعي', SCHEDULE_MONTHLY: 'شهري', ONE_TIME: 'مرة واحدة' },
  tripType: { BUS_SUBSCRIPTION: 'اشتراكات باصات', SCHOOL_TRANSPORT: 'توصيل مدارس', TOURISM: 'رحلات سياحية', CORPORATE: 'توصيل موظفين', CARPOOLING: 'مشاركة رحلات', OTHER_TRIP: 'أخرى' },
  transportType: { CARGO: 'نقل بضائع', FURNITURE: 'نقل أثاث', DELIVERY: 'توصيل طرود', HEAVY_TRANSPORT: 'نقل ثقيل', TRUCK_RENTAL: 'تأجير شاحنات', OTHER_TRANSPORT: 'أخرى' },
  serviceType: { MAINTENANCE: 'صيانة', CLEANING: 'تنظيف', MODIFICATION: 'تعديل', INSPECTION: 'فحص', BODYWORK: 'سمكرة', ACCESSORIES_INSTALL: 'إكسسوارات', KEYS_LOCKS: 'مفاتيح', TOWING: 'سطحة', OTHER_SERVICE: 'أخرى' },
  pricingType: { FIXED: 'سعر ثابت', PER_KM: 'لكل كم', PER_TRIP: 'لكل رحلة', HOURLY: 'بالساعة', NEGOTIABLE_PRICE: 'قابل للتفاوض' },
  providerType: { WORKSHOP: 'ورشة', INDIVIDUAL: 'فرد', MOBILE: 'خدمة متنقلة', COMPANY: 'شركة' },
  offerType: { CAR_COMPREHENSIVE: 'تأمين شامل', CAR_THIRD_PARTY: 'ضد الغير', MARINE: 'تأمين بحري', HEAVY_EQUIPMENT: 'تأمين معدات', FINANCING: 'تمويل سيارات', LEASING: 'تأجير تمويلي' },
  listingType: { SALE: 'بيع', RENTAL: 'إيجار' },
  condition: { NEW: 'جديد', USED: 'مستعمل', REFURBISHED: 'مجدد' },
  partCategory: { ENGINE: 'محرك', BODY: 'هيكل', ELECTRICAL: 'كهرباء', SUSPENSION: 'تعليق', BRAKES: 'فرامل', INTERIOR: 'داخلية', TIRES: 'إطارات', BATTERIES: 'بطاريات', OILS: 'زيوت', ACCESSORIES: 'إكسسوارات', OTHER: 'أخرى' },
};

function getFieldName(raw: string): string {
  return FIELD_NAMES[raw] ?? raw;
}

function translateOne(msg: string): string {
  if (/[\u0600-\u06FF]/.test(msg) && !msg.includes('must be')) return msg;

  const enumMatch = msg.match(/^(\w+) must be one of the following values: (.+)$/);
  if (enumMatch) {
    const field = enumMatch[1];
    const fieldAr = getFieldName(field);
    const enumMap = ENUM_VALUES_AR[field];
    if (enumMap) {
      const options = Object.values(enumMap).join('، ');
      return `يرجى اختيار ${fieldAr}: ${options}`;
    }
    return `يرجى اختيار قيمة صحيحة لحقل "${fieldAr}"`;
  }

  const emptyMatch = msg.match(/^(\w+) should not be empty$/);
  if (emptyMatch) return `${getFieldName(emptyMatch[1])} — هذا الحقل مطلوب`;

  const stringMatch = msg.match(/^(\w+) must be a string$/);
  if (stringMatch) return `${getFieldName(stringMatch[1])} — هذا الحقل مطلوب`;

  const numberMatch = msg.match(/^(\w+) must be a number/);
  if (numberMatch) return `${getFieldName(numberMatch[1])} — يجب إدخال رقم`;

  const intMatch = msg.match(/^(\w+) must be an integer/);
  if (intMatch) return `${getFieldName(intMatch[1])} — يجب إدخال رقم صحيح`;

  const minMatch = msg.match(/^(\w+) must not be less than (\d+)$/);
  if (minMatch) return `${getFieldName(minMatch[1])} — يجب أن يكون ${minMatch[2]} أو أكثر`;

  const maxMatch = msg.match(/^(\w+) must not be greater than (\d+)$/);
  if (maxMatch) return `${getFieldName(maxMatch[1])} — يجب أن يكون ${maxMatch[2]} أو أقل`;

  const minLenMatch = msg.match(/^(\w+) must be longer than or equal to (\d+) characters$/);
  if (minLenMatch) return `${getFieldName(minLenMatch[1])} — يجب أن يكون ${minLenMatch[2]} حروف على الأقل`;

  const maxLenMatch = msg.match(/^(\w+) must be shorter than or equal to (\d+) characters$/);
  if (maxLenMatch) return `${getFieldName(maxLenMatch[1])} — يجب أن لا يتجاوز ${maxLenMatch[2]} حرف`;

  const emailMatch = msg.match(/^(\w+) must be an email$/);
  if (emailMatch) return `يرجى إدخال بريد إلكتروني صحيح`;

  const dateMatch = msg.match(/^(\w+) must be a valid ISO 8601 date/);
  if (dateMatch) return `${getFieldName(dateMatch[1])} — يرجى إدخال تاريخ صحيح`;

  const urlMatch = msg.match(/^(\w+) must be a(n)? URL/);
  if (urlMatch) return `${getFieldName(urlMatch[1])} — يرجى إدخال رابط صحيح`;

  const boolMatch = msg.match(/^(\w+) must be a boolean/);
  if (boolMatch) return `${getFieldName(boolMatch[1])} — قيمة غير صحيحة`;

  const eachMatch = msg.match(/^each value in (\w+)/);
  if (eachMatch) return `${getFieldName(eachMatch[1])} — يحتوي على قيم غير صحيحة`;

  const arrayMatch = msg.match(/^(\w+) must be an array$/);
  if (arrayMatch) return `${getFieldName(arrayMatch[1])} — يجب أن يكون قائمة`;

  const propMatch = msg.match(/^property (\w+) should not exist$/);
  if (propMatch) return `الحقل "${getFieldName(propMatch[1])}" غير مسموح به`;

  if (msg === 'Unauthorized') return 'يرجى تسجيل الدخول أولاً';
  if (msg === 'Forbidden resource') return 'ليس لديك صلاحية لهذا الإجراء';
  if (/not found|Not Found/i.test(msg)) return 'العنصر المطلوب غير موجود';
  if (/already exists|Duplicate/i.test(msg)) return 'هذا العنصر موجود بالفعل';

  return msg;
}

/**
 * Translates a backend error (string or array) into user-friendly Arabic.
 * Returns an array of translated messages.
 */
export function translateApiErrors(raw: string | string[]): string[] {
  const messages = Array.isArray(raw) ? raw : [raw];
  return messages.map(translateOne);
}

/**
 * Translates and joins into a single string.
 */
export function translateApiError(raw: string | string[]): string {
  return translateApiErrors(raw).join('\n');
}
