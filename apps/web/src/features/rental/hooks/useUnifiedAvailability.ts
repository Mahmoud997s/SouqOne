'use client';

import { useMemo } from 'react';
import { useBookingAvailability } from '@/lib/api/bookings';
import type { BookingEntityType } from '@/lib/api/bookings';
import { BOOKING_ENTITY_TYPE } from '../types/unified-rental.types';
import type { RentalEntityType } from '../types/unified-rental.types';

export function useUnifiedAvailability(type: RentalEntityType, id: string) {
  const entityType = BOOKING_ENTITY_TYPE[type] as BookingEntityType;
  const { data, isLoading } = useBookingAvailability(entityType, id);

  const unavailableDates = useMemo(() => {
    if (!data) return [];
    return data.flatMap(({ startDate, endDate }) => {
      const dates: string[] = [];
      const current = new Date(startDate);
      const end = new Date(endDate);
      while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    });
  }, [data]);

  return { unavailableDates, isLoading, raw: data ?? [] };
}
