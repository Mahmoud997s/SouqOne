'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useUnreadCount } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { Navbar } from '@/components/layout/navbar';
import {
  Bell, MessageCircle, Heart, ShoppingBag, Briefcase, CheckCheck,
  ChevronLeft, ChevronRight, AlertCircle, Tag, Calendar, Loader2,
} from 'lucide-react';
import { Footer } from '@/components/layout/footer';

const ICON_MAP: Record<string, React.ReactNode> = {
  MESSAGE: <MessageCircle size={18} className="text-primary" />,
  LISTING_SOLD: <ShoppingBag size={18} className="text-green-600" />,
  LISTING_FAVORITED: <Heart size={18} className="text-red-500" />,
  PRICE_DROP: <Tag size={18} className="text-orange-500" />,
  SYSTEM: <AlertCircle size={18} className="text-gray-500" />,
  BOOKING_REQUEST: <Calendar size={18} className="text-blue-500" />,
  BOOKING_CONFIRMED: <CheckCheck size={18} className="text-green-600" />,
  BOOKING_REJECTED: <AlertCircle size={18} className="text-red-500" />,
  BOOKING_CANCELLED: <AlertCircle size={18} className="text-orange-500" />,
  BOOKING_COMPLETED: <CheckCheck size={18} className="text-green-600" />,
  RETURN_REMINDER: <Calendar size={18} className="text-yellow-600" />,
  JOB_APPLICATION: <Briefcase size={18} className="text-indigo-500" />,
  JOB_APPLICATION_ACCEPTED: <CheckCheck size={18} className="text-green-600" />,
  JOB_APPLICATION_REJECTED: <AlertCircle size={18} className="text-red-500" />,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'الآن';
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `منذ ${hrs} ساعة`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return new Date(dateStr).toLocaleDateString('ar-OM');
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNotifications(page);
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-32">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </>
    );
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push(`/login?returnUrl=${encodeURIComponent('/notifications')}`);
  }, [authLoading, isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-32">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </>
    );
  }

  const notifications = data?.items ?? [];
  const meta = data?.meta;
  const unreadCount = unreadData?.count ?? 0;

  const handleClick = (n: typeof notifications[0]) => {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.type === 'MESSAGE' && n.data?.conversationId) {
      router.push(`/messages/${n.data.conversationId}`);
    } else if (n.type.startsWith('BOOKING') && n.data?.bookingId) {
      router.push(`/bookings`);
    } else if (n.type.startsWith('JOB') && n.data?.jobId) {
      router.push(`/jobs/${n.data.jobId}`);
    } else if (n.type === 'LISTING_FAVORITED' && n.data?.listingId) {
      router.push(`/cars/${n.data.listingId}`);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-12 px-4" dir="rtl">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bell size={24} className="text-primary" />
              <h1 className="text-xl font-bold text-on-surface">الإشعارات</h1>
              {unreadCount > 0 && (
                <span className="bg-primary text-on-primary text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {markAllRead.isPending ? 'جاري...' : 'تعليم الكل كمقروء'}
              </button>
            )}
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20">
              <Bell size={48} className="mx-auto text-on-surface-variant/30 mb-4" />
              <p className="text-on-surface-variant">لا توجد إشعارات</p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest shadow-sm border border-outline-variant/20 overflow-hidden divide-y divide-outline-variant/10">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 p-4 text-right transition-colors hover:bg-surface-container ${
                    !n.isRead ? 'bg-primary/[0.03]' : ''
                  }`}
                >
                  <div className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    !n.isRead ? 'bg-primary/10' : 'bg-surface-container'
                  }`}>
                    {ICON_MAP[n.type] ?? <Bell size={18} className="text-outline" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${!n.isRead ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>
                    <span className="text-xs text-on-surface-variant/60 mt-1 block">{timeAgo(n.createdAt)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-sm text-on-surface-variant">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="p-2 rounded-lg hover:bg-surface-container disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
