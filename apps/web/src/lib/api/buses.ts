import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface BusListingItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  busListingType: string;
  busType: string;
  make: string;
  model: string;
  year: number;
  capacity: number;
  mileage?: number;
  fuelType?: string;
  transmission?: string;
  condition: string;
  features: string[];
  plateNumber?: string;
  price?: string;
  currency: string;
  isPriceNegotiable: boolean;
  contractType?: string;
  contractClient?: string;
  contractMonthly?: string;
  contractDuration?: number;
  contractExpiry?: string;
  dailyPrice?: string;
  monthlyPrice?: string;
  minRentalDays?: number;
  withDriver: boolean;
  deliveryAvailable: boolean;
  requestPassengers?: number;
  requestRoute?: string;
  requestSchedule?: string;
  governorate?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  whatsapp?: string;
  status: string;
  viewCount: number;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    phone?: string;
    governorate?: string;
    isVerified?: boolean;
    createdAt?: string;
  };
  images: { id: string; url: string; isPrimary: boolean; order: number }[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedBuses {
  items: BusListingItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useBusListings(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  return useQuery<PaginatedBuses>({
    queryKey: ['buses', params],
    queryFn: () => apiRequest(`/buses${qs ? `?${qs}` : ''}`),
  });
}

export function useBusListing(id: string) {
  return useQuery<BusListingItem>({
    queryKey: ['buses', id],
    queryFn: () => apiRequest(`/buses/${id}`),
    enabled: !!id,
  });
}

export function useMyBusListings() {
  return useQuery<BusListingItem[]>({
    queryKey: ['buses', 'my'],
    queryFn: () => apiRequest('/buses/my'),
  });
}

export function useCreateBusListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<BusListingItem>('/buses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['buses'] }); },
  });
}

export function useUpdateBusListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest<BusListingItem>(`/buses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['buses'] }); },
  });
}

export function useDeleteBusListing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/buses/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['buses'] }); },
  });
}
