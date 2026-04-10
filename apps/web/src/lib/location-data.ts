// ─── Arab World Location System ───
// 22 Arab countries → Governorates → Cities
// Scalable, static data — ready to migrate to API later

export interface LocationOption {
  value: string;
  label: string;
}

interface CityMap {
  [governorateCode: string]: LocationOption[];
}

interface GovernorateMap {
  [countryCode: string]: LocationOption[];
}

interface CityDataMap {
  [countryCode: string]: CityMap;
}

// ─── Countries ───
export const countries: LocationOption[] = [
  { value: 'OM', label: 'عُمان' },
  { value: 'SA', label: 'السعودية' },
  { value: 'AE', label: 'الإمارات' },
  { value: 'QA', label: 'قطر' },
  { value: 'KW', label: 'الكويت' },
  { value: 'BH', label: 'البحرين' },
  { value: 'YE', label: 'اليمن' },
  { value: 'IQ', label: 'العراق' },
  { value: 'JO', label: 'الأردن' },
  { value: 'LB', label: 'لبنان' },
  { value: 'SY', label: 'سوريا' },
  { value: 'PS', label: 'فلسطين' },
  { value: 'EG', label: 'مصر' },
  { value: 'SD', label: 'السودان' },
  { value: 'LY', label: 'ليبيا' },
  { value: 'TN', label: 'تونس' },
  { value: 'DZ', label: 'الجزائر' },
  { value: 'MA', label: 'المغرب' },
  { value: 'MR', label: 'موريتانيا' },
  { value: 'SO', label: 'الصومال' },
  { value: 'DJ', label: 'جيبوتي' },
  { value: 'KM', label: 'جزر القمر' },
];

// ─── Governorates per Country ───
const governorates: GovernorateMap = {
  // ══════════════ عُمان ══════════════
  OM: [
    { value: 'OM_MUS', label: 'مسقط' },
    { value: 'OM_DHO', label: 'ظفار' },
    { value: 'OM_DAK', label: 'الداخلية' },
    { value: 'OM_BAN', label: 'شمال الباطنة' },
    { value: 'OM_BAS', label: 'جنوب الباطنة' },
    { value: 'OM_SHN', label: 'شمال الشرقية' },
    { value: 'OM_SHS', label: 'جنوب الشرقية' },
    { value: 'OM_DHA', label: 'الظاهرة' },
    { value: 'OM_BUR', label: 'البريمي' },
    { value: 'OM_MSN', label: 'مسندم' },
    { value: 'OM_WUS', label: 'الوسطى' },
  ],

  // ══════════════ السعودية ══════════════
  SA: [
    { value: 'SA_RIY', label: 'الرياض' },
    { value: 'SA_MAK', label: 'مكة المكرمة' },
    { value: 'SA_MAD', label: 'المدينة المنورة' },
    { value: 'SA_QAS', label: 'القصيم' },
    { value: 'SA_ESH', label: 'الشرقية' },
    { value: 'SA_ASI', label: 'عسير' },
    { value: 'SA_TAB', label: 'تبوك' },
    { value: 'SA_HAI', label: 'حائل' },
    { value: 'SA_SHA', label: 'الحدود الشمالية' },
    { value: 'SA_JAZ', label: 'جازان' },
    { value: 'SA_NAJ', label: 'نجران' },
    { value: 'SA_BAH', label: 'الباحة' },
    { value: 'SA_JOF', label: 'الجوف' },
  ],

  // ══════════════ الإمارات ══════════════
  AE: [
    { value: 'AE_AUH', label: 'أبوظبي' },
    { value: 'AE_DXB', label: 'دبي' },
    { value: 'AE_SHJ', label: 'الشارقة' },
    { value: 'AE_AJM', label: 'عجمان' },
    { value: 'AE_UAQ', label: 'أم القيوين' },
    { value: 'AE_RAK', label: 'رأس الخيمة' },
    { value: 'AE_FUJ', label: 'الفجيرة' },
  ],

  // ══════════════ قطر ══════════════
  QA: [
    { value: 'QA_DOH', label: 'الدوحة' },
    { value: 'QA_WAK', label: 'الوكرة' },
    { value: 'QA_KHO', label: 'الخور' },
    { value: 'QA_SHA', label: 'الشمال' },
    { value: 'QA_RAY', label: 'الريان' },
    { value: 'QA_DAA', label: 'الضعاين' },
    { value: 'QA_UMS', label: 'أم صلال' },
  ],

  // ══════════════ الكويت ══════════════
  KW: [
    { value: 'KW_KUW', label: 'العاصمة' },
    { value: 'KW_HAW', label: 'حولي' },
    { value: 'KW_FAR', label: 'الفروانية' },
    { value: 'KW_JAH', label: 'الجهراء' },
    { value: 'KW_AHM', label: 'الأحمدي' },
    { value: 'KW_MUB', label: 'مبارك الكبير' },
  ],

  // ══════════════ البحرين ══════════════
  BH: [
    { value: 'BH_CAP', label: 'العاصمة' },
    { value: 'BH_MUH', label: 'المحرق' },
    { value: 'BH_NOR', label: 'الشمالية' },
    { value: 'BH_SOU', label: 'الجنوبية' },
  ],

  // ══════════════ اليمن ══════════════
  YE: [
    { value: 'YE_SAN', label: 'صنعاء' },
    { value: 'YE_ADE', label: 'عدن' },
    { value: 'YE_TAI', label: 'تعز' },
    { value: 'YE_HOD', label: 'الحديدة' },
    { value: 'YE_IBB', label: 'إب' },
    { value: 'YE_DHM', label: 'ذمار' },
    { value: 'YE_HAD', label: 'حضرموت' },
    { value: 'YE_MAR', label: 'مأرب' },
    { value: 'YE_SAA', label: 'صعدة' },
    { value: 'YE_AMR', label: 'عمران' },
    { value: 'YE_HAJ', label: 'حجة' },
    { value: 'YE_BAY', label: 'البيضاء' },
    { value: 'YE_LAH', label: 'لحج' },
    { value: 'YE_ABY', label: 'أبين' },
    { value: 'YE_SHB', label: 'شبوة' },
    { value: 'YE_MAH', label: 'المهرة' },
    { value: 'YE_DAL', label: 'الضالع' },
    { value: 'YE_RAY', label: 'ريمة' },
    { value: 'YE_SOC', label: 'سقطرى' },
    { value: 'YE_JOF', label: 'الجوف' },
    { value: 'YE_MHW', label: 'المحويت' },
  ],

  // ══════════════ العراق ══════════════
  IQ: [
    { value: 'IQ_BAG', label: 'بغداد' },
    { value: 'IQ_BAS', label: 'البصرة' },
    { value: 'IQ_NIN', label: 'نينوى' },
    { value: 'IQ_ERB', label: 'أربيل' },
    { value: 'IQ_SUL', label: 'السليمانية' },
    { value: 'IQ_NAJ', label: 'النجف' },
    { value: 'IQ_KAR', label: 'كربلاء' },
    { value: 'IQ_BAB', label: 'بابل' },
    { value: 'IQ_KIR', label: 'كركوك' },
    { value: 'IQ_DIY', label: 'ديالى' },
    { value: 'IQ_ANB', label: 'الأنبار' },
    { value: 'IQ_WAS', label: 'واسط' },
    { value: 'IQ_SAL', label: 'صلاح الدين' },
    { value: 'IQ_DHI', label: 'ذي قار' },
    { value: 'IQ_MIS', label: 'ميسان' },
    { value: 'IQ_MUT', label: 'المثنى' },
    { value: 'IQ_QAD', label: 'القادسية' },
    { value: 'IQ_DAH', label: 'دهوك' },
  ],

  // ══════════════ الأردن ══════════════
  JO: [
    { value: 'JO_AMM', label: 'عمّان' },
    { value: 'JO_IRB', label: 'إربد' },
    { value: 'JO_ZAR', label: 'الزرقاء' },
    { value: 'JO_BAL', label: 'البلقاء' },
    { value: 'JO_MAD', label: 'مادبا' },
    { value: 'JO_KAR', label: 'الكرك' },
    { value: 'JO_TAF', label: 'الطفيلة' },
    { value: 'JO_MAA', label: 'معان' },
    { value: 'JO_AQA', label: 'العقبة' },
    { value: 'JO_JAR', label: 'جرش' },
    { value: 'JO_AJL', label: 'عجلون' },
    { value: 'JO_MAF', label: 'المفرق' },
  ],

  // ══════════════ لبنان ══════════════
  LB: [
    { value: 'LB_BEI', label: 'بيروت' },
    { value: 'LB_JBL', label: 'جبل لبنان' },
    { value: 'LB_NOR', label: 'الشمال' },
    { value: 'LB_SOU', label: 'الجنوب' },
    { value: 'LB_BEK', label: 'البقاع' },
    { value: 'LB_NAB', label: 'النبطية' },
    { value: 'LB_AKK', label: 'عكار' },
    { value: 'LB_BAA', label: 'بعلبك الهرمل' },
  ],

  // ══════════════ سوريا ══════════════
  SY: [
    { value: 'SY_DAM', label: 'دمشق' },
    { value: 'SY_RDA', label: 'ريف دمشق' },
    { value: 'SY_ALE', label: 'حلب' },
    { value: 'SY_HOM', label: 'حمص' },
    { value: 'SY_HAM', label: 'حماة' },
    { value: 'SY_LAT', label: 'اللاذقية' },
    { value: 'SY_TAR', label: 'طرطوس' },
    { value: 'SY_IDL', label: 'إدلب' },
    { value: 'SY_RAQ', label: 'الرقة' },
    { value: 'SY_DEZ', label: 'دير الزور' },
    { value: 'SY_HAS', label: 'الحسكة' },
    { value: 'SY_DRA', label: 'درعا' },
    { value: 'SY_SWE', label: 'السويداء' },
    { value: 'SY_QUN', label: 'القنيطرة' },
  ],

  // ══════════════ فلسطين ══════════════
  PS: [
    { value: 'PS_JER', label: 'القدس' },
    { value: 'PS_RAM', label: 'رام الله والبيرة' },
    { value: 'PS_NAB', label: 'نابلس' },
    { value: 'PS_HEB', label: 'الخليل' },
    { value: 'PS_BET', label: 'بيت لحم' },
    { value: 'PS_JEN', label: 'جنين' },
    { value: 'PS_TUL', label: 'طولكرم' },
    { value: 'PS_QAL', label: 'قلقيلية' },
    { value: 'PS_SAL', label: 'سلفيت' },
    { value: 'PS_TUB', label: 'طوباس' },
    { value: 'PS_JER2', label: 'أريحا والأغوار' },
    { value: 'PS_GAZ', label: 'غزة' },
    { value: 'PS_KHY', label: 'خان يونس' },
    { value: 'PS_RAF', label: 'رفح' },
    { value: 'PS_DEI', label: 'دير البلح' },
    { value: 'PS_NOR', label: 'شمال غزة' },
  ],

  // ══════════════ مصر ══════════════
  EG: [
    { value: 'EG_CAI', label: 'القاهرة' },
    { value: 'EG_GIZ', label: 'الجيزة' },
    { value: 'EG_ALX', label: 'الإسكندرية' },
    { value: 'EG_QAL', label: 'القليوبية' },
    { value: 'EG_DAK', label: 'الدقهلية' },
    { value: 'EG_GHR', label: 'الغربية' },
    { value: 'EG_MNF', label: 'المنوفية' },
    { value: 'EG_SHR', label: 'الشرقية' },
    { value: 'EG_BHR', label: 'البحيرة' },
    { value: 'EG_KFS', label: 'كفر الشيخ' },
    { value: 'EG_DMT', label: 'دمياط' },
    { value: 'EG_PTS', label: 'بورسعيد' },
    { value: 'EG_ISM', label: 'الإسماعيلية' },
    { value: 'EG_SUZ', label: 'السويس' },
    { value: 'EG_FAY', label: 'الفيوم' },
    { value: 'EG_BNS', label: 'بني سويف' },
    { value: 'EG_MNY', label: 'المنيا' },
    { value: 'EG_ASY', label: 'أسيوط' },
    { value: 'EG_SOH', label: 'سوهاج' },
    { value: 'EG_QEN', label: 'قنا' },
    { value: 'EG_LUX', label: 'الأقصر' },
    { value: 'EG_ASW', label: 'أسوان' },
    { value: 'EG_RSS', label: 'البحر الأحمر' },
    { value: 'EG_NVL', label: 'الوادي الجديد' },
    { value: 'EG_MAT', label: 'مطروح' },
    { value: 'EG_NSN', label: 'شمال سيناء' },
    { value: 'EG_SSN', label: 'جنوب سيناء' },
  ],

  // ══════════════ السودان ══════════════
  SD: [
    { value: 'SD_KHA', label: 'الخرطوم' },
    { value: 'SD_GEZ', label: 'الجزيرة' },
    { value: 'SD_WNI', label: 'النيل الأبيض' },
    { value: 'SD_BNI', label: 'النيل الأزرق' },
    { value: 'SD_SEN', label: 'سنار' },
    { value: 'SD_NOR', label: 'الشمالية' },
    { value: 'SD_RNI', label: 'نهر النيل' },
    { value: 'SD_KAS', label: 'كسلا' },
    { value: 'SD_GAD', label: 'القضارف' },
    { value: 'SD_RED', label: 'البحر الأحمر' },
    { value: 'SD_NKO', label: 'شمال كردفان' },
    { value: 'SD_SKO', label: 'جنوب كردفان' },
    { value: 'SD_WKO', label: 'غرب كردفان' },
    { value: 'SD_NDA', label: 'شمال دارفور' },
    { value: 'SD_SDA', label: 'جنوب دارفور' },
    { value: 'SD_WDA', label: 'غرب دارفور' },
    { value: 'SD_EDA', label: 'شرق دارفور' },
    { value: 'SD_CDA', label: 'وسط دارفور' },
  ],

  // ══════════════ ليبيا ══════════════
  LY: [
    { value: 'LY_TRI', label: 'طرابلس' },
    { value: 'LY_BEN', label: 'بنغازي' },
    { value: 'LY_MIS', label: 'مصراتة' },
    { value: 'LY_ZAW', label: 'الزاوية' },
    { value: 'LY_ZLI', label: 'زليتن' },
    { value: 'LY_KHO', label: 'الخمس' },
    { value: 'LY_SIR', label: 'سرت' },
    { value: 'LY_SAB', label: 'سبها' },
    { value: 'LY_DER', label: 'درنة' },
    { value: 'LY_TOB', label: 'طبرق' },
  ],

  // ══════════════ تونس ══════════════
  TN: [
    { value: 'TN_TUN', label: 'تونس العاصمة' },
    { value: 'TN_ARI', label: 'أريانة' },
    { value: 'TN_BNA', label: 'بن عروس' },
    { value: 'TN_MAN', label: 'منوبة' },
    { value: 'TN_NAB', label: 'نابل' },
    { value: 'TN_ZAG', label: 'زغوان' },
    { value: 'TN_BIZ', label: 'بنزرت' },
    { value: 'TN_BAJ', label: 'باجة' },
    { value: 'TN_JEN', label: 'جندوبة' },
    { value: 'TN_KEF', label: 'الكاف' },
    { value: 'TN_SIL', label: 'سليانة' },
    { value: 'TN_SOU', label: 'سوسة' },
    { value: 'TN_MON', label: 'المنستير' },
    { value: 'TN_MAH', label: 'المهدية' },
    { value: 'TN_SFA', label: 'صفاقس' },
    { value: 'TN_KAI', label: 'القيروان' },
    { value: 'TN_KAS', label: 'القصرين' },
    { value: 'TN_SBZ', label: 'سيدي بوزيد' },
    { value: 'TN_GAF', label: 'قفصة' },
    { value: 'TN_TOZ', label: 'توزر' },
    { value: 'TN_KEB', label: 'قبلي' },
    { value: 'TN_GAB', label: 'قابس' },
    { value: 'TN_MED', label: 'مدنين' },
    { value: 'TN_TAT', label: 'تطاوين' },
  ],

  // ══════════════ الجزائر ══════════════
  DZ: [
    { value: 'DZ_ALG', label: 'الجزائر العاصمة' },
    { value: 'DZ_ORA', label: 'وهران' },
    { value: 'DZ_CON', label: 'قسنطينة' },
    { value: 'DZ_ANN', label: 'عنابة' },
    { value: 'DZ_BLI', label: 'البليدة' },
    { value: 'DZ_BAT', label: 'باتنة' },
    { value: 'DZ_SET', label: 'سطيف' },
    { value: 'DZ_SBA', label: 'سيدي بلعباس' },
    { value: 'DZ_BEJ', label: 'بجاية' },
    { value: 'DZ_TLE', label: 'تلمسان' },
    { value: 'DZ_BIS', label: 'بسكرة' },
    { value: 'DZ_TIA', label: 'تيارت' },
    { value: 'DZ_TIZ', label: 'تيزي وزو' },
    { value: 'DZ_MED', label: 'المدية' },
    { value: 'DZ_MSI', label: 'مسيلة' },
    { value: 'DZ_MOS', label: 'مستغانم' },
    { value: 'DZ_SKI', label: 'سكيكدة' },
    { value: 'DZ_CHL', label: 'الشلف' },
    { value: 'DZ_JIJ', label: 'جيجل' },
    { value: 'DZ_BOU', label: 'بومرداس' },
    { value: 'DZ_TIP', label: 'تيبازة' },
    { value: 'DZ_ADE', label: 'عين الدفلى' },
    { value: 'DZ_GHA', label: 'غرداية' },
    { value: 'DZ_OUG', label: 'ورقلة' },
    { value: 'DZ_BEC', label: 'بشار' },
    { value: 'DZ_TAM', label: 'تمنراست' },
    { value: 'DZ_ADR', label: 'أدرار' },
    { value: 'DZ_ELO', label: 'الوادي' },
  ],

  // ══════════════ المغرب ══════════════
  MA: [
    { value: 'MA_RBA', label: 'الرباط-سلا-القنيطرة' },
    { value: 'MA_CAS', label: 'الدار البيضاء-سطات' },
    { value: 'MA_FES', label: 'فاس-مكناس' },
    { value: 'MA_MAR', label: 'مراكش-آسفي' },
    { value: 'MA_TNG', label: 'طنجة-تطوان-الحسيمة' },
    { value: 'MA_ORI', label: 'الشرق' },
    { value: 'MA_BEN', label: 'بني ملال-خنيفرة' },
    { value: 'MA_DRA', label: 'درعة-تافيلالت' },
    { value: 'MA_SOU', label: 'سوس-ماسة' },
    { value: 'MA_GUE', label: 'كلميم-واد نون' },
    { value: 'MA_LAA', label: 'العيون-الساقية الحمراء' },
    { value: 'MA_DAK', label: 'الداخلة-وادي الذهب' },
  ],

  // ══════════════ موريتانيا ══════════════
  MR: [
    { value: 'MR_NKC', label: 'نواكشوط الغربية' },
    { value: 'MR_NKN', label: 'نواكشوط الشمالية' },
    { value: 'MR_NKS', label: 'نواكشوط الجنوبية' },
    { value: 'MR_NDB', label: 'نواذيبو' },
    { value: 'MR_TRA', label: 'الترارزة' },
    { value: 'MR_BRA', label: 'البراكنة' },
    { value: 'MR_GOR', label: 'كوركول' },
    { value: 'MR_ASS', label: 'لعصابة' },
    { value: 'MR_HOD', label: 'الحوض الشرقي' },
    { value: 'MR_HOG', label: 'الحوض الغربي' },
    { value: 'MR_ADR', label: 'أدرار' },
    { value: 'MR_TAG', label: 'تكانت' },
    { value: 'MR_GUI', label: 'كيدي ماغا' },
    { value: 'MR_TIR', label: 'تيرس زمور' },
    { value: 'MR_INS', label: 'إنشيري' },
  ],

  // ══════════════ الصومال ══════════════
  SO: [
    { value: 'SO_MOG', label: 'بنادر (مقديشو)' },
    { value: 'SO_HAR', label: 'هرجيسا' },
    { value: 'SO_GAR', label: 'غاروي' },
    { value: 'SO_KIS', label: 'كيسمايو' },
    { value: 'SO_BAI', label: 'بيدوا' },
    { value: 'SO_BOS', label: 'بوصاصو' },
    { value: 'SO_GAL', label: 'غالكعيو' },
    { value: 'SO_BER', label: 'بربرة' },
  ],

  // ══════════════ جيبوتي ══════════════
  DJ: [
    { value: 'DJ_DJI', label: 'جيبوتي' },
    { value: 'DJ_ALI', label: 'علي صبيح' },
    { value: 'DJ_DIC', label: 'دخيل' },
    { value: 'DJ_TAD', label: 'تاجورة' },
    { value: 'DJ_OBO', label: 'أوبوك' },
    { value: 'DJ_ART', label: 'عرتا' },
  ],

  // ══════════════ جزر القمر ══════════════
  KM: [
    { value: 'KM_NGZ', label: 'القمر الكبرى (نجازيجا)' },
    { value: 'KM_MWL', label: 'موالي (موهيلي)' },
    { value: 'KM_ANJ', label: 'أنجوان (نزواني)' },
  ],
};

// ─── Cities per Governorate ───
const cities: CityDataMap = {
  // ══════════════ عُمان — المدن ══════════════
  OM: {
    OM_MUS: [
      { value: 'السيب', label: 'السيب' },
      { value: 'بوشر', label: 'بوشر' },
      { value: 'مطرح', label: 'مطرح' },
      { value: 'العامرات', label: 'العامرات' },
      { value: 'قريات', label: 'قريات' },
      { value: 'مسقط', label: 'مسقط' },
    ],
    OM_DHO: [
      { value: 'صلالة', label: 'صلالة' },
      { value: 'طاقة', label: 'طاقة' },
      { value: 'مرباط', label: 'مرباط' },
      { value: 'ثمريت', label: 'ثمريت' },
      { value: 'رخيوت', label: 'رخيوت' },
      { value: 'ضلكوت', label: 'ضلكوت' },
      { value: 'سدح', label: 'سدح' },
      { value: 'شليم وجزر الحلانيات', label: 'شليم وجزر الحلانيات' },
      { value: 'المزيونة', label: 'المزيونة' },
      { value: 'مقشن', label: 'مقشن' },
    ],
    OM_DAK: [
      { value: 'نزوى', label: 'نزوى' },
      { value: 'بهلاء', label: 'بهلاء' },
      { value: 'سمائل', label: 'سمائل' },
      { value: 'أدم', label: 'أدم' },
      { value: 'الحمراء', label: 'الحمراء' },
      { value: 'منح', label: 'منح' },
      { value: 'إزكي', label: 'إزكي' },
      { value: 'بدبد', label: 'بدبد' },
    ],
    OM_BAN: [
      { value: 'صحار', label: 'صحار' },
      { value: 'شناص', label: 'شناص' },
      { value: 'لوى', label: 'لوى' },
      { value: 'صحم', label: 'صحم' },
      { value: 'الخابورة', label: 'الخابورة' },
      { value: 'السويق', label: 'السويق' },
    ],
    OM_BAS: [
      { value: 'الرستاق', label: 'الرستاق' },
      { value: 'العوابي', label: 'العوابي' },
      { value: 'نخل', label: 'نخل' },
      { value: 'وادي المعاول', label: 'وادي المعاول' },
      { value: 'بركاء', label: 'بركاء' },
      { value: 'المصنعة', label: 'المصنعة' },
    ],
    OM_SHN: [
      { value: 'إبراء', label: 'إبراء' },
      { value: 'المضيبي', label: 'المضيبي' },
      { value: 'بدية', label: 'بدية' },
      { value: 'القابل', label: 'القابل' },
      { value: 'وادي بني خالد', label: 'وادي بني خالد' },
      { value: 'دماء والطائيين', label: 'دماء والطائيين' },
    ],
    OM_SHS: [
      { value: 'صور', label: 'صور' },
      { value: 'جعلان بني بو حسن', label: 'جعلان بني بو حسن' },
      { value: 'جعلان بني بو علي', label: 'جعلان بني بو علي' },
      { value: 'الكامل والوافي', label: 'الكامل والوافي' },
      { value: 'مصيرة', label: 'مصيرة' },
    ],
    OM_DHA: [
      { value: 'عبري', label: 'عبري' },
      { value: 'ينقل', label: 'ينقل' },
      { value: 'ضنك', label: 'ضنك' },
    ],
    OM_BUR: [
      { value: 'البريمي', label: 'البريمي' },
      { value: 'محضة', label: 'محضة' },
      { value: 'السنينة', label: 'السنينة' },
    ],
    OM_MSN: [
      { value: 'خصب', label: 'خصب' },
      { value: 'بخاء', label: 'بخاء' },
      { value: 'دبا', label: 'دبا' },
      { value: 'مدحاء', label: 'مدحاء' },
    ],
    OM_WUS: [
      { value: 'هيماء', label: 'هيماء' },
      { value: 'محوت', label: 'محوت' },
      { value: 'الدقم', label: 'الدقم' },
      { value: 'الجازر', label: 'الجازر' },
    ],
  },

  // ══════════════ السعودية — المدن ══════════════
  SA: {
    SA_RIY: [
      { value: 'الرياض', label: 'الرياض' },
      { value: 'الخرج', label: 'الخرج' },
      { value: 'الدرعية', label: 'الدرعية' },
      { value: 'المجمعة', label: 'المجمعة' },
      { value: 'الدوادمي', label: 'الدوادمي' },
      { value: 'وادي الدواسر', label: 'وادي الدواسر' },
      { value: 'الأفلاج', label: 'الأفلاج' },
      { value: 'حوطة بني تميم', label: 'حوطة بني تميم' },
      { value: 'الزلفي', label: 'الزلفي' },
      { value: 'شقراء', label: 'شقراء' },
    ],
    SA_MAK: [
      { value: 'مكة المكرمة', label: 'مكة المكرمة' },
      { value: 'جدة', label: 'جدة' },
      { value: 'الطائف', label: 'الطائف' },
      { value: 'رابغ', label: 'رابغ' },
      { value: 'القنفذة', label: 'القنفذة' },
      { value: 'الليث', label: 'الليث' },
      { value: 'تربة', label: 'تربة' },
      { value: 'الكامل', label: 'الكامل' },
      { value: 'خليص', label: 'خليص' },
    ],
    SA_MAD: [
      { value: 'المدينة المنورة', label: 'المدينة المنورة' },
      { value: 'ينبع', label: 'ينبع' },
      { value: 'العلا', label: 'العلا' },
      { value: 'بدر', label: 'بدر' },
      { value: 'خيبر', label: 'خيبر' },
      { value: 'المهد', label: 'المهد' },
    ],
    SA_QAS: [
      { value: 'بريدة', label: 'بريدة' },
      { value: 'عنيزة', label: 'عنيزة' },
      { value: 'الرس', label: 'الرس' },
      { value: 'البكيرية', label: 'البكيرية' },
      { value: 'المذنب', label: 'المذنب' },
    ],
    SA_ESH: [
      { value: 'الدمام', label: 'الدمام' },
      { value: 'الأحساء', label: 'الأحساء' },
      { value: 'الجبيل', label: 'الجبيل' },
      { value: 'الظهران', label: 'الظهران' },
      { value: 'الخبر', label: 'الخبر' },
      { value: 'القطيف', label: 'القطيف' },
      { value: 'حفر الباطن', label: 'حفر الباطن' },
      { value: 'رأس تنورة', label: 'رأس تنورة' },
    ],
    SA_ASI: [
      { value: 'أبها', label: 'أبها' },
      { value: 'خميس مشيط', label: 'خميس مشيط' },
      { value: 'بيشة', label: 'بيشة' },
      { value: 'النماص', label: 'النماص' },
      { value: 'محايل عسير', label: 'محايل عسير' },
      { value: 'أحد رفيدة', label: 'أحد رفيدة' },
    ],
    SA_TAB: [
      { value: 'تبوك', label: 'تبوك' },
      { value: 'الوجه', label: 'الوجه' },
      { value: 'ضبا', label: 'ضبا' },
      { value: 'تيماء', label: 'تيماء' },
      { value: 'أملج', label: 'أملج' },
    ],
    SA_HAI: [
      { value: 'حائل', label: 'حائل' },
      { value: 'بقعاء', label: 'بقعاء' },
      { value: 'الغزالة', label: 'الغزالة' },
      { value: 'الشملي', label: 'الشملي' },
    ],
    SA_SHA: [
      { value: 'عرعر', label: 'عرعر' },
      { value: 'رفحاء', label: 'رفحاء' },
      { value: 'طريف', label: 'طريف' },
    ],
    SA_JAZ: [
      { value: 'جازان', label: 'جازان' },
      { value: 'صبيا', label: 'صبيا' },
      { value: 'أبو عريش', label: 'أبو عريش' },
      { value: 'صامطة', label: 'صامطة' },
    ],
    SA_NAJ: [
      { value: 'نجران', label: 'نجران' },
      { value: 'شرورة', label: 'شرورة' },
      { value: 'حبونا', label: 'حبونا' },
    ],
    SA_BAH: [
      { value: 'الباحة', label: 'الباحة' },
      { value: 'بلجرشي', label: 'بلجرشي' },
      { value: 'المندق', label: 'المندق' },
    ],
    SA_JOF: [
      { value: 'سكاكا', label: 'سكاكا' },
      { value: 'دومة الجندل', label: 'دومة الجندل' },
      { value: 'القريات', label: 'القريات' },
      { value: 'طبرجل', label: 'طبرجل' },
    ],
  },

  // ══════════════ الإمارات — المدن ══════════════
  AE: {
    AE_AUH: [
      { value: 'أبوظبي', label: 'أبوظبي' },
      { value: 'العين', label: 'العين' },
      { value: 'مدينة زايد', label: 'مدينة زايد' },
      { value: 'الرويس', label: 'الرويس' },
      { value: 'المرفأ', label: 'المرفأ' },
    ],
    AE_DXB: [
      { value: 'دبي', label: 'دبي' },
      { value: 'جبل علي', label: 'جبل علي' },
      { value: 'حتا', label: 'حتا' },
    ],
    AE_SHJ: [
      { value: 'الشارقة', label: 'الشارقة' },
      { value: 'خورفكان', label: 'خورفكان' },
      { value: 'كلباء', label: 'كلباء' },
      { value: 'دبا الحصن', label: 'دبا الحصن' },
    ],
    AE_AJM: [
      { value: 'عجمان', label: 'عجمان' },
      { value: 'المنامة', label: 'المنامة' },
      { value: 'مصفوت', label: 'مصفوت' },
    ],
    AE_UAQ: [
      { value: 'أم القيوين', label: 'أم القيوين' },
      { value: 'فلج المعلا', label: 'فلج المعلا' },
    ],
    AE_RAK: [
      { value: 'رأس الخيمة', label: 'رأس الخيمة' },
      { value: 'الجزيرة الحمراء', label: 'الجزيرة الحمراء' },
      { value: 'خت', label: 'خت' },
      { value: 'الرمس', label: 'الرمس' },
    ],
    AE_FUJ: [
      { value: 'الفجيرة', label: 'الفجيرة' },
      { value: 'دبا الفجيرة', label: 'دبا الفجيرة' },
      { value: 'مربح', label: 'مربح' },
    ],
  },

  // ══════════════ قطر — المدن ══════════════
  QA: {
    QA_DOH: [
      { value: 'الدوحة', label: 'الدوحة' },
      { value: 'لوسيل', label: 'لوسيل' },
      { value: 'الدفنة', label: 'الدفنة' },
      { value: 'السد', label: 'السد' },
    ],
    QA_WAK: [
      { value: 'الوكرة', label: 'الوكرة' },
      { value: 'مسيعيد', label: 'مسيعيد' },
    ],
    QA_KHO: [
      { value: 'الخور', label: 'الخور' },
      { value: 'الذخيرة', label: 'الذخيرة' },
    ],
    QA_SHA: [
      { value: 'مدينة الشمال', label: 'مدينة الشمال' },
    ],
    QA_RAY: [
      { value: 'الريان', label: 'الريان' },
      { value: 'المعيذر', label: 'المعيذر' },
    ],
    QA_DAA: [
      { value: 'الضعاين', label: 'الضعاين' },
      { value: 'أم صلال', label: 'أم صلال' },
    ],
    QA_UMS: [
      { value: 'أم صلال محمد', label: 'أم صلال محمد' },
      { value: 'أم صلال علي', label: 'أم صلال علي' },
    ],
  },

  // ══════════════ الكويت — المدن ══════════════
  KW: {
    KW_KUW: [
      { value: 'الكويت', label: 'مدينة الكويت' },
      { value: 'الشرق', label: 'الشرق' },
      { value: 'المرقاب', label: 'المرقاب' },
      { value: 'دسمان', label: 'دسمان' },
    ],
    KW_HAW: [
      { value: 'حولي', label: 'حولي' },
      { value: 'السالمية', label: 'السالمية' },
      { value: 'الجابرية', label: 'الجابرية' },
      { value: 'مشرف', label: 'مشرف' },
    ],
    KW_FAR: [
      { value: 'الفروانية', label: 'الفروانية' },
      { value: 'خيطان', label: 'خيطان' },
      { value: 'جليب الشيوخ', label: 'جليب الشيوخ' },
    ],
    KW_JAH: [
      { value: 'الجهراء', label: 'الجهراء' },
      { value: 'الصليبية', label: 'الصليبية' },
    ],
    KW_AHM: [
      { value: 'الأحمدي', label: 'الأحمدي' },
      { value: 'الفحيحيل', label: 'الفحيحيل' },
      { value: 'المنقف', label: 'المنقف' },
      { value: 'الفنطاس', label: 'الفنطاس' },
    ],
    KW_MUB: [
      { value: 'مبارك الكبير', label: 'مبارك الكبير' },
      { value: 'صباح السالم', label: 'صباح السالم' },
      { value: 'القرين', label: 'القرين' },
    ],
  },

  // ══════════════ مصر — المدن (أهم المدن) ══════════════
  EG: {
    EG_CAI: [
      { value: 'مدينة نصر', label: 'مدينة نصر' },
      { value: 'مصر الجديدة', label: 'مصر الجديدة' },
      { value: 'المعادي', label: 'المعادي' },
      { value: 'الزمالك', label: 'الزمالك' },
      { value: 'وسط البلد', label: 'وسط البلد' },
      { value: 'المقطم', label: 'المقطم' },
      { value: 'التجمع الخامس', label: 'التجمع الخامس' },
      { value: 'القاهرة الجديدة', label: 'القاهرة الجديدة' },
      { value: 'العباسية', label: 'العباسية' },
      { value: 'شبرا', label: 'شبرا' },
    ],
    EG_GIZ: [
      { value: 'الجيزة', label: 'الجيزة' },
      { value: 'السادس من أكتوبر', label: 'السادس من أكتوبر' },
      { value: 'الشيخ زايد', label: 'الشيخ زايد' },
      { value: 'الهرم', label: 'الهرم' },
      { value: 'فيصل', label: 'فيصل' },
      { value: 'الدقي', label: 'الدقي' },
      { value: 'المهندسين', label: 'المهندسين' },
      { value: 'العجوزة', label: 'العجوزة' },
    ],
    EG_ALX: [
      { value: 'الإسكندرية', label: 'وسط الإسكندرية' },
      { value: 'العجمي', label: 'العجمي' },
      { value: 'المنتزه', label: 'المنتزه' },
      { value: 'سيدي بشر', label: 'سيدي بشر' },
      { value: 'سموحة', label: 'سموحة' },
      { value: 'ستانلي', label: 'ستانلي' },
      { value: 'برج العرب', label: 'برج العرب' },
    ],
    EG_QAL: [
      { value: 'بنها', label: 'بنها' },
      { value: 'شبرا الخيمة', label: 'شبرا الخيمة' },
      { value: 'القناطر الخيرية', label: 'القناطر الخيرية' },
      { value: 'العبور', label: 'العبور' },
    ],
    EG_DAK: [
      { value: 'المنصورة', label: 'المنصورة' },
      { value: 'طلخا', label: 'طلخا' },
      { value: 'ميت غمر', label: 'ميت غمر' },
      { value: 'دكرنس', label: 'دكرنس' },
    ],
    EG_GHR: [
      { value: 'طنطا', label: 'طنطا' },
      { value: 'المحلة الكبرى', label: 'المحلة الكبرى' },
      { value: 'كفر الزيات', label: 'كفر الزيات' },
    ],
    EG_MNF: [
      { value: 'شبين الكوم', label: 'شبين الكوم' },
      { value: 'منوف', label: 'منوف' },
      { value: 'أشمون', label: 'أشمون' },
    ],
    EG_SHR: [
      { value: 'الزقازيق', label: 'الزقازيق' },
      { value: 'العاشر من رمضان', label: 'العاشر من رمضان' },
      { value: 'بلبيس', label: 'بلبيس' },
    ],
    EG_BHR: [
      { value: 'دمنهور', label: 'دمنهور' },
      { value: 'كفر الدوار', label: 'كفر الدوار' },
      { value: 'رشيد', label: 'رشيد' },
    ],
    EG_KFS: [{ value: 'كفر الشيخ', label: 'كفر الشيخ' }, { value: 'دسوق', label: 'دسوق' }],
    EG_DMT: [{ value: 'دمياط', label: 'دمياط' }, { value: 'دمياط الجديدة', label: 'دمياط الجديدة' }],
    EG_PTS: [{ value: 'بورسعيد', label: 'بورسعيد' }],
    EG_ISM: [{ value: 'الإسماعيلية', label: 'الإسماعيلية' }],
    EG_SUZ: [{ value: 'السويس', label: 'السويس' }],
    EG_FAY: [{ value: 'الفيوم', label: 'الفيوم' }, { value: 'إطسا', label: 'إطسا' }],
    EG_BNS: [{ value: 'بني سويف', label: 'بني سويف' }],
    EG_MNY: [{ value: 'المنيا', label: 'المنيا' }, { value: 'ملوي', label: 'ملوي' }, { value: 'سمالوط', label: 'سمالوط' }],
    EG_ASY: [{ value: 'أسيوط', label: 'أسيوط' }],
    EG_SOH: [{ value: 'سوهاج', label: 'سوهاج' }, { value: 'أخميم', label: 'أخميم' }],
    EG_QEN: [{ value: 'قنا', label: 'قنا' }, { value: 'نجع حمادي', label: 'نجع حمادي' }],
    EG_LUX: [{ value: 'الأقصر', label: 'الأقصر' }],
    EG_ASW: [{ value: 'أسوان', label: 'أسوان' }, { value: 'كوم أمبو', label: 'كوم أمبو' }],
    EG_RSS: [{ value: 'الغردقة', label: 'الغردقة' }, { value: 'سفاجا', label: 'سفاجا' }, { value: 'مرسى علم', label: 'مرسى علم' }],
    EG_NVL: [{ value: 'الخارجة', label: 'الخارجة' }],
    EG_MAT: [{ value: 'مرسى مطروح', label: 'مرسى مطروح' }, { value: 'سيوة', label: 'سيوة' }],
    EG_NSN: [{ value: 'العريش', label: 'العريش' }],
    EG_SSN: [{ value: 'شرم الشيخ', label: 'شرم الشيخ' }, { value: 'دهب', label: 'دهب' }, { value: 'طابا', label: 'طابا' }],
  },
};

// ─── Helper Functions ───

export function getCountries(): LocationOption[] {
  return countries;
}

export function getGovernorates(countryCode: string): LocationOption[] {
  return governorates[countryCode] ?? [];
}

export function getCities(countryCode: string, governorateCode: string): LocationOption[] {
  return cities[countryCode]?.[governorateCode] ?? [];
}

export function getCountryLabel(code: string): string {
  return countries.find(c => c.value === code)?.label ?? code;
}

export function getGovernorateLabel(countryCode: string, govCode: string): string {
  return governorates[countryCode]?.find(g => g.value === govCode)?.label ?? govCode;
}

export function getCityLabel(countryCode: string, govCode: string, cityValue: string): string {
  return cities[countryCode]?.[govCode]?.find(c => c.value === cityValue)?.label ?? cityValue;
}
