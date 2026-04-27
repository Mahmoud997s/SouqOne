/**
 * Supported filter field types.
 * Maps directly to which UI component renders the filter.
 */
export type FilterType =
  | 'select'              // single-value dropdown with predefined options
  | 'multiselect'         // checkbox list, value = comma-separated string
  | 'range'               // dual number inputs via slider
  | 'range_select'        // dual dropdown selects for range (from/to)
  | 'toggle'              // boolean switch, value = "true" | "false"
  | 'search'              // free text input
  | 'governorate_wilayat' // cascaded: governorate chips → wilayat dropdown
  | 'make_model'          // cascaded: make dropdown → model dropdown

export interface FilterOption {
  value: string
  labelAr: string
  labelEn?: string
}

export interface FilterField {
  /**
   * The query param key exactly as the API DTO expects it.
   * For `range` type: the API uses `${key}Min` and `${key}Max` automatically.
   * For `multiselect`: value is sent as comma-separated string.
   */
  key: string

  labelAr: string
  labelEn?: string

  type: FilterType

  /** Options list — required for 'select' and 'multiselect' */
  options?: FilterOption[]

  /** For 'range' type — minimum allowed value */
  min?: number

  /** For 'range' type — maximum allowed value */
  max?: number

  /** Unit label shown in range input placeholder — e.g. "ر.ع" | "كم" | "راكب" */
  unit?: string

  /** Placeholder text for 'search' and 'range' inputs */
  placeholder?: string

  /**
   * If true → render directly in the FilterBar (above-the-fold).
   * If false → collapse into "المزيد من الفلاتر" panel.
   */
  primary?: boolean
}

/**
 * Active filter state — keyed by FilterField.key.
 * Values:
 *   - string  → for select, search, toggle ("true"/"false")
 *   - string[] → for multiselect (normalized to comma-string before URL push)
 */
export type ActiveFilters = Record<string, string | string[]>

/**
 * Sort option definition per category.
 */
export interface SortOption {
  value: string   // the value sent to the API (e.g. "createdAt_desc")
  labelAr: string
  labelEn?: string
}

/**
 * Pagination meta returned from all list endpoints.
 */
export interface PaginationMeta {
  page: number
  total: number
  totalPages: number
  limit: number
}
