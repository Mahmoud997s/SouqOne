import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  type: 'FEATURED' | 'SUBSCRIPTION';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  entityType?: string;
  entityId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface SubscriptionItem {
  id: string;
  plan: 'BASIC' | 'PRO' | 'ENTERPRISE';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
}

export interface PlanInfo {
  plan: string;
  price: number;
  priceLabel: string;
  listings: number;
  featured: number;
  priority: boolean;
}

export function usePlans() {
  return useQuery<PlanInfo[]>({
    queryKey: ['plans'],
    queryFn: () => apiRequest('/payments/plans'),
  });
}

export function useMySubscription() {
  return useQuery<SubscriptionItem | null>({
    queryKey: ['subscription', 'my'],
    queryFn: () => apiRequest('/payments/subscription'),
  });
}

export function useMyPayments() {
  return useQuery<{ items: PaymentItem[]; meta: any }>({
    queryKey: ['payments', 'my'],
    queryFn: () => apiRequest('/payments/my'),
  });
}

export function useCreateFeaturedPayment() {
  return useMutation({
    mutationFn: (data: { entityType: string; entityId: string }) =>
      apiRequest<{ checkoutUrl: string; paymentId: string }>('/payments/featured', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useCreateSubscriptionPayment() {
  return useMutation({
    mutationFn: (data: { plan: 'PRO' | 'ENTERPRISE' }) =>
      apiRequest<{ checkoutUrl: string; paymentId: string }>('/payments/subscribe', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

export function useVerifyPayment(sessionId: string | null) {
  return useQuery<{ status: string; paymentId: string }>({
    queryKey: ['payment', 'verify', sessionId],
    queryFn: () => apiRequest(`/payments/verify/${sessionId}`),
    enabled: !!sessionId,
    retry: 2,
    staleTime: Infinity,
  });
}

export function useCancelSubscription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest('/payments/subscription/cancel', { method: 'POST' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}
