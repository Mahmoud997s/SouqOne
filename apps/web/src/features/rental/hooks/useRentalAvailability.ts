/**
 * Wrapper hook for booking availability that maps RentalEntityType
 * to the correct BookingEntityType.
 */

'use client';

import { useBookingAvailability } from '@/lib/api/bookings';
import type { RentalEntityType } from '../types/unified-rental.types';
import type { BookingEntityType } from '@/lib/api/bookings';

const ENTITY_TYPE_MAP: Record<RentalEntityType, BookingEntityType> = {
  car: 'CAR',
  bus: 'BUS',
  equipment: 'EQUIPMENT',
};

export function useRentalAvailability(type: RentalEntityType, id: string) {
  return useBookingAvailability(ENTITY_TYPE_MAP[type], id);
}
