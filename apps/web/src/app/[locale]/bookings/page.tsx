'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { useMyBookings, useReceivedBookings, useUpdateBookingStatus } from '@/lib/api';
import type { BookingItem } from '@/lib/api';
import { useToast } from '@/components/toast';
import { getImageUrl } from '@/lib/image-utils';
import { bookingStatusLabels, BOOKING_STATUS_COLORS } from '@/lib/constants/mappings';
import { useTranslations, useLocale } from 'next-intl';

const statusColors = BOOKING_STATUS_COLORS;

const statusFilters = ['', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

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
  const { addToast } = useToast();
  const updateStatus = useUpdateBookingStatus();
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const statusLabels = bookingStatusLabels(tm);

  const tabs = [
    { key: 'my' as const, label: tp('bookingsTabMy'), icon: 'car_rental' },
    { key: 'received' as const, label: tp('bookingsTabReceived'), icon: 'inbox' },
  ];

  const myParams = statusFilter ? { status: statusFilter } : undefined;
  const { data: myData, isLoading: myLoading } = useMyBookings(activeTab === 'my' ? myParams : undefined);
  const { data: receivedData, isLoading: receivedLoading } = useReceivedBookings(activeTab === 'received' ? myParams : undefined);

  const data = activeTab === 'my' ? myData : receivedData;
  const isLoading = activeTab === 'my' ? myLoading : receivedLoading;
  const items = data?.items ?? [];

  async function handleStatusChange(bookingId: string, status: string) {
    try {
      await updateStatus.mutateAsync({ id: bookingId, status });
      addToast('success', tp('bookingsStatusUpdated'));
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : tp('bookingsError'));
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-6">
        <h1 className="text-3xl font-black mb-6">
          <span className="material-symbols-outlined text-primary align-middle text-3xl ms-2">event</span>
          {tp('bookingsPageTitle')}
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setStatusFilter(''); }}
              className={`flex items-center gap-2 px-5 py-3 font-black text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-on-surface text-surface'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status filter chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {statusFilters.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2.5 min-h-[44px] text-xs font-black transition-all ${
                statusFilter === s
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {s ? statusLabels[s] : tp('bookingsFilterAll')}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-lowest border border-outline-variant/10 p-6 animate-pulse h-32" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">event_busy</span>
            <p className="text-xl font-bold text-on-surface mb-2">{tp('bookingsEmptyTitle')}</p>
            <p className="text-on-surface-variant mb-6">
              {activeTab === 'my' ? tp('bookingsEmptyMy') : tp('bookingsEmptyReceived')}
            </p>
            {activeTab === 'my' && (
              <Link href="/rentals" className="bg-primary text-on-primary px-6 py-3 text-sm font-black hover:brightness-110 transition-colors">
                {tp('bookingsBrowseRentals')}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                type={activeTab}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatus.isPending}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function BookingRow({
  booking,
  type,
  onStatusChange,
  isUpdating,
}: {
  booking: BookingItem;
  type: 'my' | 'received';
  onStatusChange: (id: string, status: string) => void;
  isUpdating: boolean;
}) {
  const tp = useTranslations('pages');
  const tm = useTranslations('mappings');
  const locale = useLocale();
  const statusLabels = bookingStatusLabels(tm);
  const img = booking.listing?.images?.find((i: any) => i.isPrimary) ?? booking.listing?.images?.[0];
  const otherUser = type === 'my' ? booking.owner : booking.renter;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center shadow-sm hover:shadow-md transition-shadow">
      {/* Car image */}
      <Link href={`/bookings/${booking.id}`} className="shrink-0">
        <div className="w-24 h-18 md:w-32 md:h-20 overflow-hidden bg-surface-container-low">
          {getImageUrl(img?.url) ? (
            <img src={getImageUrl(img?.url)!} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined">car_rental</span>
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/bookings/${booking.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-on-surface text-sm line-clamp-1">{booking.listing?.title ?? tp('bookingsBooking')}</h3>
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            {new Date(booking.startDate).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')} — {new Date(booking.endDate).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')}
          </span>
          <span>{tp('bookingsDays', { count: booking.totalDays })}</span>
          {otherUser && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">person</span>
              {otherUser.displayName || otherUser.username}
            </span>
          )}
        </div>
      </div>

      {/* Price + Status */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <span className="font-black text-primary text-lg">
          {Number(booking.totalPrice).toLocaleString('en-US')} <small className="text-xs font-medium text-on-surface-variant">{tp('bookingsCurrencyOMR')}</small>
        </span>
        <span className={`px-3 py-1 text-xs font-black ${statusColors[booking.status] ?? 'bg-surface-container text-on-surface-variant'}`}>
          {statusLabels[booking.status] ?? booking.status}
        </span>
      </div>

      {/* Actions (owner only for received bookings) */}
      {type === 'received' && booking.status === 'PENDING' && (
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onStatusChange(booking.id, 'CONFIRMED')}
            disabled={isUpdating}
            className="bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-600 transition-colors disabled:opacity-60"
          >
            {tp('bookingsAccept')}
          </button>
          <button
            onClick={() => onStatusChange(booking.id, 'REJECTED')}
            disabled={isUpdating}
            className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
          >
            {tp('bookingsReject')}
          </button>
        </div>
      )}
      {type === 'received' && booking.status === 'CONFIRMED' && (
        <button
          onClick={() => onStatusChange(booking.id, 'ACTIVE')}
          disabled={isUpdating}
          className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 shrink-0"
        >
          {tp('bookingsActivate')}
        </button>
      )}
      {type === 'received' && booking.status === 'ACTIVE' && (
        <button
          onClick={() => onStatusChange(booking.id, 'COMPLETED')}
          disabled={isUpdating}
          className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-bold hover:brightness-110 transition-colors disabled:opacity-60 shrink-0"
        >
          {tp('bookingsComplete')}
        </button>
      )}
      {type === 'my' && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
        <button
          onClick={() => onStatusChange(booking.id, 'CANCELLED')}
          disabled={isUpdating}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors disabled:opacity-60 shrink-0"
        >
          {tp('bookingsCancel')}
        </button>
      )}
    </div>
  );
}
