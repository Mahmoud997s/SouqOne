'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useUnreadCount } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useAuthModal } from '@/providers/auth-modal-provider';
import { Navbar } from '@/components/layout/navbar';
import {
  Bell, MessageCircle, Heart, ShoppingBag, Briefcase, CheckCheck,
  ChevronLeft, ChevronRight, AlertCircle, Tag, Calendar, Loader2,
  BellOff,
} from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { PushNotificationBanner } from '@/components/push-notification-banner';
import { useTranslations, useLocale } from 'next-intl';

/* ── Icon + color config per type ── */
const TYPE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; strip: string; labelKey: string }> = {
  MESSAGE:                   { icon: <MessageCircle size={16} />, bg: 'bg-primary/10 text-primary',       strip: 'bg-primary',       labelKey: 'notifTypeMessage' },
  LISTING_SOLD:              { icon: <ShoppingBag size={16} />,   bg: 'bg-green-500/10 text-green-600',   strip: 'bg-green-500',     labelKey: 'notifTypeSold' },
  LISTING_FAVORITED:         { icon: <Heart size={16} />,         bg: 'bg-red-500/10 text-red-500',       strip: 'bg-red-500',       labelKey: 'notifTypeFavorite' },
  PRICE_DROP:                { icon: <Tag size={16} />,           bg: 'bg-orange-500/10 text-orange-500', strip: 'bg-orange-500',    labelKey: 'notifTypePriceDrop' },
  SYSTEM:                    { icon: <AlertCircle size={16} />,   bg: 'bg-gray-500/10 text-gray-500',     strip: 'bg-gray-400',      labelKey: 'notifTypeSystem' },
  BOOKING_REQUEST:           { icon: <Calendar size={16} />,      bg: 'bg-blue-500/10 text-blue-500',     strip: 'bg-blue-500',      labelKey: 'notifTypeBooking' },
  BOOKING_CONFIRMED:         { icon: <CheckCheck size={16} />,    bg: 'bg-green-500/10 text-green-600',   strip: 'bg-green-500',     labelKey: 'notifTypeBooking' },
  BOOKING_REJECTED:          { icon: <AlertCircle size={16} />,   bg: 'bg-red-500/10 text-red-500',       strip: 'bg-red-500',       labelKey: 'notifTypeBooking' },
  BOOKING_CANCELLED:         { icon: <AlertCircle size={16} />,   bg: 'bg-orange-500/10 text-orange-500', strip: 'bg-orange-500',    labelKey: 'notifTypeBooking' },
  BOOKING_COMPLETED:         { icon: <CheckCheck size={16} />,    bg: 'bg-green-500/10 text-green-600',   strip: 'bg-green-500',     labelKey: 'notifTypeBooking' },
  RETURN_REMINDER:           { icon: <Calendar size={16} />,      bg: 'bg-yellow-500/10 text-yellow-600', strip: 'bg-yellow-500',    labelKey: 'notifTypeReminder' },
  JOB_APPLICATION:           { icon: <Briefcase size={16} />,     bg: 'bg-indigo-500/10 text-indigo-500', strip: 'bg-indigo-500',    labelKey: 'notifTypeJob' },
  JOB_APPLICATION_ACCEPTED:  { icon: <CheckCheck size={16} />,    bg: 'bg-green-500/10 text-green-600',   strip: 'bg-green-500',     labelKey: 'notifTypeJob' },
  JOB_APPLICATION_REJECTED:  { icon: <AlertCircle size={16} />,   bg: 'bg-red-500/10 text-red-500',       strip: 'bg-red-500',       labelKey: 'notifTypeJob' },
};

const DEFAULT_CONFIG = { icon: <Bell size={16} />, bg: 'bg-outline/10 text-outline', strip: 'bg-gray-400', labelKey: 'notifTypeOther' };

/* ── Time ago hook ── */
function useTimeAgo() {
  const tp = useTranslations('pages');
  const locale = useLocale();
  return (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return tp('notifTimeNow');
    if (mins < 60) return tp('notifTimeMinutes', { count: mins });
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return tp('notifTimeHours', { count: hrs });
    const days = Math.floor(hrs / 24);
    if (days < 7) return tp('notifTimeDays', { count: days });
    return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US');
  };
}

/* ── Group notifications by day ── */
function useGrouped(notifications: any[], locale: string, tp: any) {
  return useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    const groups: { label: string; items: any[] }[] = [];
    const map = new Map<string, any[]>();

    for (const n of notifications) {
      const d = new Date(n.createdAt).getTime();
      let key: string;
      if (d >= today) key = tp('notifToday');
      else if (d >= yesterday) key = tp('notifYesterday');
      else key = new Date(n.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US', { day: 'numeric', month: 'long' });

      if (!map.has(key)) { map.set(key, []); groups.push({ label: key, items: map.get(key)! }); }
      map.get(key)!.push(n);
    }
    return groups;
  }, [notifications, locale, tp]);
}

/* ── Filter type ── */
type FilterTab = 'all' | 'unread';

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { openAuth } = useAuthModal();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<FilterTab>('all');
  const { data, isLoading } = useNotifications(page);
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const tp = useTranslations('pages');
  const locale = useLocale();
  const timeAgo = useTimeAgo();

  const allNotifications = data?.items ?? [];
  const meta = data?.meta;
  const unreadCount = unreadData?.count ?? 0;
  const filtered = filter === 'unread' ? allNotifications.filter((n) => !n.isRead) : allNotifications;
  const groups = useGrouped(filtered, locale, tp);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) openAuth('login');
  }, [authLoading, isAuthenticated, openAuth]);

  if (authLoading || !isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center pt-32">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </>
    );
  }

  const handleClick = (n: typeof allNotifications[0]) => {
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

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#004ac6] via-[#2563eb] to-[#0B2447]" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-20%] right-0 w-[60vw] md:w-[500px] h-[60vw] md:h-[500px] rounded-full bg-white/[0.05] blur-3xl" />
        <div className="absolute bottom-[-20%] left-0 w-[50vw] md:w-[400px] h-[50vw] md:h-[400px] rounded-full bg-blue-300/[0.08] blur-3xl" />

        <div className="relative z-10 pt-20 pb-4 sm:pt-24 sm:pb-5 md:pt-28 md:pb-6">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            {/* Title row */}
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Bell size={20} className="text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm">{tp('notifTitle')}</h1>
              {unreadCount > 0 && (
                <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-black px-2.5 py-0.5 rounded-full border border-white/20">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-white/60 text-xs text-center mb-4">
              {unreadCount > 0
                ? tp('notifUnreadSummary', { count: unreadCount })
                : tp('notifAllRead')}
            </p>

            {/* Filter bar */}
            <div className="flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-[10px] py-2">
                {(['all', 'unread'] as FilterTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                      filter === tab
                        ? 'bg-white text-primary shadow-sm'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {tab === 'all' ? tp('notifAll') : tp('notifUnread')}
                  </button>
                ))}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white transition-colors disabled:opacity-50"
                >
                  <CheckCheck size={14} />
                  {markAllRead.isPending ? tp('notifMarkingRead') : tp('notifMarkAllRead')}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="min-h-screen bg-background pb-16 px-4 pt-6">
        <div className="max-w-3xl mx-auto space-y-4">

          <PushNotificationBanner />

          {/* ── Notification List ── */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse rounded-xl bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low dark:bg-surface-container-high shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-surface-container-low dark:bg-surface-container-high rounded w-3/4" />
                    <div className="h-2.5 bg-surface-container-low dark:bg-surface-container-high rounded w-full" />
                    <div className="h-2 bg-surface-container-low dark:bg-surface-container-high rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-container-low dark:bg-surface-container-high flex items-center justify-center">
                <BellOff size={36} className="text-on-surface-variant/30" />
              </div>
              <div>
                <p className="text-on-surface font-bold text-sm">{filter === 'unread' ? tp('notifNoUnread') : tp('notifEmpty')}</p>
                <p className="text-on-surface-variant text-xs mt-1">{tp('notifEmptyDesc')}</p>
              </div>
              {filter === 'unread' && (
                <button onClick={() => setFilter('all')} className="text-primary text-xs font-bold hover:underline">
                  {tp('notifShowAll')}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <span className="text-xs font-black text-on-surface-variant/70 uppercase tracking-wider">{group.label}</span>
                    <div className="flex-1 h-px bg-outline-variant/15" />
                    <span className="text-[10px] text-on-surface-variant/40 font-medium">{group.items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {group.items.map((n) => {
                      const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
                      return (
                        <button
                          key={n.id}
                          onClick={() => handleClick(n)}
                          className={`w-full relative flex items-start gap-3 p-3.5 sm:p-4 text-start rounded-xl overflow-hidden border transition-all duration-200 group/item hover:shadow-lg hover:shadow-black/[0.05] hover:-translate-y-0.5 ${
                            !n.isRead
                              ? 'bg-surface-container-lowest dark:bg-surface-container border-outline-variant/20'
                              : 'bg-surface-container-lowest dark:bg-surface-container border-outline-variant/10 hover:border-outline-variant/20'
                          }`}
                        >
                          {/* Colored side strip for unread */}
                          {!n.isRead && (
                            <div className={`absolute top-0 bottom-0 start-0 w-1 ${cfg.strip}`} />
                          )}

                          {/* Icon */}
                          <div className={`mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-110 ${cfg.bg}`}>
                            {cfg.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[13px] font-bold leading-tight ${!n.isRead ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                                {n.title}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cfg.bg}`}>
                                {tp(cfg.labelKey)}
                              </span>
                              {!n.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                              )}
                            </div>
                            <p className={`text-xs mt-1 line-clamp-2 leading-relaxed ${!n.isRead ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}>{n.body}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-on-surface-variant/50 font-medium">
                                <Calendar size={10} className="opacity-50" />
                                {timeAgo(n.createdAt)}
                              </span>
                              <span className="text-on-surface-variant/20">·</span>
                              <span className="text-[10px] text-primary/60 font-bold group-hover/item:text-primary transition-colors">
                                {tp('notifViewDetails')}
                              </span>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ChevronLeft size={16} className="shrink-0 mt-3 text-on-surface-variant/20 group-hover/item:text-primary group-hover/item:rtl:-translate-x-1 group-hover/item:ltr:translate-x-1 transition-all rtl:rotate-0 ltr:rotate-180" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 hover:border-primary/30 hover:text-primary disabled:opacity-30 transition-all"
              >
                <ChevronRight size={16} />
              </button>
              {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                      page === p
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 hover:border-primary/30 hover:text-primary disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
