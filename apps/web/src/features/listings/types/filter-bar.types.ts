/**
 * Filter Bar Types — Config-driven filter bar architecture
 * Supports multiple field types with icons, labels, and configurations
 */

import type { LucideIcon } from 'lucide-react'

/**
 * Field types supported by FilterBar
 */
export type FilterBarFieldType = 'select' | 'range' | 'search' | 'toggle'

/**
 * Option for select fields
 */
export interface FilterBarOption {
  value: string
  label: string
}

/**
 * Configuration for a single filter bar field
 */
export interface FilterBarFieldConfig {
  /** Unique key for the field */
  key: string
  
  /** Display label (Arabic) */
  label: string
  
  /** Lucide icon component */
  icon: LucideIcon
  
  /** Field type */
  type: FilterBarFieldType
  
  /** Placeholder text for search/input fields */
  placeholder?: string
  
  /** Options for select fields */
  options?: FilterBarOption[]
  
  /** For range fields */
  min?: number
  max?: number
  unit?: string
  
  /** If true, field gets highlighted background (primary field) */
  isPrimary?: boolean
  
  /** If true, field is shown in the main bar (vs sidebar) */
  showInBar?: boolean
}

/**
 * Filter bar configuration for a category
 */
export type FilterBarConfig = FilterBarFieldConfig[]

/**
 * Active filter values — keyed by field key
 */
export type FilterBarValues = Record<string, string | null>

/**
 * Props for FilterBar component
 */
export interface FilterBarProps {
  /** Field configurations */
  config: FilterBarConfig
  
  /** Current filter values */
  values: FilterBarValues
  
  /** Callback when a filter changes */
  onChange: (key: string, value: string | null) => void
  
  /** Callback for search input */
  onSearch?: (query: string) => void
  
  /** Search input placeholder */
  searchPlaceholder?: string
  
  /** Show active filter count badge */
  showActiveBadge?: boolean
}
