export interface SubCategory {
  value: string;
  label: string;
  route: string;
  available: boolean;
}

export interface MainCategory {
  value: string;
  label: string;
  icon: string;
  color: string;
  subcategories: SubCategory[];
}

type T = (key: string) => string;

export function getMainCategories(t: T): MainCategory[] {
  return [
    {
      value: 'vehicles-parts', label: t('vehiclesParts'), icon: '🚗',
      color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
      subcategories: [
        { value: 'car-sale', label: t('carSale'), route: '/add-listing/car?type=SALE', available: true },
        { value: 'car-rental', label: t('carRental'), route: '/add-listing/car?type=RENTAL', available: true },
        { value: 'spare-parts', label: t('spareParts'), route: '/add-listing/parts', available: true },
        { value: 'tires-batteries', label: t('tiresBatteries'), route: '/add-listing/parts?cat=TIRES', available: true },
        { value: 'accessories', label: t('accessories'), route: '/add-listing/parts?cat=ACCESSORIES', available: true },
      ],
    },
    {
      value: 'buses', label: t('buses'), icon: '🚌',
      color: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
      subcategories: [
        { value: 'bus-sale', label: t('busSale'), route: '/coming-soon?section=buses', available: false },
        { value: 'bus-sale-contract', label: t('busSaleContract'), route: '/coming-soon?section=buses', available: false },
        { value: 'bus-rent', label: t('busRent'), route: '/coming-soon?section=buses', available: false },
        { value: 'bus-contract', label: t('busContract'), route: '/coming-soon?section=buses', available: false },
      ],
    },
    {
      value: 'jobs', label: t('jobs'), icon: '💼',
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
      subcategories: [
        { value: 'job-offering', label: t('jobOffering'), route: '/jobs/new?type=OFFERING', available: true },
        { value: 'job-hiring', label: t('jobHiring'), route: '/jobs/new?type=HIRING', available: true },
      ],
    },
    {
      value: 'car-services', label: t('carServices'), icon: '🔧',
      color: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
      subcategories: [
        { value: 'maintenance', label: t('maintenance'), route: '/add-listing/service?type=MAINTENANCE', available: true },
        { value: 'cleaning', label: t('cleaning'), route: '/add-listing/service?type=CLEANING', available: true },
        { value: 'inspection', label: t('inspection'), route: '/add-listing/service?type=INSPECTION', available: true },
        { value: 'bodywork', label: t('bodywork'), route: '/add-listing/service?type=BODYWORK', available: true },
        { value: 'towing', label: t('towing'), route: '/add-listing/service?type=TOWING', available: true },
        { value: 'modification', label: t('modification'), route: '/add-listing/service?type=MODIFICATION', available: true },
        { value: 'keys', label: t('keys'), route: '/add-listing/service?type=KEYS_LOCKS', available: true },
        { value: 'accessories-install', label: t('accessoriesInstall'), route: '/add-listing/service?type=ACCESSORIES_INSTALL', available: true },
      ],
    },
    {
      value: 'transport', label: t('transport'), icon: '🚛',
      color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
      subcategories: [
        { value: 'cargo', label: t('cargo'), route: '/add-listing/transport?type=CARGO', available: false },
        { value: 'furniture', label: t('furniture'), route: '/add-listing/transport?type=FURNITURE', available: false },
        { value: 'delivery', label: t('delivery'), route: '/add-listing/transport?type=DELIVERY', available: false },
        { value: 'heavy', label: t('heavy'), route: '/add-listing/transport?type=HEAVY_TRANSPORT', available: false },
        { value: 'truck-rental', label: t('truckRental'), route: '/add-listing/transport?type=TRUCK_RENTAL', available: false },
      ],
    },
    {
      value: 'trips', label: t('trips'), icon: '🚌',
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
      subcategories: [
        { value: 'bus-subscription', label: t('busSubscription'), route: '/add-listing/trip?type=BUS_SUBSCRIPTION', available: false },
        { value: 'school-transport', label: t('schoolTransport'), route: '/add-listing/trip?type=SCHOOL_TRANSPORT', available: false },
        { value: 'tourism', label: t('tourism'), route: '/add-listing/trip?type=TOURISM', available: false },
        { value: 'corporate', label: t('corporate'), route: '/add-listing/trip?type=CORPORATE', available: false },
        { value: 'carpooling', label: t('carpooling'), route: '/add-listing/trip?type=CARPOOLING', available: false },
      ],
    },
    {
      value: 'motorcycles', label: t('motorcycles'), icon: '🏍️',
      color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
      subcategories: [
        { value: 'motorcycle-sale', label: t('motorcycleSale'), route: '/add-listing/car?type=SALE&vehicle=MOTORCYCLE', available: false },
        { value: 'motorcycle-parts', label: t('motorcycleParts'), route: '/add-listing/parts?vehicle=MOTORCYCLE', available: false },
      ],
    },
    {
      value: 'marine', label: t('marine'), icon: '🚤',
      color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
      subcategories: [
        { value: 'boat-sale', label: t('boatSale'), route: '/add-listing/car?type=SALE&vehicle=MARINE', available: false },
        { value: 'boat-rental', label: t('boatRental'), route: '/add-listing/car?type=RENTAL&vehicle=MARINE', available: false },
        { value: 'marine-parts', label: t('marineParts'), route: '/add-listing/parts?vehicle=MARINE', available: false },
      ],
    },
    {
      value: 'heavy-equipment', label: t('heavyEquipment'), icon: '🏗️',
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
      subcategories: [
        { value: 'equipment-sale', label: t('equipmentSale'), route: '/coming-soon?section=equipment', available: false },
        { value: 'equipment-rental', label: t('equipmentRental'), route: '/coming-soon?section=equipment', available: false },
        { value: 'equipment-request', label: t('equipmentRequest'), route: '/coming-soon?section=equipment', available: false },
        { value: 'operator-listing', label: t('operatorListing'), route: '/coming-soon?section=equipment', available: false },
      ],
    },
    {
      value: 'insurance', label: t('insurance'), icon: '🛡️',
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
      subcategories: [
        { value: 'car-insurance', label: t('carInsurance'), route: '/add-listing/insurance?type=CAR_COMPREHENSIVE', available: true },
        { value: 'financing', label: t('financing'), route: '/add-listing/insurance?type=FINANCING', available: true },
      ],
    },
  ];
}

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    value: 'vehicles-parts',
    label: 'سيارات وقطع غيار',
    icon: '🚗',
    color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    subcategories: [
      { value: 'car-sale', label: 'سيارات للبيع', route: '/add-listing/car?type=SALE', available: true },
      { value: 'car-rental', label: 'سيارات للإيجار', route: '/add-listing/car?type=RENTAL', available: true },
      { value: 'spare-parts', label: 'قطع غيار', route: '/add-listing/parts', available: true },
      { value: 'tires-batteries', label: 'إطارات وبطاريات وزيوت', route: '/add-listing/parts?cat=TIRES', available: true },
      { value: 'accessories', label: 'إكسسوارات سيارات', route: '/add-listing/parts?cat=ACCESSORIES', available: true },
    ],
  },
  {
    value: 'buses',
    label: 'حافلات',
    icon: '🚌',
    color: 'bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400',
    subcategories: [
      { value: 'bus-sale', label: 'حافلات للبيع', route: '/coming-soon?section=buses', available: false },
      { value: 'bus-sale-contract', label: 'بيع مع عقد', route: '/coming-soon?section=buses', available: false },
      { value: 'bus-rent', label: 'تأجير حافلات', route: '/coming-soon?section=buses', available: false },
      { value: 'bus-contract', label: 'طلبات نقل', route: '/coming-soon?section=buses', available: false },
    ],
  },
  {
    value: 'jobs',
    label: 'وظائف',
    icon: '💼',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    subcategories: [
      { value: 'job-offering', label: 'سائق يبحث عن عمل', route: '/jobs/new?type=OFFERING', available: true },
      { value: 'job-hiring', label: 'شركة تبحث عن سائق', route: '/jobs/new?type=HIRING', available: true },
    ],
  },
  {
    value: 'car-services',
    label: 'خدمات سيارات',
    icon: '🔧',
    color: 'bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
    subcategories: [
      { value: 'maintenance', label: 'صيانة وإصلاح', route: '/add-listing/service?type=MAINTENANCE', available: true },
      { value: 'cleaning', label: 'تلميع وتنظيف', route: '/add-listing/service?type=CLEANING', available: true },
      { value: 'inspection', label: 'فحص سيارات', route: '/add-listing/service?type=INSPECTION', available: true },
      { value: 'bodywork', label: 'سمكرة ودهان', route: '/add-listing/service?type=BODYWORK', available: true },
      { value: 'towing', label: 'سطحة ونجدة', route: '/add-listing/service?type=TOWING', available: true },
      { value: 'modification', label: 'تعديل وتيونينج', route: '/add-listing/service?type=MODIFICATION', available: true },
      { value: 'keys', label: 'مفاتيح وأقفال', route: '/add-listing/service?type=KEYS_LOCKS', available: true },
      { value: 'accessories-install', label: 'تركيب إكسسوارات', route: '/add-listing/service?type=ACCESSORIES_INSTALL', available: true },
    ],
  },
  {
    value: 'transport',
    label: 'خدمات نقل ولوجستيك',
    icon: '🚛',
    color: 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400',
    subcategories: [
      { value: 'cargo', label: 'نقل بضائع', route: '/add-listing/transport?type=CARGO', available: false },
      { value: 'furniture', label: 'نقل أثاث', route: '/add-listing/transport?type=FURNITURE', available: false },
      { value: 'delivery', label: 'توصيل طرود', route: '/add-listing/transport?type=DELIVERY', available: false },
      { value: 'heavy', label: 'نقل ثقيل', route: '/add-listing/transport?type=HEAVY_TRANSPORT', available: false },
      { value: 'truck-rental', label: 'تأجير شاحنات', route: '/add-listing/transport?type=TRUCK_RENTAL', available: false },
    ],
  },
  {
    value: 'trips',
    label: 'اشتراكات ورحلات',
    icon: '🚌',
    color: 'bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
    subcategories: [
      { value: 'bus-subscription', label: 'اشتراكات باصات', route: '/add-listing/trip?type=BUS_SUBSCRIPTION', available: false },
      { value: 'school-transport', label: 'توصيل مدارس', route: '/add-listing/trip?type=SCHOOL_TRANSPORT', available: false },
      { value: 'tourism', label: 'رحلات سياحية', route: '/add-listing/trip?type=TOURISM', available: false },
      { value: 'corporate', label: 'توصيل موظفين', route: '/add-listing/trip?type=CORPORATE', available: false },
      { value: 'carpooling', label: 'مشاركة رحلات', route: '/add-listing/trip?type=CARPOOLING', available: false },
    ],
  },
  {
    value: 'motorcycles',
    label: 'دراجات نارية',
    icon: '🏍️',
    color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400',
    subcategories: [
      { value: 'motorcycle-sale', label: 'دراجات للبيع', route: '/add-listing/car?type=SALE&vehicle=MOTORCYCLE', available: false },
      { value: 'motorcycle-parts', label: 'قطع غيار دراجات', route: '/add-listing/parts?vehicle=MOTORCYCLE', available: false },
    ],
  },
  {
    value: 'marine',
    label: 'مركبات بحرية',
    icon: '🚤',
    color: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400',
    subcategories: [
      { value: 'boat-sale', label: 'قوارب للبيع', route: '/add-listing/car?type=SALE&vehicle=MARINE', available: false },
      { value: 'boat-rental', label: 'تأجير بحري', route: '/add-listing/car?type=RENTAL&vehicle=MARINE', available: false },
      { value: 'marine-parts', label: 'معدات بحرية', route: '/add-listing/parts?vehicle=MARINE', available: false },
    ],
  },
  {
    value: 'heavy-equipment',
    label: 'معدات وخدمات',
    icon: '🏗️',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    subcategories: [
      { value: 'equipment-sale', label: 'بيع معدات', route: '/coming-soon?section=equipment', available: false },
      { value: 'equipment-rental', label: 'تأجير معدات', route: '/coming-soon?section=equipment', available: false },
      { value: 'equipment-request', label: 'طلب معدة', route: '/coming-soon?section=equipment', available: false },
      { value: 'operator-listing', label: 'مشغلين وفنيين', route: '/coming-soon?section=equipment', available: false },
    ],
  },
  {
    value: 'insurance',
    label: 'تأمين وتمويل',
    icon: '🛡️',
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    subcategories: [
      { value: 'car-insurance', label: 'تأمين سيارات', route: '/add-listing/insurance?type=CAR_COMPREHENSIVE', available: true },
      { value: 'financing', label: 'تمويل سيارات', route: '/add-listing/insurance?type=FINANCING', available: true },
    ],
  },
];
