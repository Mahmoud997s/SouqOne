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

// ─── English Labels ───
const EN: Record<string, string> = {
  // Countries
  OM: 'Oman', SA: 'Saudi Arabia', AE: 'UAE', QA: 'Qatar', KW: 'Kuwait', BH: 'Bahrain',
  YE: 'Yemen', IQ: 'Iraq', JO: 'Jordan', LB: 'Lebanon', SY: 'Syria', PS: 'Palestine',
  EG: 'Egypt', SD: 'Sudan', LY: 'Libya', TN: 'Tunisia', DZ: 'Algeria', MA: 'Morocco',
  MR: 'Mauritania', SO: 'Somalia', DJ: 'Djibouti', KM: 'Comoros',

  // ── Oman Governorates
  OM_MUS: 'Muscat', OM_DHO: 'Dhofar', OM_DAK: 'Ad Dakhiliyah', OM_BAN: 'North Al Batinah',
  OM_BAS: 'South Al Batinah', OM_SHN: 'North Ash Sharqiyah', OM_SHS: 'South Ash Sharqiyah',
  OM_DHA: 'Ad Dhahirah', OM_BUR: 'Al Buraimi', OM_MSN: 'Musandam', OM_WUS: 'Al Wusta',

  // ── Saudi Governorates
  SA_RIY: 'Riyadh', SA_MAK: 'Makkah', SA_MAD: 'Madinah', SA_QAS: 'Al Qassim',
  SA_ESH: 'Eastern Province', SA_ASI: 'Asir', SA_TAB: 'Tabuk', SA_HAI: 'Hail',
  SA_SHA: 'Northern Borders', SA_JAZ: 'Jazan', SA_NAJ: 'Najran', SA_BAH: 'Al Bahah',
  SA_JOF: 'Al Jawf',

  // ── UAE Governorates
  AE_AUH: 'Abu Dhabi', AE_DXB: 'Dubai', AE_SHJ: 'Sharjah', AE_AJM: 'Ajman',
  AE_UAQ: 'Umm Al Quwain', AE_RAK: 'Ras Al Khaimah', AE_FUJ: 'Fujairah',

  // ── Qatar Governorates
  QA_DOH: 'Doha', QA_WAK: 'Al Wakrah', QA_KHO: 'Al Khor', QA_SHA: 'Al Shamal',
  QA_RAY: 'Al Rayyan', QA_DAA: 'Al Daayen', QA_UMS: 'Umm Salal',

  // ── Kuwait Governorates
  KW_KUW: 'Capital', KW_HAW: 'Hawalli', KW_FAR: 'Al Farwaniyah',
  KW_JAH: 'Al Jahra', KW_AHM: 'Al Ahmadi', KW_MUB: 'Mubarak Al Kabeer',

  // ── Bahrain Governorates
  BH_CAP: 'Capital', BH_MUH: 'Muharraq', BH_NOR: 'Northern', BH_SOU: 'Southern',

  // ── Yemen Governorates
  YE_SAN: "Sana'a", YE_ADE: 'Aden', YE_TAI: 'Taiz', YE_HOD: 'Hodeidah', YE_IBB: 'Ibb',
  YE_DHM: 'Dhamar', YE_HAD: 'Hadhramaut', YE_MAR: 'Marib', YE_SAA: 'Saada',
  YE_AMR: 'Amran', YE_HAJ: 'Hajjah', YE_BAY: 'Al Bayda', YE_LAH: 'Lahij',
  YE_ABY: 'Abyan', YE_SHB: 'Shabwah', YE_MAH: 'Al Mahrah', YE_DAL: 'Al Dhale',
  YE_RAY: 'Raymah', YE_SOC: 'Socotra', YE_JOF: 'Al Jawf', YE_MHW: 'Al Mahwit',

  // ── Iraq Governorates
  IQ_BAG: 'Baghdad', IQ_BAS: 'Basra', IQ_NIN: 'Nineveh', IQ_ERB: 'Erbil',
  IQ_SUL: 'Sulaymaniyah', IQ_NAJ: 'Najaf', IQ_KAR: 'Karbala', IQ_BAB: 'Babylon',
  IQ_KIR: 'Kirkuk', IQ_DIY: 'Diyala', IQ_ANB: 'Anbar', IQ_WAS: 'Wasit',
  IQ_SAL: 'Saladin', IQ_DHI: 'Dhi Qar', IQ_MIS: 'Maysan', IQ_MUT: 'Muthanna',
  IQ_QAD: 'Al Qadisiyyah', IQ_DAH: 'Duhok',

  // ── Jordan Governorates
  JO_AMM: 'Amman', JO_IRB: 'Irbid', JO_ZAR: 'Zarqa', JO_BAL: 'Balqa',
  JO_MAD: 'Madaba', JO_KAR: 'Karak', JO_TAF: 'Tafilah', JO_MAA: "Ma'an",
  JO_AQA: 'Aqaba', JO_JAR: 'Jerash', JO_AJL: 'Ajloun', JO_MAF: 'Mafraq',

  // ── Lebanon Governorates
  LB_BEI: 'Beirut', LB_JBL: 'Mount Lebanon', LB_NOR: 'North', LB_SOU: 'South',
  LB_BEK: 'Beqaa', LB_NAB: 'Nabatieh', LB_AKK: 'Akkar', LB_BAA: 'Baalbek-Hermel',

  // ── Syria Governorates
  SY_DAM: 'Damascus', SY_RDA: 'Rif Dimashq', SY_ALE: 'Aleppo', SY_HOM: 'Homs',
  SY_HAM: 'Hama', SY_LAT: 'Latakia', SY_TAR: 'Tartus', SY_IDL: 'Idlib',
  SY_RAQ: 'Raqqa', SY_DEZ: 'Deir ez-Zor', SY_HAS: 'Hasakah', SY_DRA: 'Daraa',
  SY_SWE: 'Suwayda', SY_QUN: 'Quneitra',

  // ── Palestine Governorates
  PS_JER: 'Jerusalem', PS_RAM: 'Ramallah & Al-Bireh', PS_NAB: 'Nablus', PS_HEB: 'Hebron',
  PS_BET: 'Bethlehem', PS_JEN: 'Jenin', PS_TUL: 'Tulkarm', PS_QAL: 'Qalqilya',
  PS_SAL: 'Salfit', PS_TUB: 'Tubas', PS_JER2: 'Jericho & Al Aghwar', PS_GAZ: 'Gaza',
  PS_KHY: 'Khan Yunis', PS_RAF: 'Rafah', PS_DEI: 'Deir Al-Balah', PS_NOR: 'North Gaza',

  // ── Egypt Governorates
  EG_CAI: 'Cairo', EG_GIZ: 'Giza', EG_ALX: 'Alexandria', EG_QAL: 'Qalyubia',
  EG_DAK: 'Dakahlia', EG_GHR: 'Gharbia', EG_MNF: 'Menoufia', EG_SHR: 'Sharqia',
  EG_BHR: 'Beheira', EG_KFS: 'Kafr El Sheikh', EG_DMT: 'Damietta', EG_PTS: 'Port Said',
  EG_ISM: 'Ismailia', EG_SUZ: 'Suez', EG_FAY: 'Faiyum', EG_BNS: 'Beni Suef',
  EG_MNY: 'Minya', EG_ASY: 'Asyut', EG_SOH: 'Sohag', EG_QEN: 'Qena',
  EG_LUX: 'Luxor', EG_ASW: 'Aswan', EG_RSS: 'Red Sea', EG_NVL: 'New Valley',
  EG_MAT: 'Matrouh', EG_NSN: 'North Sinai', EG_SSN: 'South Sinai',

  // ── Sudan Governorates
  SD_KHA: 'Khartoum', SD_GEZ: 'Gezira', SD_WNI: 'White Nile', SD_BNI: 'Blue Nile',
  SD_SEN: 'Sennar', SD_NOR: 'Northern', SD_RNI: 'River Nile', SD_KAS: 'Kassala',
  SD_GAD: 'Gedaref', SD_RED: 'Red Sea', SD_NKO: 'North Kordofan', SD_SKO: 'South Kordofan',
  SD_WKO: 'West Kordofan', SD_NDA: 'North Darfur', SD_SDA: 'South Darfur',
  SD_WDA: 'West Darfur', SD_EDA: 'East Darfur', SD_CDA: 'Central Darfur',

  // ── Libya Governorates
  LY_TRI: 'Tripoli', LY_BEN: 'Benghazi', LY_MIS: 'Misrata', LY_ZAW: 'Zawiya',
  LY_ZLI: 'Zliten', LY_KHO: 'Khoms', LY_SIR: 'Sirte', LY_SAB: 'Sabha',
  LY_DER: 'Derna', LY_TOB: 'Tobruk',

  // ── Tunisia Governorates
  TN_TUN: 'Tunis', TN_ARI: 'Ariana', TN_BNA: 'Ben Arous', TN_MAN: 'Manouba',
  TN_NAB: 'Nabeul', TN_ZAG: 'Zaghouan', TN_BIZ: 'Bizerte', TN_BAJ: 'Beja',
  TN_JEN: 'Jendouba', TN_KEF: 'El Kef', TN_SIL: 'Siliana', TN_SOU: 'Sousse',
  TN_MON: 'Monastir', TN_MAH: 'Mahdia', TN_SFA: 'Sfax', TN_KAI: 'Kairouan',
  TN_KAS: 'Kasserine', TN_SBZ: 'Sidi Bouzid', TN_GAF: 'Gafsa', TN_TOZ: 'Tozeur',
  TN_KEB: 'Kebili', TN_GAB: 'Gabes', TN_MED: 'Medenine', TN_TAT: 'Tataouine',

  // ── Algeria Governorates
  DZ_ALG: 'Algiers', DZ_ORA: 'Oran', DZ_CON: 'Constantine', DZ_ANN: 'Annaba',
  DZ_BLI: 'Blida', DZ_BAT: 'Batna', DZ_SET: 'Setif', DZ_SBA: 'Sidi Bel Abbes',
  DZ_BEJ: 'Bejaia', DZ_TLE: 'Tlemcen', DZ_BIS: 'Biskra', DZ_TIA: 'Tiaret',
  DZ_TIZ: 'Tizi Ouzou', DZ_MED: 'Medea', DZ_MSI: "M'sila", DZ_MOS: 'Mostaganem',
  DZ_SKI: 'Skikda', DZ_CHL: 'Chlef', DZ_JIJ: 'Jijel', DZ_BOU: 'Boumerdes',
  DZ_TIP: 'Tipaza', DZ_ADE: 'Ain Defla', DZ_GHA: 'Ghardaia', DZ_OUG: 'Ouargla',
  DZ_BEC: 'Bechar', DZ_TAM: 'Tamanrasset', DZ_ADR: 'Adrar', DZ_ELO: 'El Oued',

  // ── Morocco Governorates
  MA_RBA: 'Rabat-Sale-Kenitra', MA_CAS: 'Casablanca-Settat', MA_FES: 'Fez-Meknes',
  MA_MAR: 'Marrakech-Safi', MA_TNG: 'Tangier-Tetouan-Al Hoceima', MA_ORI: 'Oriental',
  MA_BEN: 'Beni Mellal-Khenifra', MA_DRA: 'Draa-Tafilalet', MA_SOU: 'Souss-Massa',
  MA_GUE: 'Guelmim-Oued Noun', MA_LAA: 'Laayoune-Sakia El Hamra', MA_DAK: 'Dakhla-Oued Ed Dahab',

  // ── Mauritania Governorates
  MR_NKC: 'Nouakchott West', MR_NKN: 'Nouakchott North', MR_NKS: 'Nouakchott South',
  MR_NDB: 'Nouadhibou', MR_TRA: 'Trarza', MR_BRA: 'Brakna', MR_GOR: 'Gorgol',
  MR_ASS: 'Assaba', MR_HOD: 'Hodh Ech Chargui', MR_HOG: 'Hodh El Gharbi',
  MR_ADR: 'Adrar', MR_TAG: 'Tagant', MR_GUI: 'Guidimaka', MR_TIR: 'Tiris Zemmour',
  MR_INS: 'Inchiri',

  // ── Somalia Governorates
  SO_MOG: 'Banaadir (Mogadishu)', SO_HAR: 'Hargeisa', SO_GAR: 'Garowe',
  SO_KIS: 'Kismayo', SO_BAI: 'Baidoa', SO_BOS: 'Bosaso', SO_GAL: 'Galkayo',
  SO_BER: 'Berbera',

  // ── Djibouti Governorates
  DJ_DJI: 'Djibouti', DJ_ALI: 'Ali Sabieh', DJ_DIC: 'Dikhil', DJ_TAD: 'Tadjoura',
  DJ_OBO: 'Obock', DJ_ART: 'Arta',

  // ── Comoros Governorates
  KM_NGZ: 'Grande Comore (Ngazidja)', KM_MWL: 'Moheli (Mwali)', KM_ANJ: 'Anjouan (Nzwani)',

  // ═══ Cities ═══

  // ── Oman Cities
  'السيب': 'Seeb', 'بوشر': 'Bousher', 'مطرح': 'Muttrah', 'العامرات': 'Al Amerat',
  'قريات': 'Quriyat', 'مسقط': 'Muscat',
  'صلالة': 'Salalah', 'طاقة': 'Taqah', 'مرباط': 'Mirbat', 'ثمريت': 'Thumrait',
  'رخيوت': 'Rakhyut', 'ضلكوت': 'Dalkut', 'سدح': 'Sadah',
  'شليم وجزر الحلانيات': 'Shalim & Hallaniyat Islands', 'المزيونة': 'Al Mazyunah', 'مقشن': 'Muqshin',
  'نزوى': 'Nizwa', 'بهلاء': 'Bahla', 'سمائل': 'Samail', 'أدم': 'Adam',
  'الحمراء': 'Al Hamra', 'منح': 'Manah', 'إزكي': 'Izki', 'بدبد': 'Bidbid',
  'صحار': 'Sohar', 'شناص': 'Shinas', 'لوى': 'Liwa', 'صحم': 'Saham',
  'الخابورة': 'Al Khaburah', 'السويق': 'As Suwaiq',
  'الرستاق': 'Rustaq', 'العوابي': 'Al Awabi', 'نخل': 'Nakhal',
  'وادي المعاول': 'Wadi Al Maawil', 'بركاء': 'Barka', 'المصنعة': 'Al Musannah',
  'إبراء': 'Ibra', 'المضيبي': 'Al Mudhaibi', 'بدية': 'Bidiyah', 'القابل': 'Al Qabil',
  'وادي بني خالد': 'Wadi Bani Khalid', 'دماء والطائيين': 'Dima Wa At Taiyyin',
  'صور': 'Sur', 'جعلان بني بو حسن': 'Jalan Bani Bu Hassan',
  'جعلان بني بو علي': 'Jalan Bani Bu Ali', 'الكامل والوافي': 'Al Kamil Wal Wafi',
  'مصيرة': 'Masirah', 'عبري': 'Ibri', 'ينقل': 'Yanqul', 'ضنك': 'Dhank',
  'البريمي': 'Al Buraimi', 'محضة': 'Mahdha', 'السنينة': 'As Sunaynah',
  'خصب': 'Khasab', 'بخاء': 'Bukha', 'دبا': 'Dibba', 'مدحاء': 'Madha',
  'هيماء': 'Haima', 'محوت': 'Mahout', 'الدقم': 'Duqm', 'الجازر': 'Al Jazer',

  // ── Saudi Cities
  'الرياض': 'Riyadh', 'الخرج': 'Al Kharj', 'الدرعية': 'Diriyah', 'المجمعة': 'Al Majmaah',
  'الدوادمي': 'Ad Dawadimi', 'وادي الدواسر': 'Wadi ad-Dawasir', 'الأفلاج': 'Al Aflaj',
  'حوطة بني تميم': 'Howtat Bani Tamim', 'الزلفي': 'Az Zulfi', 'شقراء': 'Shaqra',
  'مكة المكرمة': 'Makkah', 'جدة': 'Jeddah', 'الطائف': 'Taif', 'رابغ': 'Rabigh',
  'القنفذة': 'Al Qunfudhah', 'الليث': 'Al Lith', 'تربة': 'Turbah',
  'الكامل': 'Al Kamil', 'خليص': 'Khulays',
  'المدينة المنورة': 'Madinah', 'ينبع': 'Yanbu', 'العلا': 'Al Ula',
  'بدر': 'Badr', 'خيبر': 'Khaybar', 'المهد': 'Al Mahd',
  'بريدة': 'Buraydah', 'عنيزة': 'Unayzah', 'الرس': 'Ar Rass',
  'البكيرية': 'Al Bukayriyah', 'المذنب': 'Al Mithnab',
  'الدمام': 'Dammam', 'الأحساء': 'Al Ahsa', 'الجبيل': 'Jubail',
  'الظهران': 'Dhahran', 'الخبر': 'Khobar', 'القطيف': 'Qatif',
  'حفر الباطن': 'Hafar Al Batin', 'رأس تنورة': 'Ras Tanura',
  'أبها': 'Abha', 'خميس مشيط': 'Khamis Mushait', 'بيشة': 'Bisha',
  'النماص': 'Al Namas', 'محايل عسير': 'Muhayil Asir', 'أحد رفيدة': 'Ahad Rufaydah',
  'تبوك': 'Tabuk', 'الوجه': 'Al Wajh', 'ضبا': 'Duba', 'تيماء': 'Tayma', 'أملج': 'Umluj',
  'حائل': 'Hail', 'بقعاء': "Baqa'a", 'الغزالة': 'Al Ghazalah', 'الشملي': 'Ash Shamli',
  'عرعر': 'Arar', 'رفحاء': 'Rafha', 'طريف': 'Turaif',
  'جازان': 'Jazan', 'صبيا': 'Sabya', 'أبو عريش': 'Abu Arish', 'صامطة': 'Samtah',
  'نجران': 'Najran', 'شرورة': 'Sharurah', 'حبونا': 'Habuna',
  'الباحة': 'Al Bahah', 'بلجرشي': 'Baljurashi', 'المندق': 'Al Mandaq',
  'سكاكا': 'Sakaka', 'دومة الجندل': 'Dumat Al Jandal',
  'القريات': 'Al Qurayyat', 'طبرجل': 'Tabarjal',

  // ── UAE Cities
  'أبوظبي': 'Abu Dhabi', 'العين': 'Al Ain', 'مدينة زايد': 'Zayed City',
  'الرويس': 'Al Ruwais', 'المرفأ': 'Al Marfa',
  'دبي': 'Dubai', 'جبل علي': 'Jebel Ali', 'حتا': 'Hatta',
  'الشارقة': 'Sharjah', 'خورفكان': 'Khorfakkan', 'كلباء': 'Kalba', 'دبا الحصن': 'Dibba Al Hisn',
  'عجمان': 'Ajman', 'المنامة': 'Al Manama', 'مصفوت': 'Masfout',
  'أم القيوين': 'Umm Al Quwain', 'فلج المعلا': 'Falaj Al Mualla',
  'رأس الخيمة': 'Ras Al Khaimah', 'الجزيرة الحمراء': 'Al Jazirah Al Hamra',
  'خت': 'Khatt', 'الرمس': 'Al Rams',
  'الفجيرة': 'Fujairah', 'دبا الفجيرة': 'Dibba Al Fujairah', 'مربح': 'Murbah',

  // ── Qatar Cities
  'الدوحة': 'Doha', 'لوسيل': 'Lusail', 'الدفنة': 'Al Dafna', 'السد': 'Al Sadd',
  'الوكرة': 'Al Wakrah', 'مسيعيد': 'Mesaieed', 'الخور': 'Al Khor', 'الذخيرة': 'Al Dhakhira',
  'مدينة الشمال': 'Al Shamal City', 'الريان': 'Al Rayyan', 'المعيذر': 'Al Muaither',
  'الضعاين': 'Al Daayen', 'أم صلال': 'Umm Salal',
  'أم صلال محمد': 'Umm Salal Mohammed', 'أم صلال علي': 'Umm Salal Ali',

  // ── Kuwait Cities
  'الكويت': 'Kuwait City', 'الشرق': 'Sharq', 'المرقاب': 'Al Murqab', 'دسمان': 'Dasman',
  'حولي': 'Hawalli', 'السالمية': 'Salmiya', 'الجابرية': 'Jabriya', 'مشرف': 'Mishref',
  'الفروانية': 'Farwaniya', 'خيطان': 'Khaitan', 'جليب الشيوخ': 'Jleeb Al Shuyoukh',
  'الجهراء': 'Jahra', 'الصليبية': 'Sulaibiya',
  'الأحمدي': 'Ahmadi', 'الفحيحيل': 'Fahaheel', 'المنقف': 'Mangaf', 'الفنطاس': 'Fintas',
  'مبارك الكبير': 'Mubarak Al Kabeer', 'صباح السالم': 'Sabah Al Salem', 'القرين': 'Al Qurain',

  // ── Egypt Cities
  'مدينة نصر': 'Nasr City', 'مصر الجديدة': 'Heliopolis', 'المعادي': 'Maadi',
  'الزمالك': 'Zamalek', 'وسط البلد': 'Downtown', 'المقطم': 'Mokattam',
  'التجمع الخامس': 'Fifth Settlement', 'القاهرة الجديدة': 'New Cairo',
  'العباسية': 'Abbassia', 'شبرا': 'Shubra',
  'الجيزة': 'Giza', 'السادس من أكتوبر': '6th of October', 'الشيخ زايد': 'Sheikh Zayed',
  'الهرم': 'Haram', 'فيصل': 'Faisal', 'الدقي': 'Dokki', 'المهندسين': 'Mohandessin',
  'العجوزة': 'Agouza',
  'الإسكندرية': 'Downtown Alexandria', 'العجمي': 'Agami', 'المنتزه': 'Montaza',
  'سيدي بشر': 'Sidi Bishr', 'سموحة': 'Smouha', 'ستانلي': 'Stanley', 'برج العرب': 'Borg El Arab',
  'بنها': 'Banha', 'شبرا الخيمة': 'Shubra Al Kheima',
  'القناطر الخيرية': 'Al Qanater Al Khayriyah', 'العبور': 'Obour',
  'المنصورة': 'Mansoura', 'طلخا': 'Talkha', 'ميت غمر': 'Mit Ghamr', 'دكرنس': 'Dekernes',
  'طنطا': 'Tanta', 'المحلة الكبرى': 'El Mahalla El Kubra', 'كفر الزيات': 'Kafr El Zayat',
  'شبين الكوم': 'Shebin El Kom', 'منوف': 'Menouf', 'أشمون': 'Ashmoun',
  'الزقازيق': 'Zagazig', 'العاشر من رمضان': '10th of Ramadan', 'بلبيس': 'Bilbeis',
  'دمنهور': 'Damanhour', 'كفر الدوار': 'Kafr El Dawar', 'رشيد': 'Rosetta',
  'كفر الشيخ': 'Kafr El Sheikh', 'دسوق': 'Desouq',
  'دمياط': 'Damietta', 'دمياط الجديدة': 'New Damietta',
  'بورسعيد': 'Port Said', 'الإسماعيلية': 'Ismailia', 'السويس': 'Suez',
  'الفيوم': 'Faiyum', 'إطسا': 'Itsa', 'بني سويف': 'Beni Suef',
  'المنيا': 'Minya', 'ملوي': 'Mallawi', 'سمالوط': 'Samalut',
  'أسيوط': 'Asyut', 'سوهاج': 'Sohag', 'أخميم': 'Akhmim',
  'قنا': 'Qena', 'نجع حمادي': 'Nag Hammadi',
  'الأقصر': 'Luxor', 'أسوان': 'Aswan', 'كوم أمبو': 'Kom Ombo',
  'الغردقة': 'Hurghada', 'سفاجا': 'Safaga', 'مرسى علم': 'Marsa Alam',
  'الخارجة': 'Al Kharga', 'مرسى مطروح': 'Marsa Matrouh', 'سيوة': 'Siwa',
  'العريش': 'Arish', 'شرم الشيخ': 'Sharm El Sheikh', 'دهب': 'Dahab', 'طابا': 'Taba',
};

function localize(options: LocationOption[], locale?: string): LocationOption[] {
  if (locale !== 'en') return options;
  return options.map(o => ({ value: o.value, label: EN[o.value] ?? o.label }));
}

// ─── Helper Functions ───

export function getCountries(locale?: string): LocationOption[] {
  return localize(countries, locale);
}

export function getGovernorates(countryCode: string, locale?: string): LocationOption[] {
  return localize(governorates[countryCode] ?? [], locale);
}

export function getCities(countryCode: string, governorateCode: string, locale?: string): LocationOption[] {
  return localize(cities[countryCode]?.[governorateCode] ?? [], locale);
}

export function getCountryLabel(code: string, locale?: string): string {
  if (locale === 'en' && EN[code]) return EN[code];
  return countries.find(c => c.value === code)?.label ?? code;
}

export function getGovernorateLabel(countryCode: string, govCode: string, locale?: string): string {
  if (locale === 'en' && EN[govCode]) return EN[govCode];
  return governorates[countryCode]?.find(g => g.value === govCode)?.label ?? govCode;
}

export function getCityLabel(countryCode: string, govCode: string, cityValue: string, locale?: string): string {
  if (locale === 'en' && EN[cityValue]) return EN[cityValue];
  return cities[countryCode]?.[govCode]?.find(c => c.value === cityValue)?.label ?? cityValue;
}
