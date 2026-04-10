/**
 * بيانات شاملة للسيارات — جميع العلامات التجارية والموديلات بالعربي والإنجليزي
 * Comprehensive car seed data — All brands & models in Arabic & English
 * سلطنة عمان / الخليج 🇴🇲
 */

interface SeedModel {
  name: string;
  nameAr: string;
  years: number[];
}

export interface SeedBrand {
  name: string;
  nameAr: string;
  slug: string;
  isPopular: boolean;
  models: SeedModel[];
}

/* ── Year range helpers ── */
const y = (from: number, to = 2026) => Array.from({ length: to - from + 1 }, (_, i) => from + i);
const Y00 = y(2000); // 2000–2026
const Y05 = y(2005); // 2005–2026
const Y10 = y(2010); // 2010–2026
const Y15 = y(2015); // 2015–2026
const Y18 = y(2018); // 2018–2026
const Y20 = y(2020); // 2020–2026
const Y22 = y(2022); // 2022–2026
const Y24 = y(2024); // 2024–2026

export const SEED_BRANDS: SeedBrand[] = [
  // ══════════════════════════════════════
  // الماركات الشائعة في عمان والخليج
  // ══════════════════════════════════════
  {
    name: 'Toyota', nameAr: 'تويوتا', slug: 'toyota', isPopular: true,
    models: [
      { name: 'Land Cruiser', nameAr: 'لاند كروزر', years: Y00 },
      { name: 'Camry', nameAr: 'كامري', years: Y00 },
      { name: 'Corolla', nameAr: 'كورولا', years: Y00 },
      { name: 'Hilux', nameAr: 'هايلكس', years: Y00 },
      { name: 'Prado', nameAr: 'برادو', years: Y00 },
      { name: 'RAV4', nameAr: 'راف فور', years: Y05 },
      { name: 'Yaris', nameAr: 'يارس', years: Y05 },
      { name: 'Fortuner', nameAr: 'فورتشنر', years: Y05 },
      { name: 'Avalon', nameAr: 'أفالون', years: Y05 },
      { name: 'FJ Cruiser', nameAr: 'إف جي كروزر', years: y(2007, 2023) },
      { name: 'Hiace', nameAr: 'هايس', years: Y00 },
      { name: 'Coaster', nameAr: 'كوستر', years: Y00 },
      { name: 'Sequoia', nameAr: 'سيكويا', years: Y05 },
      { name: 'Tundra', nameAr: 'تندرا', years: Y05 },
      { name: 'Crown', nameAr: 'كراون', years: Y22 },
      { name: '86 / GR86', nameAr: '86', years: Y15 },
      { name: 'Supra', nameAr: 'سوبرا', years: Y20 },
      { name: 'C-HR', nameAr: 'سي إتش آر', years: Y18 },
      { name: 'Corolla Cross', nameAr: 'كورولا كروس', years: Y20 },
      { name: 'Rush', nameAr: 'رش', years: Y18 },
      { name: 'Raize', nameAr: 'رايز', years: Y20 },
      { name: 'Veloz', nameAr: 'فيلوز', years: Y22 },
      { name: 'bZ4X', nameAr: 'بي زد 4 إكس', years: Y22 },
      { name: 'Granvia', nameAr: 'غرانفيا', years: Y20 },
    ],
  },
  {
    name: 'Nissan', nameAr: 'نيسان', slug: 'nissan', isPopular: true,
    models: [
      { name: 'Patrol', nameAr: 'باترول', years: Y00 },
      { name: 'Altima', nameAr: 'ألتيما', years: Y00 },
      { name: 'Sunny', nameAr: 'صني', years: Y00 },
      { name: 'X-Trail', nameAr: 'إكس تريل', years: Y05 },
      { name: 'Pathfinder', nameAr: 'باثفايندر', years: Y00 },
      { name: 'Maxima', nameAr: 'ماكسيما', years: Y00 },
      { name: 'Navara', nameAr: 'نافارا', years: Y05 },
      { name: 'Sentra', nameAr: 'سنترا', years: Y00 },
      { name: 'Tiida', nameAr: 'تيدا', years: y(2004, 2020) },
      { name: 'Urvan', nameAr: 'أورفان', years: Y00 },
      { name: 'Kicks', nameAr: 'كيكس', years: Y18 },
      { name: 'Juke', nameAr: 'جوك', years: Y10 },
      { name: 'Murano', nameAr: 'مورانو', years: Y05 },
      { name: 'Qashqai', nameAr: 'قاشقاي', years: Y10 },
      { name: 'GT-R', nameAr: 'جي تي آر', years: Y10 },
      { name: '370Z / Z', nameAr: 'زد', years: Y10 },
      { name: 'Armada', nameAr: 'أرمادا', years: Y05 },
      { name: 'Terra', nameAr: 'تيرا', years: Y18 },
      { name: 'Ariya', nameAr: 'أريا', years: Y22 },
    ],
  },
  {
    name: 'Lexus', nameAr: 'لكزس', slug: 'lexus', isPopular: true,
    models: [
      { name: 'LX', nameAr: 'إل إكس', years: Y00 },
      { name: 'GX', nameAr: 'جي إكس', years: Y00 },
      { name: 'ES', nameAr: 'إي إس', years: Y00 },
      { name: 'IS', nameAr: 'آي إس', years: Y00 },
      { name: 'LS', nameAr: 'إل إس', years: Y00 },
      { name: 'RX', nameAr: 'آر إكس', years: Y05 },
      { name: 'NX', nameAr: 'إن إكس', years: Y15 },
      { name: 'UX', nameAr: 'يو إكس', years: Y18 },
      { name: 'LC', nameAr: 'إل سي', years: Y18 },
      { name: 'RC', nameAr: 'آر سي', years: Y15 },
      { name: 'GS', nameAr: 'جي إس', years: Y00 },
      { name: 'TX', nameAr: 'تي إكس', years: Y24 },
      { name: 'RZ', nameAr: 'آر زد', years: Y22 },
    ],
  },
  {
    name: 'Land Rover', nameAr: 'لاند روفر', slug: 'land-rover', isPopular: true,
    models: [
      { name: 'Range Rover', nameAr: 'رينج روفر', years: Y00 },
      { name: 'Range Rover Sport', nameAr: 'رينج روفر سبورت', years: Y05 },
      { name: 'Range Rover Velar', nameAr: 'رينج روفر فيلار', years: Y18 },
      { name: 'Range Rover Evoque', nameAr: 'رينج روفر إيفوك', years: Y10 },
      { name: 'Defender', nameAr: 'ديفندر', years: Y20 },
      { name: 'Discovery', nameAr: 'ديسكفري', years: Y00 },
      { name: 'Discovery Sport', nameAr: 'ديسكفري سبورت', years: Y15 },
    ],
  },
  {
    name: 'Mercedes-Benz', nameAr: 'مرسيدس بنز', slug: 'mercedes-benz', isPopular: true,
    models: [
      { name: 'S-Class', nameAr: 'الفئة S', years: Y00 },
      { name: 'E-Class', nameAr: 'الفئة E', years: Y00 },
      { name: 'C-Class', nameAr: 'الفئة C', years: Y00 },
      { name: 'A-Class', nameAr: 'الفئة A', years: Y15 },
      { name: 'G-Class', nameAr: 'الفئة G', years: Y00 },
      { name: 'GLE', nameAr: 'جي إل إي', years: Y10 },
      { name: 'GLC', nameAr: 'جي إل سي', years: Y15 },
      { name: 'GLS', nameAr: 'جي إل إس', years: Y10 },
      { name: 'CLA', nameAr: 'سي إل إيه', years: Y15 },
      { name: 'CLS', nameAr: 'سي إل إس', years: Y05 },
      { name: 'AMG GT', nameAr: 'إيه إم جي جي تي', years: Y15 },
      { name: 'V-Class', nameAr: 'الفئة V', years: Y15 },
      { name: 'EQS', nameAr: 'إي كيو إس', years: Y22 },
      { name: 'EQE', nameAr: 'إي كيو إي', years: Y22 },
      { name: 'Maybach S-Class', nameAr: 'مايباخ', years: Y15 },
      { name: 'Sprinter', nameAr: 'سبرنتر', years: Y00 },
      { name: 'GLB', nameAr: 'جي إل بي', years: Y20 },
      { name: 'GLA', nameAr: 'جي إل إيه', years: Y15 },
    ],
  },
  {
    name: 'BMW', nameAr: 'بي إم دبليو', slug: 'bmw', isPopular: true,
    models: [
      { name: '3 Series', nameAr: 'الفئة 3', years: Y00 },
      { name: '5 Series', nameAr: 'الفئة 5', years: Y00 },
      { name: '7 Series', nameAr: 'الفئة 7', years: Y00 },
      { name: 'X5', nameAr: 'إكس 5', years: Y00 },
      { name: 'X3', nameAr: 'إكس 3', years: Y05 },
      { name: 'X6', nameAr: 'إكس 6', years: Y10 },
      { name: 'X7', nameAr: 'إكس 7', years: Y18 },
      { name: '4 Series', nameAr: 'الفئة 4', years: Y15 },
      { name: '1 Series', nameAr: 'الفئة 1', years: Y10 },
      { name: '2 Series', nameAr: 'الفئة 2', years: Y15 },
      { name: '6 Series', nameAr: 'الفئة 6', years: Y05 },
      { name: '8 Series', nameAr: 'الفئة 8', years: Y18 },
      { name: 'X1', nameAr: 'إكس 1', years: Y10 },
      { name: 'X2', nameAr: 'إكس 2', years: Y18 },
      { name: 'X4', nameAr: 'إكس 4', years: Y15 },
      { name: 'Z4', nameAr: 'زد 4', years: Y10 },
      { name: 'M3', nameAr: 'إم 3', years: Y15 },
      { name: 'M4', nameAr: 'إم 4', years: Y15 },
      { name: 'M5', nameAr: 'إم 5', years: Y10 },
      { name: 'i4', nameAr: 'آي 4', years: Y22 },
      { name: 'i7', nameAr: 'آي 7', years: Y22 },
      { name: 'iX', nameAr: 'آي إكس', years: Y22 },
    ],
  },
  {
    name: 'Honda', nameAr: 'هوندا', slug: 'honda', isPopular: true,
    models: [
      { name: 'Civic', nameAr: 'سيفيك', years: Y00 },
      { name: 'Accord', nameAr: 'أكورد', years: Y00 },
      { name: 'CR-V', nameAr: 'سي آر في', years: Y00 },
      { name: 'Pilot', nameAr: 'بايلوت', years: Y05 },
      { name: 'City', nameAr: 'سيتي', years: Y05 },
      { name: 'Jazz / Fit', nameAr: 'جاز', years: Y05 },
      { name: 'HR-V', nameAr: 'إتش آر في', years: Y15 },
      { name: 'Odyssey', nameAr: 'أوديسي', years: Y05 },
      { name: 'ZR-V', nameAr: 'زد آر في', years: Y22 },
      { name: 'Civic Type R', nameAr: 'سيفيك تايب آر', years: Y18 },
    ],
  },
  {
    name: 'Hyundai', nameAr: 'هيونداي', slug: 'hyundai', isPopular: true,
    models: [
      { name: 'Tucson', nameAr: 'توسان', years: Y05 },
      { name: 'Elantra', nameAr: 'إلنترا', years: Y00 },
      { name: 'Sonata', nameAr: 'سوناتا', years: Y00 },
      { name: 'Santa Fe', nameAr: 'سانتا في', years: Y00 },
      { name: 'Accent', nameAr: 'أكسنت', years: Y00 },
      { name: 'Azera', nameAr: 'أزيرا', years: Y05 },
      { name: 'Creta', nameAr: 'كريتا', years: Y18 },
      { name: 'Palisade', nameAr: 'باليسيد', years: Y20 },
      { name: 'Kona', nameAr: 'كونا', years: Y18 },
      { name: 'Venue', nameAr: 'فينيو', years: Y20 },
      { name: 'Staria', nameAr: 'ستاريا', years: Y22 },
      { name: 'Ioniq 5', nameAr: 'أيونيك 5', years: Y22 },
      { name: 'Ioniq 6', nameAr: 'أيونيك 6', years: Y22 },
      { name: 'i10', nameAr: 'آي 10', years: Y10 },
      { name: 'i20', nameAr: 'آي 20', years: Y10 },
      { name: 'i30', nameAr: 'آي 30', years: Y10 },
    ],
  },
  {
    name: 'Kia', nameAr: 'كيا', slug: 'kia', isPopular: true,
    models: [
      { name: 'Sportage', nameAr: 'سبورتاج', years: Y05 },
      { name: 'Cerato / Forte', nameAr: 'سيراتو', years: Y05 },
      { name: 'Sorento', nameAr: 'سورينتو', years: Y05 },
      { name: 'K5 / Optima', nameAr: 'كيه 5', years: Y10 },
      { name: 'Seltos', nameAr: 'سيلتوس', years: Y20 },
      { name: 'Carnival', nameAr: 'كرنفال', years: Y05 },
      { name: 'Telluride', nameAr: 'تيلورايد', years: Y20 },
      { name: 'Pegas', nameAr: 'بيغاس', years: Y18 },
      { name: 'Rio', nameAr: 'ريو', years: Y05 },
      { name: 'Picanto', nameAr: 'بيكانتو', years: Y05 },
      { name: 'Soul', nameAr: 'سول', years: Y10 },
      { name: 'Stinger', nameAr: 'ستينجر', years: Y18 },
      { name: 'EV6', nameAr: 'إي في 6', years: Y22 },
      { name: 'EV9', nameAr: 'إي في 9', years: Y24 },
      { name: 'Niro', nameAr: 'نيرو', years: Y18 },
    ],
  },
  {
    name: 'Ford', nameAr: 'فورد', slug: 'ford', isPopular: true,
    models: [
      { name: 'Explorer', nameAr: 'إكسبلورر', years: Y00 },
      { name: 'Expedition', nameAr: 'إكسبديشن', years: Y00 },
      { name: 'Mustang', nameAr: 'موستانج', years: Y05 },
      { name: 'F-150', nameAr: 'إف 150', years: Y00 },
      { name: 'Edge', nameAr: 'إيدج', years: Y10 },
      { name: 'Escape', nameAr: 'إسكيب', years: Y05 },
      { name: 'Bronco', nameAr: 'برونكو', years: Y20 },
      { name: 'Ranger', nameAr: 'رينجر', years: Y05 },
      { name: 'Taurus', nameAr: 'تورس', years: Y00 },
      { name: 'Territory', nameAr: 'تيريتوري', years: Y20 },
      { name: 'Everest', nameAr: 'إيفرست', years: Y15 },
      { name: 'EcoSport', nameAr: 'إيكو سبورت', years: Y15 },
      { name: 'Raptor', nameAr: 'رابتر', years: Y18 },
    ],
  },
  {
    name: 'Chevrolet', nameAr: 'شيفروليه', slug: 'chevrolet', isPopular: true,
    models: [
      { name: 'Tahoe', nameAr: 'تاهو', years: Y00 },
      { name: 'Suburban', nameAr: 'سوبربان', years: Y00 },
      { name: 'Silverado', nameAr: 'سلفرادو', years: Y00 },
      { name: 'Camaro', nameAr: 'كمارو', years: Y10 },
      { name: 'Malibu', nameAr: 'ماليبو', years: Y05 },
      { name: 'Traverse', nameAr: 'ترافيرس', years: Y10 },
      { name: 'Equinox', nameAr: 'إكوينوكس', years: Y10 },
      { name: 'Blazer', nameAr: 'بليزر', years: Y20 },
      { name: 'Trailblazer', nameAr: 'تريل بليزر', years: Y20 },
      { name: 'Colorado', nameAr: 'كولورادو', years: Y15 },
      { name: 'Captiva', nameAr: 'كابتيفا', years: Y10 },
      { name: 'Groove', nameAr: 'غروف', years: Y22 },
    ],
  },
  {
    name: 'GMC', nameAr: 'جي إم سي', slug: 'gmc', isPopular: true,
    models: [
      { name: 'Yukon', nameAr: 'يوكن', years: Y00 },
      { name: 'Sierra', nameAr: 'سييرا', years: Y00 },
      { name: 'Terrain', nameAr: 'تيرين', years: Y10 },
      { name: 'Acadia', nameAr: 'أكاديا', years: Y10 },
      { name: 'Canyon', nameAr: 'كانيون', years: Y15 },
      { name: 'Hummer EV', nameAr: 'همر إي في', years: Y22 },
    ],
  },
  {
    name: 'Audi', nameAr: 'أودي', slug: 'audi', isPopular: true,
    models: [
      { name: 'A3', nameAr: 'إيه 3', years: Y05 },
      { name: 'A4', nameAr: 'إيه 4', years: Y00 },
      { name: 'A5', nameAr: 'إيه 5', years: Y10 },
      { name: 'A6', nameAr: 'إيه 6', years: Y00 },
      { name: 'A7', nameAr: 'إيه 7', years: Y10 },
      { name: 'A8', nameAr: 'إيه 8', years: Y00 },
      { name: 'Q3', nameAr: 'كيو 3', years: Y10 },
      { name: 'Q5', nameAr: 'كيو 5', years: Y10 },
      { name: 'Q7', nameAr: 'كيو 7', years: Y05 },
      { name: 'Q8', nameAr: 'كيو 8', years: Y18 },
      { name: 'RS3', nameAr: 'آر إس 3', years: Y18 },
      { name: 'RS6', nameAr: 'آر إس 6', years: Y18 },
      { name: 'RS7', nameAr: 'آر إس 7', years: Y18 },
      { name: 'e-tron', nameAr: 'إي ترون', years: Y20 },
      { name: 'e-tron GT', nameAr: 'إي ترون جي تي', years: Y22 },
      { name: 'TT', nameAr: 'تي تي', years: Y05 },
    ],
  },
  {
    name: 'Porsche', nameAr: 'بورشه', slug: 'porsche', isPopular: true,
    models: [
      { name: 'Cayenne', nameAr: 'كايين', years: Y05 },
      { name: 'Macan', nameAr: 'ماكان', years: Y15 },
      { name: 'Panamera', nameAr: 'باناميرا', years: Y10 },
      { name: '911', nameAr: '911', years: Y00 },
      { name: 'Cayman', nameAr: 'كايمان', years: Y05 },
      { name: 'Boxster', nameAr: 'بوكستر', years: Y00 },
      { name: 'Taycan', nameAr: 'تايكان', years: Y20 },
    ],
  },
  {
    name: 'Mitsubishi', nameAr: 'ميتسوبيشي', slug: 'mitsubishi', isPopular: true,
    models: [
      { name: 'Pajero', nameAr: 'باجيرو', years: Y00 },
      { name: 'Outlander', nameAr: 'أوتلاندر', years: Y05 },
      { name: 'L200', nameAr: 'إل 200', years: Y00 },
      { name: 'ASX', nameAr: 'إيه إس إكس', years: Y10 },
      { name: 'Eclipse Cross', nameAr: 'إكلبس كروس', years: Y18 },
      { name: 'Attrage', nameAr: 'أتراج', years: Y15 },
      { name: 'Xpander', nameAr: 'إكسباندر', years: Y18 },
      { name: 'Montero Sport', nameAr: 'مونتيرو سبورت', years: Y10 },
      { name: 'Lancer', nameAr: 'لانسر', years: Y00 },
    ],
  },

  // ══════════════════════════════════════
  // ماركات عالمية
  // ══════════════════════════════════════
  {
    name: 'Volkswagen', nameAr: 'فولكس فاجن', slug: 'volkswagen', isPopular: false,
    models: [
      { name: 'Golf', nameAr: 'غولف', years: Y00 },
      { name: 'Passat', nameAr: 'باسات', years: Y00 },
      { name: 'Tiguan', nameAr: 'تيجوان', years: Y10 },
      { name: 'Touareg', nameAr: 'طوارق', years: Y05 },
      { name: 'Jetta', nameAr: 'جيتا', years: Y00 },
      { name: 'ID.4', nameAr: 'آي دي 4', years: Y22 },
      { name: 'Arteon', nameAr: 'أرتيون', years: Y18 },
      { name: 'T-Roc', nameAr: 'تي روك', years: Y18 },
      { name: 'Polo', nameAr: 'بولو', years: Y05 },
      { name: 'Teramont', nameAr: 'تيرامونت', years: Y18 },
    ],
  },
  {
    name: 'Mazda', nameAr: 'مازدا', slug: 'mazda', isPopular: false,
    models: [
      { name: 'CX-5', nameAr: 'سي إكس 5', years: Y10 },
      { name: 'CX-9', nameAr: 'سي إكس 9', years: Y10 },
      { name: 'Mazda3', nameAr: 'مازدا 3', years: Y05 },
      { name: 'Mazda6', nameAr: 'مازدا 6', years: Y05 },
      { name: 'CX-30', nameAr: 'سي إكس 30', years: Y20 },
      { name: 'MX-5', nameAr: 'إم إكس 5', years: Y05 },
      { name: 'CX-3', nameAr: 'سي إكس 3', years: Y15 },
      { name: 'CX-50', nameAr: 'سي إكس 50', years: Y22 },
      { name: 'CX-60', nameAr: 'سي إكس 60', years: Y22 },
      { name: 'CX-90', nameAr: 'سي إكس 90', years: Y24 },
    ],
  },
  {
    name: 'Subaru', nameAr: 'سوبارو', slug: 'subaru', isPopular: false,
    models: [
      { name: 'Outback', nameAr: 'أوت باك', years: Y05 },
      { name: 'Forester', nameAr: 'فورستر', years: Y05 },
      { name: 'XV / Crosstrek', nameAr: 'إكس في', years: Y10 },
      { name: 'WRX', nameAr: 'دبليو آر إكس', years: Y10 },
      { name: 'Legacy', nameAr: 'ليجاسي', years: Y00 },
      { name: 'Impreza', nameAr: 'إمبريزا', years: Y00 },
      { name: 'Solterra', nameAr: 'سولتيرا', years: Y22 },
    ],
  },
  {
    name: 'Suzuki', nameAr: 'سوزوكي', slug: 'suzuki', isPopular: false,
    models: [
      { name: 'Vitara', nameAr: 'فيتارا', years: Y05 },
      { name: 'Jimny', nameAr: 'جمني', years: Y00 },
      { name: 'Swift', nameAr: 'سويفت', years: Y05 },
      { name: 'Dzire', nameAr: 'ديزاير', years: Y18 },
      { name: 'Ertiga', nameAr: 'إرتيجا', years: Y18 },
      { name: 'Baleno', nameAr: 'بالينو', years: Y18 },
      { name: 'Grand Vitara', nameAr: 'غراند فيتارا', years: Y22 },
      { name: 'S-Presso', nameAr: 'إس بريسو', years: Y20 },
      { name: 'Fronx', nameAr: 'فرونكس', years: Y24 },
    ],
  },
  {
    name: 'Jeep', nameAr: 'جيب', slug: 'jeep', isPopular: false,
    models: [
      { name: 'Wrangler', nameAr: 'رانجلر', years: Y00 },
      { name: 'Grand Cherokee', nameAr: 'غراند شيروكي', years: Y00 },
      { name: 'Cherokee', nameAr: 'شيروكي', years: Y05 },
      { name: 'Compass', nameAr: 'كومباس', years: Y10 },
      { name: 'Gladiator', nameAr: 'غلادياتور', years: Y20 },
      { name: 'Renegade', nameAr: 'رينيغيد', years: Y15 },
    ],
  },
  {
    name: 'Dodge', nameAr: 'دودج', slug: 'dodge', isPopular: false,
    models: [
      { name: 'Charger', nameAr: 'تشارجر', years: Y05 },
      { name: 'Challenger', nameAr: 'تشالنجر', years: Y10 },
      { name: 'Durango', nameAr: 'دورانغو', years: Y05 },
      { name: 'Hornet', nameAr: 'هورنت', years: Y24 },
    ],
  },
  {
    name: 'RAM', nameAr: 'رام', slug: 'ram', isPopular: false,
    models: [
      { name: '1500', nameAr: '1500', years: Y10 },
      { name: '2500', nameAr: '2500', years: Y10 },
      { name: '3500', nameAr: '3500', years: Y10 },
    ],
  },
  {
    name: 'Cadillac', nameAr: 'كاديلاك', slug: 'cadillac', isPopular: false,
    models: [
      { name: 'Escalade', nameAr: 'إسكاليد', years: Y00 },
      { name: 'CT5', nameAr: 'سي تي 5', years: Y20 },
      { name: 'CT4', nameAr: 'سي تي 4', years: Y20 },
      { name: 'XT5', nameAr: 'إكس تي 5', years: Y15 },
      { name: 'XT6', nameAr: 'إكس تي 6', years: Y20 },
      { name: 'XT4', nameAr: 'إكس تي 4', years: Y18 },
      { name: 'Lyriq', nameAr: 'ليريك', years: Y22 },
    ],
  },
  {
    name: 'Lincoln', nameAr: 'لينكولن', slug: 'lincoln', isPopular: false,
    models: [
      { name: 'Navigator', nameAr: 'نافيجيتور', years: Y00 },
      { name: 'Aviator', nameAr: 'أفياتور', years: Y20 },
      { name: 'Corsair', nameAr: 'كورسير', years: Y20 },
      { name: 'Nautilus', nameAr: 'نوتيلوس', years: Y15 },
    ],
  },
  {
    name: 'Infiniti', nameAr: 'إنفينيتي', slug: 'infiniti', isPopular: false,
    models: [
      { name: 'QX80', nameAr: 'كيو إكس 80', years: Y10 },
      { name: 'QX60', nameAr: 'كيو إكس 60', years: Y10 },
      { name: 'QX50', nameAr: 'كيو إكس 50', years: Y10 },
      { name: 'Q50', nameAr: 'كيو 50', years: Y15 },
      { name: 'Q60', nameAr: 'كيو 60', years: Y15 },
    ],
  },
  {
    name: 'Acura', nameAr: 'أكيورا', slug: 'acura', isPopular: false,
    models: [
      { name: 'MDX', nameAr: 'إم دي إكس', years: Y05 },
      { name: 'RDX', nameAr: 'آر دي إكس', years: Y10 },
      { name: 'TLX', nameAr: 'تي إل إكس', years: Y15 },
      { name: 'Integra', nameAr: 'إنتيجرا', years: Y22 },
    ],
  },
  {
    name: 'Volvo', nameAr: 'فولفو', slug: 'volvo', isPopular: false,
    models: [
      { name: 'XC90', nameAr: 'إكس سي 90', years: Y05 },
      { name: 'XC60', nameAr: 'إكس سي 60', years: Y10 },
      { name: 'XC40', nameAr: 'إكس سي 40', years: Y18 },
      { name: 'S90', nameAr: 'إس 90', years: Y15 },
      { name: 'S60', nameAr: 'إس 60', years: Y10 },
      { name: 'V60', nameAr: 'في 60', years: Y15 },
      { name: 'EX30', nameAr: 'إي إكس 30', years: Y24 },
      { name: 'EX90', nameAr: 'إي إكس 90', years: Y24 },
    ],
  },
  {
    name: 'Jaguar', nameAr: 'جاكوار', slug: 'jaguar', isPopular: false,
    models: [
      { name: 'F-Pace', nameAr: 'إف بيس', years: Y15 },
      { name: 'E-Pace', nameAr: 'إي بيس', years: Y18 },
      { name: 'XF', nameAr: 'إكس إف', years: Y10 },
      { name: 'XE', nameAr: 'إكس إي', years: Y15 },
      { name: 'F-Type', nameAr: 'إف تايب', years: Y15 },
      { name: 'I-Pace', nameAr: 'آي بيس', years: Y18 },
    ],
  },

  // ══════════════════════════════════════
  // سيارات فاخرة / رياضية
  // ══════════════════════════════════════
  {
    name: 'Maserati', nameAr: 'مازيراتي', slug: 'maserati', isPopular: false,
    models: [
      { name: 'Ghibli', nameAr: 'غيبلي', years: Y15 },
      { name: 'Levante', nameAr: 'ليفانتي', years: Y15 },
      { name: 'Quattroporte', nameAr: 'كواتروبورتي', years: Y05 },
      { name: 'MC20', nameAr: 'إم سي 20', years: Y22 },
      { name: 'Grecale', nameAr: 'غريكالي', years: Y22 },
      { name: 'GranTurismo', nameAr: 'غران توريزمو', years: Y22 },
    ],
  },
  {
    name: 'Ferrari', nameAr: 'فيراري', slug: 'ferrari', isPopular: false,
    models: [
      { name: '488', nameAr: '488', years: Y15 },
      { name: 'F8 Tributo', nameAr: 'إف 8 تريبوتو', years: Y20 },
      { name: 'Roma', nameAr: 'روما', years: Y20 },
      { name: 'Portofino', nameAr: 'بورتوفينو', years: Y18 },
      { name: '296 GTB', nameAr: '296 جي تي بي', years: Y22 },
      { name: 'SF90', nameAr: 'إس إف 90', years: Y20 },
      { name: 'Purosangue', nameAr: 'بوروسانغي', years: Y24 },
      { name: '812', nameAr: '812', years: Y18 },
    ],
  },
  {
    name: 'Lamborghini', nameAr: 'لامبورغيني', slug: 'lamborghini', isPopular: false,
    models: [
      { name: 'Urus', nameAr: 'أوروس', years: Y18 },
      { name: 'Huracan', nameAr: 'هوراكان', years: Y15 },
      { name: 'Aventador', nameAr: 'أفينتادور', years: Y10 },
      { name: 'Revuelto', nameAr: 'ريفويلتو', years: Y24 },
    ],
  },
  {
    name: 'Bentley', nameAr: 'بنتلي', slug: 'bentley', isPopular: false,
    models: [
      { name: 'Bentayga', nameAr: 'بنتايجا', years: Y15 },
      { name: 'Continental GT', nameAr: 'كونتيننتال جي تي', years: Y05 },
      { name: 'Flying Spur', nameAr: 'فلاينج سبير', years: Y10 },
    ],
  },
  {
    name: 'Rolls-Royce', nameAr: 'رولز رويس', slug: 'rolls-royce', isPopular: false,
    models: [
      { name: 'Ghost', nameAr: 'غوست', years: Y10 },
      { name: 'Phantom', nameAr: 'فانتوم', years: Y05 },
      { name: 'Cullinan', nameAr: 'كولينان', years: Y18 },
      { name: 'Wraith', nameAr: 'رايث', years: Y15 },
      { name: 'Spectre', nameAr: 'سبكتر', years: Y24 },
    ],
  },
  {
    name: 'Aston Martin', nameAr: 'أستون مارتن', slug: 'aston-martin', isPopular: false,
    models: [
      { name: 'DB11', nameAr: 'دي بي 11', years: Y18 },
      { name: 'DB12', nameAr: 'دي بي 12', years: Y24 },
      { name: 'Vantage', nameAr: 'فانتاج', years: Y18 },
      { name: 'DBX', nameAr: 'دي بي إكس', years: Y20 },
    ],
  },
  {
    name: 'McLaren', nameAr: 'ماكلارين', slug: 'mclaren', isPopular: false,
    models: [
      { name: '720S', nameAr: '720 إس', years: Y18 },
      { name: 'GT', nameAr: 'جي تي', years: Y20 },
      { name: 'Artura', nameAr: 'أرتورا', years: Y22 },
      { name: '750S', nameAr: '750 إس', years: Y24 },
    ],
  },

  // ══════════════════════════════════════
  // ماركات كورية / يابانية إضافية
  // ══════════════════════════════════════
  {
    name: 'Genesis', nameAr: 'جينيسيس', slug: 'genesis', isPopular: false,
    models: [
      { name: 'G70', nameAr: 'جي 70', years: Y18 },
      { name: 'G80', nameAr: 'جي 80', years: Y18 },
      { name: 'G90', nameAr: 'جي 90', years: Y18 },
      { name: 'GV70', nameAr: 'جي في 70', years: Y20 },
      { name: 'GV80', nameAr: 'جي في 80', years: Y20 },
      { name: 'GV60', nameAr: 'جي في 60', years: Y22 },
    ],
  },
  {
    name: 'Daihatsu', nameAr: 'دايهاتسو', slug: 'daihatsu', isPopular: false,
    models: [
      { name: 'Terios', nameAr: 'تيريوس', years: Y05 },
      { name: 'Sirion', nameAr: 'سيريون', years: Y05 },
      { name: 'Rocky', nameAr: 'روكي', years: Y20 },
    ],
  },
  {
    name: 'Isuzu', nameAr: 'إيسوزو', slug: 'isuzu', isPopular: false,
    models: [
      { name: 'D-Max', nameAr: 'دي ماكس', years: Y05 },
      { name: 'MU-X', nameAr: 'إم يو إكس', years: Y15 },
    ],
  },

  // ══════════════════════════════════════
  // ماركات فرنسية
  // ══════════════════════════════════════
  {
    name: 'Peugeot', nameAr: 'بيجو', slug: 'peugeot', isPopular: false,
    models: [
      { name: '3008', nameAr: '3008', years: Y10 },
      { name: '5008', nameAr: '5008', years: Y10 },
      { name: '2008', nameAr: '2008', years: Y18 },
      { name: '208', nameAr: '208', years: Y15 },
      { name: '508', nameAr: '508', years: Y10 },
      { name: '301', nameAr: '301', years: Y10 },
    ],
  },
  {
    name: 'Renault', nameAr: 'رينو', slug: 'renault', isPopular: false,
    models: [
      { name: 'Duster', nameAr: 'داستر', years: Y10 },
      { name: 'Koleos', nameAr: 'كوليوس', years: Y10 },
      { name: 'Megane', nameAr: 'ميغان', years: Y05 },
      { name: 'Captur', nameAr: 'كابتشر', years: Y18 },
      { name: 'Symbol', nameAr: 'سيمبول', years: Y10 },
      { name: 'Talisman', nameAr: 'تاليسمان', years: Y15 },
    ],
  },
  {
    name: 'Citroen', nameAr: 'سيتروين', slug: 'citroen', isPopular: false,
    models: [
      { name: 'C5 Aircross', nameAr: 'سي 5 إيركروس', years: Y18 },
      { name: 'C4', nameAr: 'سي 4', years: Y10 },
      { name: 'C3', nameAr: 'سي 3', years: Y10 },
      { name: 'C3 Aircross', nameAr: 'سي 3 إيركروس', years: Y18 },
    ],
  },

  // ══════════════════════════════════════
  // ماركات أوروبية أخرى
  // ══════════════════════════════════════
  {
    name: 'Skoda', nameAr: 'سكودا', slug: 'skoda', isPopular: false,
    models: [
      { name: 'Octavia', nameAr: 'أوكتافيا', years: Y10 },
      { name: 'Superb', nameAr: 'سوبيرب', years: Y10 },
      { name: 'Kodiaq', nameAr: 'كودياق', years: Y18 },
      { name: 'Karoq', nameAr: 'كاروق', years: Y18 },
      { name: 'Kamiq', nameAr: 'كاميق', years: Y20 },
    ],
  },
  {
    name: 'MINI', nameAr: 'ميني', slug: 'mini', isPopular: false,
    models: [
      { name: 'Cooper', nameAr: 'كوبر', years: Y05 },
      { name: 'Countryman', nameAr: 'كنتريمان', years: Y10 },
      { name: 'Clubman', nameAr: 'كلابمان', years: Y10 },
    ],
  },
  {
    name: 'Fiat', nameAr: 'فيات', slug: 'fiat', isPopular: false,
    models: [
      { name: '500', nameAr: '500', years: Y10 },
      { name: '500X', nameAr: '500 إكس', years: Y15 },
      { name: 'Tipo', nameAr: 'تيبو', years: Y15 },
    ],
  },
  {
    name: 'Alfa Romeo', nameAr: 'ألفا روميو', slug: 'alfa-romeo', isPopular: false,
    models: [
      { name: 'Giulia', nameAr: 'جوليا', years: Y15 },
      { name: 'Stelvio', nameAr: 'ستيلفيو', years: Y18 },
      { name: 'Tonale', nameAr: 'تونالي', years: Y22 },
    ],
  },
  {
    name: 'Chrysler', nameAr: 'كرايسلر', slug: 'chrysler', isPopular: false,
    models: [
      { name: '300', nameAr: '300', years: Y05 },
      { name: 'Pacifica', nameAr: 'باسيفيكا', years: Y15 },
    ],
  },
  {
    name: 'Opel', nameAr: 'أوبل', slug: 'opel', isPopular: false,
    models: [
      { name: 'Astra', nameAr: 'أسترا', years: Y05 },
      { name: 'Corsa', nameAr: 'كورسا', years: Y05 },
      { name: 'Grandland', nameAr: 'غراند لاند', years: Y18 },
      { name: 'Mokka', nameAr: 'موكا', years: Y18 },
    ],
  },
  {
    name: 'Tesla', nameAr: 'تسلا', slug: 'tesla', isPopular: false,
    models: [
      { name: 'Model 3', nameAr: 'موديل 3', years: Y18 },
      { name: 'Model Y', nameAr: 'موديل واي', years: Y20 },
      { name: 'Model S', nameAr: 'موديل إس', years: Y15 },
      { name: 'Model X', nameAr: 'موديل إكس', years: Y15 },
      { name: 'Cybertruck', nameAr: 'سايبر تراك', years: Y24 },
    ],
  },

  // ══════════════════════════════════════
  // ماركات صينية
  // ══════════════════════════════════════
  {
    name: 'Changan', nameAr: 'شانجان', slug: 'changan', isPopular: false,
    models: [
      { name: 'CS75 Plus', nameAr: 'سي إس 75 بلس', years: Y20 },
      { name: 'CS85', nameAr: 'سي إس 85', years: Y20 },
      { name: 'CS35 Plus', nameAr: 'سي إس 35 بلس', years: Y18 },
      { name: 'Alsvin', nameAr: 'ألسفين', years: Y20 },
      { name: 'Uni-T', nameAr: 'يوني تي', years: Y20 },
      { name: 'Uni-K', nameAr: 'يوني كيه', years: Y22 },
      { name: 'Uni-V', nameAr: 'يوني في', years: Y22 },
      { name: 'Eado', nameAr: 'إيدو', years: Y18 },
    ],
  },
  {
    name: 'Chery', nameAr: 'شيري', slug: 'chery', isPopular: false,
    models: [
      { name: 'Tiggo 7 Pro', nameAr: 'تيجو 7 برو', years: Y20 },
      { name: 'Tiggo 8 Pro', nameAr: 'تيجو 8 برو', years: Y20 },
      { name: 'Tiggo 4 Pro', nameAr: 'تيجو 4 برو', years: Y20 },
      { name: 'Arrizo 6', nameAr: 'أريزو 6', years: Y20 },
      { name: 'Tiggo 2', nameAr: 'تيجو 2', years: Y18 },
    ],
  },
  {
    name: 'Geely', nameAr: 'جيلي', slug: 'geely', isPopular: false,
    models: [
      { name: 'Coolray', nameAr: 'كول راي', years: Y20 },
      { name: 'Azkarra', nameAr: 'أزكارا', years: Y20 },
      { name: 'Emgrand', nameAr: 'إمجراند', years: Y18 },
      { name: 'Monjaro', nameAr: 'مونجارو', years: Y22 },
      { name: 'Tugella', nameAr: 'توجيلا', years: Y20 },
      { name: 'Okavango', nameAr: 'أوكافانغو', years: Y20 },
    ],
  },
  {
    name: 'Haval', nameAr: 'هافال', slug: 'haval', isPopular: false,
    models: [
      { name: 'H6', nameAr: 'إتش 6', years: Y20 },
      { name: 'Jolion', nameAr: 'جوليون', years: Y20 },
      { name: 'H9', nameAr: 'إتش 9', years: Y18 },
      { name: 'Dargo', nameAr: 'دارجو', years: Y22 },
    ],
  },
  {
    name: 'MG', nameAr: 'إم جي', slug: 'mg', isPopular: false,
    models: [
      { name: 'ZS', nameAr: 'زد إس', years: Y18 },
      { name: 'HS', nameAr: 'إتش إس', years: Y18 },
      { name: 'RX5', nameAr: 'آر إكس 5', years: Y18 },
      { name: 'GT', nameAr: 'جي تي', years: Y18 },
      { name: 'MG 5', nameAr: 'إم جي 5', years: Y20 },
      { name: 'MG 7', nameAr: 'إم جي 7', years: Y22 },
      { name: 'Marvel R', nameAr: 'مارفل آر', years: Y22 },
      { name: 'MG 4', nameAr: 'إم جي 4', years: Y22 },
    ],
  },
  {
    name: 'BYD', nameAr: 'بي واي دي', slug: 'byd', isPopular: false,
    models: [
      { name: 'Atto 3', nameAr: 'أتو 3', years: Y22 },
      { name: 'Han', nameAr: 'هان', years: Y22 },
      { name: 'Tang', nameAr: 'تانغ', years: Y22 },
      { name: 'Seal', nameAr: 'سيل', years: Y22 },
      { name: 'Dolphin', nameAr: 'دولفين', years: Y22 },
      { name: 'Song Plus', nameAr: 'سونغ بلس', years: Y22 },
    ],
  },
  {
    name: 'GAC', nameAr: 'جي أي سي', slug: 'gac', isPopular: false,
    models: [
      { name: 'GS8', nameAr: 'جي إس 8', years: Y20 },
      { name: 'GS4', nameAr: 'جي إس 4', years: Y20 },
      { name: 'GS3', nameAr: 'جي إس 3', years: Y20 },
      { name: 'Emkoo', nameAr: 'إمكو', years: Y22 },
      { name: 'Empow', nameAr: 'إمباو', years: Y24 },
    ],
  },
  {
    name: 'Great Wall', nameAr: 'جريت وول', slug: 'great-wall', isPopular: false,
    models: [
      { name: 'Wingle', nameAr: 'وينجل', years: Y10 },
      { name: 'Poer', nameAr: 'باور', years: Y20 },
    ],
  },
  {
    name: 'Jetour', nameAr: 'جيتور', slug: 'jetour', isPopular: false,
    models: [
      { name: 'X70', nameAr: 'إكس 70', years: Y20 },
      { name: 'X90', nameAr: 'إكس 90', years: Y22 },
      { name: 'Dashing', nameAr: 'داشنغ', years: Y22 },
      { name: 'T2', nameAr: 'تي 2', years: Y24 },
    ],
  },
  {
    name: 'Tank', nameAr: 'تانك', slug: 'tank', isPopular: false,
    models: [
      { name: 'Tank 300', nameAr: 'تانك 300', years: Y22 },
      { name: 'Tank 500', nameAr: 'تانك 500', years: Y22 },
    ],
  },
  {
    name: 'BAIC', nameAr: 'بايك', slug: 'baic', isPopular: false,
    models: [
      { name: 'X55', nameAr: 'إكس 55', years: Y20 },
      { name: 'X7', nameAr: 'إكس 7', years: Y22 },
      { name: 'X35', nameAr: 'إكس 35', years: Y20 },
    ],
  },
  {
    name: 'Hongqi', nameAr: 'هونغتشي', slug: 'hongqi', isPopular: false,
    models: [
      { name: 'H9', nameAr: 'إتش 9', years: Y22 },
      { name: 'E-HS9', nameAr: 'إي إتش إس 9', years: Y22 },
      { name: 'HS5', nameAr: 'إتش إس 5', years: Y22 },
    ],
  },
  {
    name: 'Bestune', nameAr: 'بيستون', slug: 'bestune', isPopular: false,
    models: [
      { name: 'T77', nameAr: 'تي 77', years: Y20 },
      { name: 'T99', nameAr: 'تي 99', years: Y22 },
      { name: 'B70', nameAr: 'بي 70', years: Y20 },
    ],
  },
  {
    name: 'Maxus', nameAr: 'ماكسوس', slug: 'maxus', isPopular: false,
    models: [
      { name: 'D90', nameAr: 'دي 90', years: Y20 },
      { name: 'T60', nameAr: 'تي 60', years: Y20 },
      { name: 'G50', nameAr: 'جي 50', years: Y20 },
    ],
  },

  // ══════════════════════════════════════
  // ماركات أخرى
  // ══════════════════════════════════════
  {
    name: 'Proton', nameAr: 'بروتون', slug: 'proton', isPopular: false,
    models: [
      { name: 'X70', nameAr: 'إكس 70', years: Y20 },
      { name: 'X50', nameAr: 'إكس 50', years: Y20 },
      { name: 'Saga', nameAr: 'ساغا', years: Y15 },
    ],
  },
  {
    name: 'Dacia', nameAr: 'داتشيا', slug: 'dacia', isPopular: false,
    models: [
      { name: 'Duster', nameAr: 'داستر', years: Y10 },
      { name: 'Sandero', nameAr: 'سانديرو', years: Y10 },
      { name: 'Jogger', nameAr: 'جوغر', years: Y22 },
    ],
  },
];
