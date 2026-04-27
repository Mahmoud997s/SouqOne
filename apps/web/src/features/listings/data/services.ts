import type { SliderItem } from './types'

export const SERVICE_SLIDER_ITEMS: SliderItem[] = [
  { name: 'صيانة عامة',       value: 'MAINTENANCE',        icon: 'build',                  img: '/images/services/maintenance.png', gradient: 'from-blue-500 to-blue-600' },
  { name: 'تنظيف وتلميع',     value: 'CLEANING',           icon: 'local_car_wash',         img: '/images/services/cleaning.png', gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'تعديل وتيونج',     value: 'MODIFICATION',       icon: 'tune',                   img: '/images/services/modification.png', gradient: 'from-purple-500 to-purple-600' },
  { name: 'فحص شامل',         value: 'INSPECTION',         icon: 'fact_check',             img: '/images/services/inspection.png', gradient: 'from-green-500 to-green-600' },
  { name: 'سمكرة ودهان',      value: 'BODYWORK',           icon: 'format_paint',           img: '/images/services/bodywork.png', gradient: 'from-orange-500 to-orange-600' },
  { name: 'تركيب إكسسوارات',  value: 'ACCESSORIES_INSTALL', icon: 'add_circle',            img: '/images/services/accessories.png', gradient: 'from-pink-500 to-pink-600' },
  { name: 'مفاتيح وأقفال',    value: 'KEYS_LOCKS',         icon: 'key',                    gradient: 'from-amber-500 to-amber-600' },
  { name: 'سحب ونقل',         value: 'TOWING',             icon: 'local_shipping',         gradient: 'from-red-500 to-red-600' },
  { name: 'خدمات أخرى',       value: 'OTHER_SERVICE',      icon: 'miscellaneous_services', gradient: 'from-slate-500 to-slate-600' },
]
