import type { SpecField } from '@/features/sale/types/config.types';
import type { RentalEntityType, UnifiedRentalListing } from './unified-rental.types';

/** Re-export sale SpecField — same shape for rental specs/tables */
export type RentalSpecField = SpecField;

/** Highlight card configuration (uses UnifiedRentalListing for callbacks) */
export interface RentalHighlightField {
  icon: string;
  getTitle: (data: UnifiedRentalListing) => string;
  getSub: (data: UnifiedRentalListing) => string;
  condition?: (data: UnifiedRentalListing) => boolean;
}

export type RentalBadgeColor = 'emerald' | 'orange' | 'teal';

/** Complete section configuration for one rental listing type */
export interface RentalSectionConfig {
  type: RentalEntityType;
  displayName: string;
  icon: string;
  specsFields: RentalSpecField[];
  tableFields: RentalSpecField[];
  highlightFields: RentalHighlightField[];
  badgeColor: RentalBadgeColor;
}
