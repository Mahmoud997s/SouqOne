/**
 * Configuration types for the unified sale page.
 * Defines how each listing type is displayed and formatted.
 */

import type { SaleEntityType, UnifiedListing } from './unified.types';

/** Field specification for spec cards and detail tables */
export interface SpecField {
  /** The key path in the data object (supports dot notation like 'carData.year') */
  key: string;
  /** Display label (Arabic) */
  label: string;
  /** Lucide icon name */
  icon: string;
  /** Value formatting type */
  format?: 'number' | 'text' | 'boolean' | 'km' | 'year' | 'array' | 'link';
  /** Unit suffix (e.g., 'كم', 'حصان', 'راكب') */
  unit?: string;
  /** Whether to hide this field if the value is null/undefined/empty */
  hideIfEmpty?: boolean;
}

/** Highlight card configuration (the 3 info cards below seller) */
export interface HighlightField {
  /** Lucide icon name */
  icon: string;
  /** Function to generate the title text */
  getTitle: (data: UnifiedListing) => string;
  /** Function to generate the subtitle text */
  getSub: (data: UnifiedListing) => string;
  /** Optional condition to show/hide this highlight */
  condition?: (data: UnifiedListing) => boolean;
}

/** Badge color variants for the listing type indicator */
export type BadgeColor = 'blue' | 'green' | 'orange' | 'purple' | 'teal';

/** Complete section configuration for one listing type */
export interface SectionConfig {
  /** The listing type this config applies to */
  type: SaleEntityType;
  /** Singular display name (e.g., "سيارة", "حافلة") */
  displayName: string;
  /** Lucide icon name for this section */
  icon: string;
  /** The 4 spec cards shown at the top */
  specsFields: SpecField[];
  /** The detail table fields */
  tableFields: SpecField[];
  /** The 3 highlight cards */
  highlightFields: HighlightField[];
  /** Badge color for this listing type */
  badgeColor: BadgeColor;
}
