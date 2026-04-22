'use client';

import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { useMyBookings, useReceivedBookings, useUpdateBookingStatus, getBookingEntity } from '@/lib/api';
import type { BookingItem } from '@/lib/api';
import { useToast } from '@/components/toast';
import { getImageUrl } from '@/lib/image-utils';
import { bookingStatusLabels, cancelLabels as cancelLabelsMap } from '@/lib/constants/mappings';
import { useTranslations, useLocale } from 'next-intl';
import { CalendarDays, Plane, CalendarX, User, AlertTriangle, X, Loader2, Info } from 'lucide-react';

// ─── Date formatting helper (no date-fns) ───
function formatShortDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US', {
    day: 'numeric', month: 'short',
  });
}
// ─── Status badge config ───
const STATUS_BADGE_CLS: Record<string, string> = {
  PENDING:   'bg-amber-100 text-amber-800 border border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border border-blue-200',
  ACTIVE:    'bg-green-100 text-green-800 border border-green-200',
  COMPLETED: 'bg-surface-container text-on-surface-variant border border-outline-variant/20',
  CANCELLED: 'bg-red-100 text-red-800 border border-red-200',
  REJECTED:  'bg-red-100 text-red-800 border border-red-200',
};

const STATUS_FILTER_KEYS = ['', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;

const STATUS_FILTER_LABELS: Record<string, string> = {
  '': 'bookingsFilterAll',
  PENDING: 'bookingsFilterPending',
  CONFIRMED: 'bookingsFilterConfirmed',
  ACTIVE: 'bookingsFilterActive',
  COMPLETED: 'bookingsFilterCompleted',
  CANCELLED: 'bookingsFilterCancelled',
};

// ─── Time grouping ───
function groupBookings(items: BookingItem[]): { upcoming: BookingItem[]; current: BookingItem[]; past: BookingItem[] } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const upcoming: BookingItem[] = [];
  const current: BookingItem[] = [];
  const past: BookingItem[] = [];
  for (const b of items) {
    const start = new Date(b.startDate);
    const end = new Date(b.endDate);
    if (start > today) upcoming.push(b);
    else if (end < today) past.push(b);
    else current.push(b);
  }
  return { upcoming, current, past };
}

// ═══════════════════════════════════════
// CANCEL CONFIRMATION MODAL
// ═══════════════════════════════════════
function CancelModal({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isCancelling,
}: {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCancelling: boolean;
}) {
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const cancelPolicyLabels = cancelLabelsMap(tm);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-surface-container-lowest rounded-t-3xl md:rounded-2xl p-6 w-full md:max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <AlertTriangle size={32} className="text-amber-500 mb-3" />
        <h3 className="text-[18px] font-medium text-on-surface">{tp('bookingsCancelTitle')}</h3>
        <p className="text-[13px] text-on-surface-variant mt-2 leading-relaxed">{tp('bookingsCancelBody')}</p>

        {booking.cancellationPolicy && (
          <div className="bg-surface-container rounded-xl p-3 mt-4 text-[12px] text-on-surface-variant border border-outline-variant/20">
            {tp('bookingsCancelPolicy', { policy: cancelPolicyLabels[booking.cancellationPolicy] || booking.cancellationPolicy })}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-outline-variant/30 text-[14px] text-on-surface hover:bg-surface-container transition-colors"
          >
            {tp('bookingsCancelBack')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isCancelling}
            className="flex-1 h-11 rounded-xl bg-red-500 text-white text-[14px] hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isCancelling && <Loader2 size={14} className="animate-spin" />}
            {isCancelling ? tp('bookingsCancelling') : tp('bookingsCancelConfirm')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// BOOKING DETAIL DRAWER
// ═══════════════════════════════════════
function DetailDrawer({
  booking,
  isOpen,
  onClose,
  type,
}: {
  booking: BookingItem | null;
  isOpen: boolean;
  onClose: () => void;
  type: 'my' | 'received';
}) {
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const locale = useLocale();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const entity = getBookingEntity(booking);
  const entityImg = entity.images?.find((i: { isPrimary?: boolean }) => i.isPrimary) ?? entity.images?.[0];
  const statusLabels = bookingStatusLabels(tm);
  const otherUser = type === 'my' ? booking.owner : booking.renter;
  const dailyPrice = booking.totalDays > 0 ? Number(booking.totalPrice) / booking.totalDays : null;
  const totalPrice = Number(booking.totalPrice);
  const serviceFee = dailyPrice ? Math.round(totalPrice * 0.05) : null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 right-0 left-0 md:right-4 md:left-4 md:bottom-4 bg-surface-container-lowest rounded-t-3xl md:rounded-3xl max-h-[85vh] overflow-y-auto shadow-xl">
        {/* Sticky header */}
        <div className="sticky top-0 bg-surface-container-lowest border-b border-outline-variant/15 p-5 flex items-center justify-between z-10">
          <h3 className="text-[16px] font-medium text-on-surface">{tp('bookingsDrawerTitle')}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Image + title */}
        <div className="p-5 flex gap-4 items-start">
          <div className="w-[72px] h-[72px] rounded-xl overflow-hidden bg-surface-container-low relative flex-shrink-0">
            {getImageUrl(entityImg?.url) ? (
              <Image src={getImageUrl(entityImg?.url)!} alt="" fill sizes="72px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
                <CalendarDays size={24} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-[15px] font-medium text-on-surface line-clamp-2">{entity.title || tp('bookingsBooking')}</h4>
            <span className={`inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-full mt-2 ${STATUS_BADGE_CLS[booking.status] ?? 'bg-surface-container text-on-surface-variant'}`}>
              {statusLabels[booking.status] ?? booking.status}
            </span>
          </div>
        </div>

        {/* Dates timeline */}
        <div className="mx-5 p-4 rounded-2xl bg-surface-container border border-outline-variant/15">
          <div className="flex items-center justify-between text-[12px] text-on-surface-variant">
            <span className="font-medium">{tp('bookingsPickup')}</span>
            <div className="flex-1 mx-3 border-t border-dashed border-outline-variant/30" />
            <span className="font-medium">{tp('bookingsReturn')}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[14px] font-medium text-on-surface">{formatShortDate(booking.startDate, locale)}</span>
            <span className="px-3 py-1 rounded-full bg-surface-container-lowest text-[11px] font-medium text-on-surface border border-outline-variant/15">
              {tp('bookingsDays', { count: booking.totalDays })}
            </span>
            <span className="text-[14px] font-medium text-on-surface">{formatShortDate(booking.endDate, locale)}</span>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="px-5 py-5">
          <h5 className="text-[13px] font-medium text-on-surface mb-3">{tp('bookingsPriceBreakdown')}</h5>
          <div className="space-y-2 text-[13px]">
            {dailyPrice && (
              <div className="flex justify-between text-on-surface-variant">
                <span>{tp('bookingsDailyRate', { price: dailyPrice.toLocaleString('en-US'), days: booking.totalDays })}</span>
                <span>{(dailyPrice * booking.totalDays).toLocaleString('en-US')} {tp('bookingsCurrencyOMR')}</span>
              </div>
            )}
            {serviceFee !== null && (
              <div className="flex justify-between text-on-surface-variant">
                <span>{tp('bookingsServiceFee')}</span>
                <span>{serviceFee.toLocaleString('en-US')} {tp('bookingsCurrencyOMR')}</span>
              </div>
            )}
            <div className="border-t border-outline-variant/20 pt-2 flex justify-between font-medium text-on-surface">
              <span>{tp('bookingsTotal')}</span>
              <span>{totalPrice.toLocaleString('en-US')} {tp('bookingsCurrencyOMR')}</span>
            </div>
          </div>
        </div>

        {/* Owner contact */}
        {otherUser && (
          <div className="px-5 pb-5">
            <h5 className="text-[13px] font-medium text-on-surface mb-3">{tp('bookingsOwnerInfo')}</h5>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/15">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant flex-shrink-0">
                <User size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-on-surface truncate">{otherUser.displayName || otherUser.username}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href="/messages"
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-medium hover:bg-primary/90 transition-colors"
                >
                  {tp('bookingsMessage')}
                </Link>
                {otherUser.phone && (
                  <a
                    href={`https://wa.me/${otherUser.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-green-300 text-green-700 text-[11px] font-medium hover:bg-green-50 transition-colors"
                  >
                    {tp('bookingsWhatsApp')}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="mx-5 mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-amber-800 dark:text-amber-300 leading-relaxed">{booking.notes}</p>
            </div>
          </div>
        )}

        {/* Bottom spacing for mobile */}
        <div className="h-6" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════
export default function BookingsPage() {
  return (
    <AuthGuard>
      <BookingsContent />
    </AuthGuard>
  );
}

function BookingsContent() {
  const [activeTab, setActiveTab] = useState<'my' | 'received'>('my');
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [drawerTarget, setDrawerTarget] = useState<BookingItem | null>(null);
  const { addToast } = useToast();
  const updateStatus = useUpdateBookingStatus();
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const locale = useLocale();
  const statusLabels = bookingStatusLabels(tm);

  const myParams = statusFilter ? { status: statusFilter } : undefined;
  const { data: myData, isLoading: myLoading } = useMyBookings(activeTab === 'my' ? myParams : undefined);
  const { data: receivedData, isLoading: receivedLoading } = useReceivedBookings(activeTab === 'received' ? myParams : undefined);

  const data = activeTab === 'my' ? myData : receivedData;
  const isLoading = activeTab === 'my' ? myLoading : receivedLoading;
  const items = data?.items ?? [];

  const groups = useMemo(() => groupBookings(items), [items]);

  async function handleStatusChange(bookingId: string, status: string) {
    try {
      await updateStatus.mutateAsync({ id: bookingId, status });
      addToast('success', tp('bookingsStatusUpdated'));
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : tp('bookingsError'));
    }
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    await handleStatusChange(cancelTarget.id, 'CANCELLED');
    setCancelTarget(null);
  }

  function getBookingImage(booking: BookingItem): string | null {
    const entity = getBookingEntity(booking);
    const img = entity.images?.find((i: { isPrimary?: boolean }) => i.isPrimary) ?? entity.images?.[0];
    return getImageUrl(img?.url) || null;
  }

  // ─── Render a group section ───
  function renderGroup(label: string, bookings: BookingItem[]) {
    if (bookings.length === 0) return null;
    return (
      <div key={label}>
        <h3 className="text-[13px] font-medium text-on-surface-variant uppercase tracking-wide mt-2 mb-3">{label}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {bookings.map((booking) => {
            const imgSrc = getBookingImage(booking);
            const otherUser = activeTab === 'my' ? booking.owner : booking.renter;
            const badgeCls = STATUS_BADGE_CLS[booking.status] ?? 'bg-surface-container text-on-surface-variant border border-outline-variant/20';

            return (
              <div
                key={booking.id}
                className="rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                onClick={() => setDrawerTarget(booking)}
              >
                {/* TOP — IMAGE BANNER */}
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
                  {imgSrc ? (
                    <Image src={imgSrc} alt="" fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw" className="object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                      <CalendarDays size={32} />
                    </div>
                  )}

                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                  {/* Status badge */}
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2">
                    <span className={`px-1.5 sm:px-2.5 py-0.5 rounded text-[8px] sm:text-[10px] font-bold ${badgeCls}`}>
                      {statusLabels[booking.status] ?? booking.status}
                    </span>
                  </div>

                  {/* Duration chip */}
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
                      {tp('bookingsDays', { count: booking.totalDays })}
                    </span>
                  </div>

                  {/* Price on image */}
                  <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2">
                    <span className="px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-xs font-black bg-primary text-on-primary shadow-sm">
                      {Number(booking.totalPrice).toLocaleString('en-US')} {tp('bookingsCurrencyOMR')}
                    </span>
                  </div>
                </div>

                {/* BOTTOM — CARD BODY */}
                <div className="p-2.5 sm:p-3 flex flex-col gap-1.5">
                  {/* Title */}
                  <h4 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1 text-on-surface">
                    {getBookingEntity(booking).title || tp('bookingsBooking')}
                  </h4>

                  {/* Dates + info */}
                  <div className="flex items-center gap-1 flex-wrap text-[8px] sm:text-[10px] text-on-surface-variant">
                    <span className="flex items-center gap-0.5 shrink-0">
                      <CalendarDays size={10} className="sm:w-3 sm:h-3" />
                      {formatShortDate(booking.startDate, locale)} — {formatShortDate(booking.endDate, locale)}
                    </span>
                    {otherUser && (
                      <>
                        <span className="text-outline/40">·</span>
                        <span className="flex items-center gap-0.5 shrink-0">
                          <User size={10} className="sm:w-3 sm:h-3" />
                          {otherUser.displayName || otherUser.username}
                        </span>
                      </>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                    {/* MY TAB ACTIONS */}
                    {activeTab === 'my' && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button
                        onClick={() => setCancelTarget(booking)}
                        className="px-2 sm:px-3 py-1 rounded-lg border border-red-200 text-red-600 text-[8px] sm:text-[10px] font-bold hover:bg-red-50 transition-colors"
                      >
                        {tp('bookingsCancel')}
                      </button>
                    )}
                    {activeTab === 'my' && booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => setDrawerTarget(booking)}
                        className="px-2 sm:px-3 py-1 rounded-lg bg-primary text-on-primary text-[8px] sm:text-[10px] font-bold hover:bg-primary/90 transition-colors"
                      >
                        {tp('bookingsDetails')}
                      </button>
                    )}
                    {activeTab === 'my' && booking.status === 'ACTIVE' && (
                      <button
                        onClick={() => setDrawerTarget(booking)}
                        className="px-2 sm:px-3 py-1 rounded-lg bg-primary text-on-primary text-[8px] sm:text-[10px] font-bold hover:bg-primary/90 transition-colors"
                      >
                        {tp('bookingsContactOwner')}
                      </button>
                    )}
                    {activeTab === 'my' && booking.status === 'COMPLETED' && (
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="px-2 sm:px-3 py-1 rounded-lg bg-primary text-on-primary text-[8px] sm:text-[10px] font-bold hover:bg-primary/90 transition-colors"
                      >
                        {tp('bookingsAddReview')}
                      </Link>
                    )}
                    {activeTab === 'my' && (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') && (
                      <Link
                        href={getBookingEntity(booking).detailPath}
                        className="px-2 sm:px-3 py-1 rounded-lg border border-primary/30 text-primary text-[8px] sm:text-[10px] font-bold hover:bg-primary/5 transition-colors"
                      >
                        {tp('bookingsBookAgain')}
                      </Link>
                    )}

                    {/* RECEIVED TAB ACTIONS */}
                    {activeTab === 'received' && booking.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}
                          disabled={updateStatus.isPending}
                          className="px-2 sm:px-3 py-1 rounded-lg bg-green-500 text-white text-[8px] sm:text-[10px] font-bold hover:bg-green-600 transition-colors disabled:opacity-60"
                        >
                          {tp('bookingsAccept')}
                        </button>
                        <button
                          onClick={() => handleStatusChange(booking.id, 'REJECTED')}
                          disabled={updateStatus.isPending}
                          className="px-2 sm:px-3 py-1 rounded-lg border border-red-200 text-red-600 text-[8px] sm:text-[10px] font-bold hover:bg-red-50 transition-colors disabled:opacity-60"
                        >
                          {tp('bookingsReject')}
                        </button>
                      </>
                    )}
                    {activeTab === 'received' && booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'ACTIVE')}
                        disabled={updateStatus.isPending}
                        className="px-2 sm:px-3 py-1 rounded-lg bg-primary text-on-primary text-[8px] sm:text-[10px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
                      >
                        {tp('bookingsActivate')}
                      </button>
                    )}
                    {activeTab === 'received' && booking.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusChange(booking.id, 'COMPLETED')}
                        disabled={updateStatus.isPending}
                        className="px-2 sm:px-3 py-1 rounded-lg bg-primary text-on-primary text-[8px] sm:text-[10px] font-bold hover:bg-primary/90 transition-colors disabled:opacity-60"
                      >
                        {tp('bookingsComplete')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pb-24 lg:pb-16">

        {/* ══ PREMIUM BANNER HEADER ══ */}
        <div className="relative bg-gradient-to-bl from-[#004ac6] via-[#1d4ed8] to-[#0B2447] overflow-hidden px-4 pt-8 pb-10">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h30v30H0zm30 30h30v30H30z\' fill=\'%23fff\' fill-opacity=\'.5\'/%3E%3C/svg%3E")', backgroundSize: '30px 30px' }} />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
          <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <CalendarDays size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-white leading-tight">
                {tp('bookingsPageTitle')}
              </h1>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white/15 text-[11px] font-medium text-white/90">
                {tp('bookingsPageSubtitle', { count: items.length })}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ A) MAIN TABS ═══ */}
        <div className="px-4 md:px-8 max-w-7xl mx-auto mt-4">
          <div className="flex gap-3">
            <button
              onClick={() => { setActiveTab('my'); setStatusFilter(''); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-medium transition-colors ${
                activeTab === 'my'
                  ? 'bg-on-surface text-surface'
                  : 'border border-outline-variant/30 text-on-surface hover:border-on-surface/50'
              }`}
            >
              {tp('bookingsTabMy')}
            </button>
            <button
              onClick={() => { setActiveTab('received'); setStatusFilter(''); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-medium transition-colors ${
                activeTab === 'received'
                  ? 'bg-on-surface text-surface'
                  : 'border border-outline-variant/30 text-on-surface hover:border-on-surface/50'
              }`}
            >
              {tp('bookingsTabReceived')}
            </button>
          </div>

          {/* ═══ B) STATUS FILTER BAR ═══ */}
          <div className="flex flex-wrap gap-2 mt-4">
            {STATUS_FILTER_KEYS.map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium flex-shrink-0 transition-colors ${
                  statusFilter === s
                    ? 'bg-primary text-on-primary'
                    : 'border border-outline-variant/20 text-on-surface-variant hover:border-primary/30 bg-surface-container-lowest cursor-pointer'
                }`}
              >
                {tp(STATUS_FILTER_LABELS[s])}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ C) CONTENT ═══ */}
        <div className="px-4 md:px-8 mt-6 max-w-7xl mx-auto pb-24">
          {isLoading ? (
            /* SKELETON */
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-xl border border-outline-variant/10 overflow-hidden bg-surface-container-lowest animate-pulse">
                  <div className="aspect-[16/10] bg-surface-container-high" />
                  <div className="p-2.5 sm:p-3 space-y-2">
                    <div className="h-3 sm:h-4 w-3/4 bg-surface-container-high rounded" />
                    <div className="h-2 sm:h-3 w-1/2 bg-surface-container rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            /* EMPTY STATE */
            statusFilter ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <CalendarX size={40} className="text-on-surface-variant/30 mb-4" />
                <h3 className="text-[15px] font-medium text-on-surface mb-2">
                  {tp('bookingsEmptyFilter', { filter: tp(STATUS_FILTER_LABELS[statusFilter]) })}
                </h3>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                <Plane size={52} className="text-on-surface-variant/30 mb-5" />
                <h3 className="text-[17px] font-medium text-on-surface mb-2">{tp('bookingsEmptyTitle')}</h3>
                <p className="text-[13px] text-on-surface-variant mb-6 max-w-xs leading-relaxed">
                  {activeTab === 'my' ? tp('bookingsEmptyMy') : tp('bookingsEmptyReceived')}
                </p>
                {activeTab === 'my' && (
                  <Link
                    href="/rentals"
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-on-primary text-[13px] font-black hover:brightness-110 transition-all"
                  >
                    {tp('bookingsBrowseRentals')}
                  </Link>
                )}
              </div>
            )
          ) : (
            /* GROUPED TRIPS LIST */
            <div className="space-y-8">
              {renderGroup(tp('bookingsGroupCurrent'), groups.current)}
              {renderGroup(tp('bookingsGroupUpcoming'), groups.upcoming)}
              {renderGroup(tp('bookingsGroupPast'), groups.past)}
            </div>
          )}
        </div>
      </div>
      <Footer />

      {/* Cancel Modal */}
      <CancelModal
        booking={cancelTarget}
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        isCancelling={updateStatus.isPending}
      />

      {/* Detail Drawer */}
      <DetailDrawer
        booking={drawerTarget}
        isOpen={!!drawerTarget}
        onClose={() => setDrawerTarget(null)}
        type={activeTab}
      />
    </>
  );
}
