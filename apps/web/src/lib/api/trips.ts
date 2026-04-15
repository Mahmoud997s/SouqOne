import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface TripItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  tripType: string;
  routeFrom: string;
  routeTo: string;
  routeStops: string[];
  scheduleType: string;
  departureTimes: string[];
  operatingDays: string[];
  pricePerTrip?: string;
  priceMonthly?: string;
  currency: string;
  vehicleType?: string;
  capacity?: number;
  availableSeats?: number;
  features: string[];
  providerName: string;
  governorate: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  whatsapp?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  viewCount: number;
  userId: string;
  user: { id: string; username: string; displayName?: string; avatarUrl?: string; phone?: string; governorate?: string; isVerified?: boolean; createdAt?: string };
  images?: { id: string; url: string; isPrimary: boolean; order: number }[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedTrips {
  items: TripItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useTrips(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  return useQuery<PaginatedTrips>({
    queryKey: ['trips', params],
    queryFn: () => apiRequest(`/trips${qs ? `?${qs}` : ''}`),
  });
}

export function useTrip(id: string) {
  return useQuery<TripItem>({
    queryKey: ['trips', id],
    queryFn: () => apiRequest(`/trips/${id}`),
    enabled: !!id,
  });
}

export function useMyTrips() {
  return useQuery<TripItem[]>({
    queryKey: ['trips', 'my'],
    queryFn: () => apiRequest('/trips/my'),
  });
}

export function useTripBySlug(slug: string) {
  return useQuery<TripItem>({
    queryKey: ['trips', 'slug', slug],
    queryFn: () => apiRequest(`/trips/slug/${slug}`),
    enabled: !!slug,
  });
}

export function useToggleTripStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<TripItem>(`/trips/${id}/status`, { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<TripItem>('/trips', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trips'] }); },
  });
}

export function useUpdateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest<TripItem>(`/trips/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trips'] }); },
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/trips/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['trips'] }); },
  });
}
