import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface TransportItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  transportType: string;
  vehicleType?: string;
  vehicleCapacity?: number;
  coverageAreas: string[];
  pricingType: string;
  basePrice?: string;
  pricePerKm?: string;
  currency: string;
  hasInsurance: boolean;
  hasTracking: boolean;
  providerName?: string;
  providerType?: string;
  governorate?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  whatsapp?: string;
  status: string;
  viewCount: number;
  userId: string;
  user: { id: string; username: string; displayName?: string; avatarUrl?: string; phone?: string; governorate?: string; isVerified?: boolean; createdAt?: string };
  images: { id: string; url: string; isPrimary: boolean; order: number }[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedTransport {
  items: TransportItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useTransportServices(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  return useQuery<PaginatedTransport>({
    queryKey: ['transport', params],
    queryFn: () => apiRequest(`/transport${qs ? `?${qs}` : ''}`),
  });
}

export function useTransportService(id: string) {
  return useQuery<TransportItem>({
    queryKey: ['transport', id],
    queryFn: () => apiRequest(`/transport/${id}`),
    enabled: !!id,
  });
}

export function useMyTransportServices() {
  return useQuery<PaginatedTransport>({
    queryKey: ['transport', 'my'],
    queryFn: () => apiRequest('/transport/my'),
  });
}

export function useCreateTransportService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<TransportItem>('/transport', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transport'] }); },
  });
}

export function useUpdateTransportService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest<TransportItem>(`/transport/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transport'] }); },
  });
}

export function useDeleteTransportService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/transport/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transport'] }); },
  });
}
