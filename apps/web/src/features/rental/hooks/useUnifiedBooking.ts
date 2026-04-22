'use client';

import { useCreateBooking } from '@/lib/api/bookings';
import type { BookingEntityType } from '@/lib/api/bookings';
import { BOOKING_ENTITY_TYPE } from '../types/unified-rental.types';
import type { RentalEntityType } from '../types/unified-rental.types';

export function useUnifiedBooking(type: RentalEntityType) {
  const createBooking = useCreateBooking();

  const book = async (id: string, startDate: string, endDate: string) => {
    return createBooking.mutateAsync({
      entityType: BOOKING_ENTITY_TYPE[type] as BookingEntityType,
      entityId: id,
      startDate,
      endDate,
    });
  };

  return { book, isPending: createBooking.isPending };
}
