/**
 * Similar items section with horizontal scroll.
 * Shows related listings from the same type and governorate.
 */

'use client';

import { memo } from 'react';
import { useListings } from '@/lib/api/listings';
import { useBusListings } from '@/lib/api/buses';
import { useEquipmentListings } from '@/lib/api/equipment';
import { useParts } from '@/lib/api/parts';
import { useCarServices } from '@/lib/api/services';
import { useTranslations } from 'next-intl';
import type { SaleEntityType } from '../types/unified.types';
import { SaleCard } from './SaleCard';

interface SimilarItemsProps {
  type: SaleEntityType;
  currentId: string;
  governorate: string;
}

/**
 * Fetch similar items based on listing type and governorate.
 */
function useSimilarListings(type: SaleEntityType, governorate: string, currentId: string) {
  const limit = '6';
  const params = { limit, governorate };

  // Use the appropriate hook based on type
  const carQuery = useListings(type === 'car' ? params : {}, type === 'car');
  const busQuery = useBusListings(type === 'bus' ? params : {}, type === 'bus');
  const equipmentQuery = useEquipmentListings(type === 'equipment' ? params : {});
  const partQuery = useParts(type === 'part' ? params : {}, type === 'part');
  const serviceQuery = useCarServices(type === 'service' ? params : {}, type === 'service');

  // Select the active query result
  const query = {
    car: carQuery,
    bus: busQuery,
    equipment: equipmentQuery,
    part: partQuery,
    service: serviceQuery,
  }[type];

  // Filter out current item
  const items = query.data?.items?.filter((item) => item.id !== currentId).slice(0, 6) || [];

  return {
    items,
    isLoading: query.isLoading,
  };
}

export const SimilarItems = memo(function SimilarItems({
  type,
  currentId,
  governorate,
}: SimilarItemsProps) {
  const { items, isLoading } = useSimilarListings(type, governorate, currentId);
  const ts = useTranslations('sale');

  if (isLoading) {
    return (
      <div className="mt-10 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-on-surface">{ts('similarTitle')}</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-3 -mx-4 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-56 flex-shrink-0 h-48 bg-surface-container rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-10 pt-6 border-t border-border/30">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-on-surface">{ts('similarTitle')}</h2>
        <a
          href={`/${type === 'car' ? 'listings' : type === 'bus' ? 'buses' : type === 'equipment' ? 'equipment' : type === 'part' ? 'parts' : 'services'}?governorate=${governorate}`}
          className="text-[12px] font-medium text-primary hover:underline underline-offset-2"
        >
          {ts('viewAll')}
        </a>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
        {items.map((item) => (
          <div key={item.id} className="w-56 flex-shrink-0">
            <SaleCard type={type} item={item as Parameters<typeof SaleCard>[0]['item']} />
          </div>
        ))}
      </div>
    </div>
  );
});
