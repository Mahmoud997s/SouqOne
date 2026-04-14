import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  entityType: string;
  entityId: string;
  reviewerId: string;
  revieweeId: string;
  reviewer: { id: string; username: string; displayName?: string; avatarUrl?: string };
  reply?: { id: string; body: string; createdAt: string };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
  distribution: Record<number, number>;
}

interface PaginatedReviews {
  items: ReviewItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useReviews(params?: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return useQuery<PaginatedReviews>({
    queryKey: ['reviews', params],
    queryFn: () => apiRequest(`/reviews?${qs}`),
    enabled: !!params,
  });
}

export function useReviewSummary(userId?: string) {
  return useQuery<ReviewSummary>({
    queryKey: ['reviews', 'summary', userId],
    queryFn: () => apiRequest(`/reviews/summary/${userId}`),
    enabled: !!userId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { rating: number; comment?: string; entityType: string; entityId: string; revieweeId: string }) =>
      apiRequest<ReviewItem>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

export function useReplyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, body }: { reviewId: string; body: string }) =>
      apiRequest(`/reviews/${reviewId}/reply`, { method: 'POST', body: JSON.stringify({ body }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
