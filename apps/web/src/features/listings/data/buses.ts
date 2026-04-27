import type { SliderItem } from './types'

export const BUS_SLIDER_ITEMS: SliderItem[] = [
  { name: 'ميني باص',       value: 'MINI_BUS',    icon: 'airport_shuttle',   gradient: 'from-blue-500 to-blue-600' },
  { name: 'حافلة مدرسية',   value: 'SCHOOL_BUS',  icon: 'school',            gradient: 'from-amber-500 to-amber-600' },
  { name: 'حافلة مدينة',    value: 'CITY_BUS',    icon: 'directions_bus',    gradient: 'from-green-500 to-green-600' },
  { name: 'كوتش',           value: 'COACH',       icon: 'directions_transit', gradient: 'from-purple-500 to-purple-600' },
  { name: 'طابقين',         value: 'DOUBLE_DECK', icon: 'layers',            gradient: 'from-red-500 to-red-600' },
]
