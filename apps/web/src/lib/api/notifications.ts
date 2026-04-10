import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../auth';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, any> | null;
  isRead: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  items: NotificationItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export function useNotifications(page = 1) {
  return useQuery<PaginatedNotifications>({
    queryKey: ['notifications', page],
    queryFn: () => apiRequest<PaginatedNotifications>(`/notifications?page=${page}&limit=20`),
  });
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: ['unread-count'],
    queryFn: () => apiRequest<{ count: number }>('/notifications/unread-count'),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiRequest('/notifications/read-all', { method: 'PATCH' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}
