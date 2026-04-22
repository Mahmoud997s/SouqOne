/**
 * Unified sale card component.
 * Same style as VehicleCard but supports all 5 listing types.
 */

'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useFavContext } from '@/providers/favorites-provider';
import { useAuth } from '@/providers/auth-provider';
import { useTranslations } from 'next-intl';
import type { SaleEntityType } from '../types/unified.types';

// Type for API item (simplified union)
type SaleItem = {
  id: string;
  title: string;
  price: string | number;
  currency: string;
  isPriceNegotiable?: boolean;
  viewCount?: number;
  createdAt?: string;
  images?: { url?: string; isPrimary?: boolean }[];
  seller?: { isVerified?: boolean };
  // Type-specific fields
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  fuelType?: string | null;
  transmission?: string | null;
  busType?: string;
  capacity?: number;
  equipmentType?: string;
  partCategory?: string;
  serviceType?: string;
};

interface SaleCardProps {
  type: SaleEntityType;
  item: SaleItem;
}

function formatPrice(price: string | number | undefined): string {
  if (price === undefined || price === null) return '';
  const num = typeof price === 'string' ? Number(price) : price;
  if (Number.isNaN(num)) return String(price);
  return num.toLocaleString('en-US');
}

function getSubtitle(item: SaleItem, type: SaleEntityType): string {
  switch (type) {
    case 'car':
      return item.make && item.model ? `${item.make} ${item.model} ${item.year || ''}`.trim() : item.title;
    case 'bus':
      return item.busType && item.capacity ? `${item.busType} · ${item.capacity}` : item.title;
    case 'equipment':
      return item.equipmentType || item.title;
    case 'part':
      return item.partCategory || item.title;
    case 'service':
      return item.serviceType || item.title;
    default:
      return item.title;
  }
}

function getImageUrl(item: SaleItem): string | undefined {
  const img = item.images?.find((i) => i.isPrimary) || item.images?.[0];
  return img?.url || undefined;
}

export const SaleCard = memo(function SaleCard({ type, item }: SaleCardProps) {
  const ts = useTranslations('sale');
  const { isAuthenticated } = useAuth();
  const { isFav: checkFav, toggleFav } = useFavContext();

  const isFav = checkFav(`${type.toUpperCase()}:${item.id}`);

  const priceFormatted = formatPrice(item.price);
  const subtitle = getSubtitle(item, type);
  const imageUrl = getImageUrl(item);
  const isVerified = item.seller?.isVerified ?? false;

  const handleFavClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;

    // Map SaleEntityType to API EntityType
    const entityTypeMap: Record<SaleEntityType, string> = {
      car: 'LISTING',
      bus: 'BUS_LISTING',
      equipment: 'EQUIPMENT_LISTING',
      part: 'SPARE_PART',
      service: 'CAR_SERVICE',
    };

    toggleFav.mutate({
      entityType: entityTypeMap[type] as 'LISTING' | 'BUS_LISTING' | 'EQUIPMENT_LISTING' | 'SPARE_PART' | 'CAR_SERVICE',
      entityId: item.id,
    });
  };

  return (
    <Link
      href={`/sale/${type}/${item.id}`}
      className="h-full rounded-xl overflow-hidden bg-surface-container-lowest group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300 border border-outline-variant/10 block"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
            <span className="material-symbols-outlined text-4xl">image</span>
          </div>
        )}

        {/* Favorite button */}
        {isAuthenticated && (
          <button
            onClick={handleFavClick}
            className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
              isFav ? 'bg-primary text-on-primary' : 'bg-black/30 text-white hover:bg-black/50'
            }`}
          >
            <Heart size={14} fill={isFav ? 'currentColor' : 'none'} />
          </button>
        )}

        {/* Verified badge */}
        {isVerified && (
          <span className="absolute bottom-2 left-2 text-blue-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
            <span
              className="material-symbols-outlined text-[14px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">
        <h3 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1">
          {item.title}
        </h3>

        <p className="text-[9px] sm:text-[11px] text-on-surface-variant line-clamp-1">{subtitle}</p>

        {/* Price */}
        <div className="mt-auto flex items-center gap-1">
          {priceFormatted ? (
            <>
              <span className="text-[11px] sm:text-[14px] font-bold text-on-surface">{priceFormatted}</span>
              <span className="text-[9px] sm:text-[11px] text-on-surface-variant">{item.currency}</span>
            </>
          ) : (
            <span className="text-[10px] sm:text-[12px] text-on-surface-variant">{ts('contactForPrice')}</span>
          )}
        </div>

        {/* Footer: views + date */}
        <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-on-surface-variant">
          <span className="flex items-center gap-0.5">
            <span className="material-symbols-outlined text-[9px] sm:text-[11px]">visibility</span>
            {item.viewCount || 0}
          </span>
          {item.isPriceNegotiable && (
            <span className="text-primary">{ts('negotiableLabel')}</span>
          )}
        </div>
      </div>
    </Link>
  );
});
