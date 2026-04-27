import type { SliderItem } from './types'

export const PARTS_SLIDER_ITEMS: SliderItem[] = [
  { name: 'محرك',        value: 'ENGINE',       icon: 'precision_manufacturing', gradient: 'from-red-500 to-red-600' },
  { name: 'هيكل',        value: 'BODY',         icon: 'directions_car',          gradient: 'from-blue-500 to-blue-600' },
  { name: 'كهرباء',      value: 'ELECTRICAL',   icon: 'bolt',                    gradient: 'from-amber-500 to-amber-600' },
  { name: 'تعليق',       value: 'SUSPENSION',   icon: 'height',                  gradient: 'from-purple-500 to-purple-600' },
  { name: 'فرامل',       value: 'BRAKES',       icon: 'do_not_disturb',          gradient: 'from-rose-500 to-rose-600' },
  { name: 'ناقل حركة',   value: 'TRANSMISSION', icon: 'settings',                gradient: 'from-indigo-500 to-indigo-600' },
  { name: 'تبريد',       value: 'COOLING',      icon: 'ac_unit',                 gradient: 'from-cyan-500 to-cyan-600' },
  { name: 'عادم',        value: 'EXHAUST',      icon: 'air',                     gradient: 'from-gray-500 to-gray-600' },
  { name: 'داخلية',      value: 'INTERIOR',     icon: 'weekend',                 gradient: 'from-teal-500 to-teal-600' },
  { name: 'إطارات',      value: 'TIRES',        icon: 'tire_repair',             gradient: 'from-orange-500 to-orange-600' },
]
