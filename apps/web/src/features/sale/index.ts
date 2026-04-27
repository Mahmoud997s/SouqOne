/**
 * Sale feature barrel exports.
 */

// Types
export * from './types';

// Config
export { getSaleConfig, getNestedValue } from './config/specs.config';

// Hooks
export { useUnifiedListing } from './hooks/useUnifiedListing';

// Components
export { SalePageShell } from './components/SalePageShell';
export { SpecsGrid } from './components/SpecsGrid';
export { DetailsTable } from './components/DetailsTable';
export { Highlights } from './components/Highlights';
export { PriceCard } from './components/PriceCard';
export { SimilarItems } from './components/SimilarItems';
export { SellerRow } from './components/SellerRow';
export { MobileCTABar } from './components/MobileCTABar';
