// ──────────────────────────────────────
// أنواع الإشعارات
// ──────────────────────────────────────

export enum NotificationType {
  MESSAGE = 'MESSAGE',
  LISTING_SOLD = 'LISTING_SOLD',
  LISTING_FAVORITED = 'LISTING_FAVORITED',
  PRICE_DROP = 'PRICE_DROP',
  SYSTEM = 'SYSTEM',
}

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  userId: string;
  createdAt: Date;
}
