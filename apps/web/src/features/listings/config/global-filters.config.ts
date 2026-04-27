/**
 * Filter set used by the "global" /browse page (searching across all categories).
 * Only universal filters are available here — category-specific filters live in `filters.config.ts`.
 */

import type { FilterField, SortOption } from '../types/filters.types'
import { GOVERNORATE_OPTIONS } from './shared'

export const GLOBAL_FILTERS: FilterField[] = [
  {
    key: 'governorate',
    labelAr: 'المحافظة',
    type: 'select',
    primary: true,
    options: GOVERNORATE_OPTIONS,
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
]

export const GLOBAL_SORT_OPTIONS: SortOption[] = [
  { value: '',           labelAr: 'الأكثر صلة' },
  { value: 'newest',     labelAr: 'الأحدث' },
  { value: 'price:asc',  labelAr: 'السعر: الأقل' },
  { value: 'price:desc', labelAr: 'السعر: الأعلى' },
]

/** Entity types supported by the global Meili search.
 *  These mirror Meili's `_entityType` values. */
export const GLOBAL_ENTITY_TYPES = [
  'listings',
  'buses',
  'parts',
  'services',
  'jobs',
] as const

export type GlobalEntityType = typeof GLOBAL_ENTITY_TYPES[number]

/** Map Meili entity type → ListingCategory used by the rest of the UI. */
export const ENTITY_TYPE_TO_CATEGORY = {
  listings: 'cars',
  buses:    'buses',
  parts:    'parts',
  services: 'services',
  jobs:     'jobs',
} as const
