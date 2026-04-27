/**
 * Adapters that map domain-specific entity items to `VehicleCardProps`,
 * so every page in the app can render a single unified card component.
 */

import type { VehicleCardProps } from '../components/vehicle-card';
import type { JobItem } from '@/lib/api/jobs';
import type { ListingCategory } from '@/features/listings/types/category.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickPrimaryImage(images?: { url?: string; isPrimary?: boolean }[] | null): string | null {
  if (!images || images.length === 0) return null;
  const primary = images.find((i) => i.isPrimary);
  return primary?.url ?? images[0]?.url ?? null;
}

// ─── Sale entity adapter (cars/buses/equipment/parts/services) ───────────────

interface SaleItemLike {
  id: string;
  title: string;
  slug?: string;
  price?: string | number | null;
  priceFrom?: string | number | null;
  basePrice?: string | number | null;
  currency?: string;
  isPriceNegotiable?: boolean;
  viewCount?: number;
  createdAt?: string;
  governorate?: string | null;
  images?: { url?: string; isPrimary?: boolean }[] | null;
  imageUrl?: string | null;
  // sale-type specific
  make?: string;
  model?: string;
  year?: number;
  mileage?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  condition?: string | null;
  listingType?: string | null;
  busListingType?: string | null;
  dailyPrice?: string | number | null;
  monthlyPrice?: string | number | null;
  busType?: string | null;
  capacity?: number | null;
  equipmentType?: string | null;
  hoursUsed?: number | null;
  partCategory?: string | null;
  isOriginal?: boolean;
  serviceType?: string | null;
  providerType?: string | null;
  isHomeService?: boolean;
  // verified seller
  seller?: { isVerified?: boolean; phone?: string | null } | null;
  user?: { isVerified?: boolean; phone?: string | null } | null;
}

export type SaleEntity = 'car' | 'bus' | 'equipment' | 'part' | 'service';

const SALE_ENTITY_TO_CATEGORY: Record<SaleEntity, ListingCategory> = {
  car:       'cars',
  bus:       'buses',
  equipment: 'equipment',
  part:      'parts',
  service:   'services',
};

export function mapSaleItemToVehicleCard(
  item: SaleItemLike,
  entity: SaleEntity,
): VehicleCardProps {
  const category = SALE_ENTITY_TO_CATEGORY[entity];
  const image = item.imageUrl ?? pickPrimaryImage(item.images);
  const verified = item.seller?.isVerified ?? item.user?.isVerified ?? false;

  // Resolve price (services use priceFrom; parts/cars/buses use price)
  const price = item.price ?? item.priceFrom ?? item.basePrice ?? null;
  const listingType = item.listingType ?? item.busListingType ?? null;

  return {
    id:                  item.id,
    title:               item.title,
    price:               price ?? null,
    currency:            item.currency || 'OMR',
    imageUrl:            image,
    governorate:         item.governorate ?? null,
    createdAt:           item.createdAt,
    isVerified:          verified,
    isPriceNegotiable:   item.isPriceNegotiable,
    category,
    slug:                item.slug ?? null,

    // cars / buses / equipment
    make:                item.make,
    model:               item.model,
    year:                item.year,
    mileage:             item.mileage ?? null,
    fuelType:            item.fuelType ?? null,
    transmission:        item.transmission ?? null,
    condition:           item.condition ?? null,
    listingType,
    dailyPrice:          item.dailyPrice ?? null,
    monthlyPrice:        item.monthlyPrice ?? null,

    // buses
    busType:             item.busType ?? null,
    capacity:            item.capacity ?? null,

    // equipment
    equipmentType:       item.equipmentType ?? null,
    hoursUsed:           item.hoursUsed ?? null,

    // parts
    partCategory:        item.partCategory ?? null,
    isOriginal:          item.isOriginal,

    // services
    serviceType:         item.serviceType ?? null,
    providerType:        item.providerType ?? null,
    isHomeService:       item.isHomeService,
  };
}

// ─── Job adapter ──────────────────────────────────────────────────────────────

export function mapJobToVehicleCard(job: JobItem): VehicleCardProps {
  const salaryNum = job.salary ? Number(job.salary) : null;
  const price = salaryNum && salaryNum > 0 ? salaryNum : null;

  return {
    id:                 job.id,
    title:              job.title,
    price,
    currency:           job.currency || 'OMR',
    imageUrl:           null,
    governorate:        job.governorate ?? null,
    createdAt:          job.createdAt,
    isVerified:         false,
    category:           'jobs',
    slug:               job.slug ?? null,
    jobType:            job.jobType,
    employmentType:     job.employmentType,
    salaryPeriod:       job.salaryPeriod ?? null,
  };
}

// ─── Unified listing item adapter (browse page primary source) ───────────────

import type { UnifiedListingItem } from '@/features/listings/types/unified-item.types';

export function mapUnifiedToVehicleCard(item: UnifiedListingItem): VehicleCardProps {
  const a = item.attributes ?? {};
  return {
    id:                 item.id,
    title:              item.title,
    price:              item.price,
    currency:           item.currency,
    imageUrl:           item.images?.[0] ?? null,
    governorate:        item.governorate,
    createdAt:          item.createdAt,
    isVerified:         item.sellerVerified,
    isPriceNegotiable:  item.isPriceNegotiable,
    href:               item.href,
    category:           item.category,
    slug:               a.slug ?? null,
    entityType:         item.favoriteEntityType,

    // cars/buses/equipment
    make:               a.make,
    model:              a.model,
    year:               a.year,
    mileage:            a.mileage ?? null,
    fuelType:           a.fuelType ?? null,
    transmission:       a.transmission ?? null,
    condition:          a.condition ?? null,
    listingType:        a.listingType ?? a.busListingType ?? null,
    dailyPrice:         a.dailyPrice ?? null,
    monthlyPrice:       a.monthlyPrice ?? null,

    // buses
    busType:            a.busType ?? null,
    capacity:           a.capacity ?? null,

    // equipment
    equipmentType:      a.equipmentType ?? null,
    hoursUsed:          a.hoursUsed ?? null,

    // parts
    partCategory:       a.partCategory ?? null,
    isOriginal:         a.isOriginal,

    // services
    serviceType:        a.serviceType ?? null,
    providerType:       a.providerType ?? null,
    isHomeService:      a.isHomeService,

    // jobs
    jobType:            a.jobType ?? null,
    employmentType:     a.employmentType ?? null,
    salaryPeriod:       a.salaryPeriod ?? null,
  };
}
