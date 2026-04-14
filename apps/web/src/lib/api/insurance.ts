import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface InsuranceItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  offerType: string;
  providerName: string;
  providerLogo?: string;
  coverageType?: string;
  priceFrom?: string;
  currency: string;
  features: string[];
  termsUrl?: string;
  contactPhone?: string;
  whatsapp?: string;
  website?: string;
  governorate?: string;
  latitude?: number;
  longitude?: number;
  status: string;
  viewCount: number;
  userId: string;
  user: { id: string; username: string; displayName?: string; avatarUrl?: string; phone?: string; governorate?: string; isVerified?: boolean; createdAt?: string };
  images?: { id: string; url: string; isPrimary: boolean; order: number }[];
  createdAt: string;
  updatedAt: string;
}

interface PaginatedInsurance {
  items: InsuranceItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useInsuranceOffers(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  return useQuery<PaginatedInsurance>({
    queryKey: ['insurance', params],
    queryFn: () => apiRequest(`/insurance${qs ? `?${qs}` : ''}`),
  });
}

export function useInsuranceOffer(id: string) {
  return useQuery<InsuranceItem>({
    queryKey: ['insurance', id],
    queryFn: () => apiRequest(`/insurance/${id}`),
    enabled: !!id,
  });
}

export function useMyInsuranceOffers() {
  return useQuery<InsuranceItem[]>({
    queryKey: ['insurance', 'my'],
    queryFn: () => apiRequest('/insurance/my'),
  });
}

export function useCreateInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest<InsuranceItem>('/insurance', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurance'] }); },
  });
}

export function useUpdateInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiRequest<InsuranceItem>(`/insurance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurance'] }); },
  });
}

export function useDeleteInsurance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/insurance/${id}`, { method: 'DELETE' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['insurance'] }); },
  });
}
