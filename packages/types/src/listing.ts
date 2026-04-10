// ──────────────────────────────────────
// أنواع إعلانات السيارات
// ──────────────────────────────────────

export enum ListingStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  ARCHIVED = 'ARCHIVED',
  SUSPENDED = 'SUSPENDED',
}

export enum ItemCondition {
  NEW = 'NEW',
  USED = 'USED',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum FuelType {
  PETROL = 'PETROL',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
}

export enum Transmission {
  AUTOMATIC = 'AUTOMATIC',
  MANUAL = 'MANUAL',
}

export interface IListing {
  id: string;
  title: string;
  slug: string;
  description: string;

  // بيانات السيارة
  make: string;
  model: string;
  year: number;
  mileage?: number | null;
  fuelType?: FuelType | null;
  transmission?: Transmission | null;
  bodyType?: string | null;
  exteriorColor?: string | null;
  interior?: string | null;
  engineSize?: string | null;
  horsepower?: number | null;
  doors?: number | null;
  seats?: number | null;
  driveType?: string | null;

  // السعر
  price: number;
  currency: string;
  isPriceNegotiable: boolean;

  // الحالة
  condition: ItemCondition;
  status: ListingStatus;
  isPremium: boolean;

  // الموقع
  governorate?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  viewCount: number;
  sellerId: string;

  images: IListingImage[];

  createdAt: Date;
  updatedAt: Date;
}

export interface IListingImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  isPrimary: boolean;
  listingId: string;
  createdAt: Date;
}

export interface ICreateListing {
  title: string;
  description: string;
  make: string;
  model: string;
  year: number;
  mileage?: number;
  fuelType?: FuelType;
  transmission?: Transmission;
  bodyType?: string;
  exteriorColor?: string;
  interior?: string;
  engineSize?: string;
  horsepower?: number;
  doors?: number;
  seats?: number;
  driveType?: string;
  price: number;
  currency?: string;
  isPriceNegotiable?: boolean;
  condition?: ItemCondition;
  governorate?: string;
  city?: string;
}

// ماركات السيارات الشائعة في عُمان
export const POPULAR_MAKES = [
  'Toyota',
  'Nissan',
  'Lexus',
  'Land Rover',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Porsche',
  'Hyundai',
  'Kia',
  'Honda',
  'Mitsubishi',
  'Ford',
  'Chevrolet',
  'GMC',
  'Jeep',
] as const;
