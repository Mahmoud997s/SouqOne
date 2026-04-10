import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';
import type { ListingItem } from './listings';

export interface BookingItem {
  id: string;
  listingId: string;
  renterId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: string;
  depositAmount: string | null;
  currency: string;
  status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  cancellationPolicy: 'FREE' | 'FLEXIBLE' | 'MODERATE' | 'STRICT';
  driverRequested: boolean;
  insuranceSelected: boolean;
  pickupLocation: string | null;
  dropoffLocation: string | null;
  notes: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  createdAt: string;
  listing: ListingItem;
  renter?: { id: string; username: string; displayName: string | null; avatarUrl: string | null; phone: string | null };
  owner?: { id: string; username: string; displayName: string | null; avatarUrl: string | null; phone: string | null };
}

export interface BookingsResponse {
  items: BookingItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface PriceCalculation {
  totalDays: number;
  totalPrice: number;
  breakdown: string;
  depositAmount: number | null;
  currency: string;
}

export interface BookingAvailability {
  startDate: string;
  endDate: string;
  status: string;
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      listingId: string;
      startDate: string;
      endDate: string;
      driverRequested?: boolean;
      insuranceSelected?: boolean;
      pickupLocation?: string;
      dropoffLocation?: string;
      notes?: string;
    }) =>
      apiRequest<BookingItem>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
    },
  });
}

export function useMyBookings(params?: { status?: string; page?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', params.page);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return useQuery<BookingsResponse>({
    queryKey: ['my-bookings', params],
    queryFn: () => apiRequest<BookingsResponse>(`/bookings/my${query}`),
  });
}

export function useReceivedBookings(params?: { status?: string; page?: string }) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.page) qs.set('page', params.page);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return useQuery<BookingsResponse>({
    queryKey: ['received-bookings', params],
    queryFn: () => apiRequest<BookingsResponse>(`/bookings/received${query}`),
  });
}

export function useBooking(id: string) {
  return useQuery<BookingItem>({
    queryKey: ['booking', id],
    queryFn: () => apiRequest<BookingItem>(`/bookings/${id}`),
    enabled: !!id,
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest<BookingItem>(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      qc.invalidateQueries({ queryKey: ['received-bookings'] });
    },
  });
}

export function useBookingAvailability(listingId: string) {
  return useQuery<BookingAvailability[]>({
    queryKey: ['booking-availability', listingId],
    queryFn: () => apiRequest<BookingAvailability[]>(`/bookings/availability/${listingId}`),
    enabled: !!listingId,
  });
}

export function useCalculatePrice(listingId: string, startDate: string, endDate: string) {
  const enabled = !!listingId && !!startDate && !!endDate;
  return useQuery<PriceCalculation>({
    queryKey: ['calculate-price', listingId, startDate, endDate],
    queryFn: () =>
      apiRequest<PriceCalculation>(
        `/bookings/calculate-price?listingId=${listingId}&startDate=${startDate}&endDate=${endDate}`,
      ),
    enabled,
  });
}
