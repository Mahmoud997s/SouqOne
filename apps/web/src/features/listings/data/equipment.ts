import type { SliderItem } from './types'

export const EQUIPMENT_SLIDER_ITEMS: SliderItem[] = [
  { name: 'حفارة',          value: 'EXCAVATOR',       icon: 'precision_manufacturing', gradient: 'from-amber-500 to-amber-600' },
  { name: 'رافعة',          value: 'CRANE',           icon: 'construction',            gradient: 'from-blue-500 to-blue-600' },
  { name: 'لودر',           value: 'LOADER',          icon: 'front_loader',            gradient: 'from-orange-500 to-orange-600' },
  { name: 'بلدوزر',         value: 'BULLDOZER',       icon: 'landscape',               gradient: 'from-yellow-600 to-yellow-700' },
  { name: 'رافعة شوكية',    value: 'FORKLIFT',        icon: 'forklift',                gradient: 'from-green-500 to-green-600' },
  { name: 'خلاطة خرسانة',   value: 'CONCRETE_MIXER',  icon: 'blender',                 gradient: 'from-slate-500 to-slate-600' },
  { name: 'مولد كهربائي',   value: 'GENERATOR',       icon: 'bolt',                    gradient: 'from-red-500 to-red-600' },
  { name: 'ضاغط هواء',      value: 'COMPRESSOR',      icon: 'compress',                gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'سقالات',         value: 'SCAFFOLDING',     icon: 'view_column',             gradient: 'from-indigo-500 to-indigo-600' },
  { name: 'ماكينة لحام',    value: 'WELDING_MACHINE', icon: 'hardware',                gradient: 'from-purple-500 to-purple-600' },
  { name: 'شاحنة',          value: 'TRUCK',           icon: 'local_shipping',          gradient: 'from-teal-500 to-teal-600' },
  { name: 'شاحنة قلابة',    value: 'DUMP_TRUCK',      icon: 'fire_truck',              gradient: 'from-rose-500 to-rose-600' },
  { name: 'صهريج مياه',     value: 'WATER_TANKER',    icon: 'water_drop',              gradient: 'from-sky-500 to-sky-600' },
  { name: 'معدات خفيفة',    value: 'LIGHT_EQUIPMENT', icon: 'build',                   gradient: 'from-emerald-500 to-emerald-600' },
  { name: 'أخرى',           value: 'OTHER_EQUIPMENT', icon: 'category',                gradient: 'from-gray-500 to-gray-600' },
]
