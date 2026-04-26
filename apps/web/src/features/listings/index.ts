// ─── Types ────────────────────────────────────────────────────────────────────
export type { ListingCategory, CategoryMeta, CategoryColor } from './types/category.types'
export { VALID_CATEGORIES, CATEGORY_META, CATEGORY_COLORS } from './types/category.types'

export type { FilterType, FilterOption, FilterField, ActiveFilters as ActiveFiltersMap, SortOption, PaginationMeta } from './types/filters.types'

export type { UnifiedListingItem, Badge, BadgeColor, DetailItem } from './types/unified-item.types'
export { BADGE_COLOR_CLASSES } from './types/unified-item.types'

// ─── Config ───────────────────────────────────────────────────────────────────
export { FILTERS_CONFIG, SORT_CONFIG, CATEGORY_FILTERS, CATEGORY_SORT_OPTIONS } from './config/filters.config'
export { GOVERNORATE_OPTIONS } from './config/shared'

// ─── Hooks ────────────────────────────────────────────────────────────────────
export { useUnifiedListings } from './hooks/useUnifiedListings'
export { useFilterState } from './hooks/useFilterState'

// ─── Utils ────────────────────────────────────────────────────────────────────
export {
  parseRangeKey,
  buildQueryParams,
  parseUrlFilters,
  countActiveFilters,
  removeFilter,
  formatFilterLabel,
  getAddListingHref,
} from './utils/filter-helpers'

// ─── Components ───────────────────────────────────────────────────────────────
export { ListingsPageShell } from './components/ListingsPageShell'
export { UnifiedCard } from './components/UnifiedCard'
export { UnifiedCardSkeleton } from './components/UnifiedCardSkeleton'
export { FilterBar } from './components/FilterBar'
export { FilterDropdown } from './components/FilterDropdown'
export { FilterSheet } from './components/FilterSheet'
export { ActiveFilters as ActiveFiltersBar } from './components/ActiveFilters'
export { SortDropdown } from './components/SortDropdown'
export { ResultsMeta } from './components/ResultsMeta'
export { EmptyState } from './components/EmptyState'
