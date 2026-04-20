'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CalendarDays, Loader2, MessageCircle } from 'lucide-react';
import { useCreateBooking, useBookingAvailability } from '@/lib/api';
import type { BookingEntityType } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';

type PricingTab = 'daily' | 'weekly' | 'monthly';

interface BookingCardProps {
  entityType: BookingEntityType;
  entityId: string;
  title: string;
  dailyPrice?: string | null;
  weeklyPrice?: string | null;
  monthlyPrice?: string | null;
  minRentalDays?: number | null;
  currency?: string;
  isOwner: boolean;
  onMessage?: () => void;
  isMessagePending?: boolean;
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function BookingCard({
  entityType,
  entityId,
  title,
  dailyPrice,
  weeklyPrice,
  monthlyPrice,
  minRentalDays,
  currency = 'OMR',
  isOwner,
  onMessage,
  isMessagePending,
}: BookingCardProps) {
  const tp = useTranslations('pages');
  const router = useRouter();
  const { user } = useAuth();
  const requireAuth = useRequireAuth();
  const { addToast } = useToast();
  const createBooking = useCreateBooking();
  const { data: availability } = useBookingAvailability(entityType, entityId);

  const [pricingTab, setPricingTab] = useState<PricingTab>('daily');
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [picking, setPicking] = useState<'in' | 'out'>('in');

  const daily = dailyPrice ? Number(dailyPrice) : null;
  const weekly = weeklyPrice ? Number(weeklyPrice) : null;
  const monthly = monthlyPrice ? Number(monthlyPrice) : null;

  const displayPrice = pricingTab === 'monthly' ? monthly : pricingTab === 'weekly' ? weekly : daily;
  const periodLabel = pricingTab === 'monthly' ? tp('bookingCardMonthly') : pricingTab === 'weekly' ? tp('bookingCardWeekly') : tp('bookingCardDaily');

  // Calculate total
  let totalDays = 0;
  let totalPrice = 0;
  if (checkIn && checkOut) {
    totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (totalDays > 0) {
      if (totalDays >= 30 && monthly) {
        const months = Math.floor(totalDays / 30);
        const rem = totalDays % 30;
        totalPrice = months * monthly + rem * (daily ?? 0);
      } else if (totalDays >= 7 && weekly) {
        const weeks = Math.floor(totalDays / 7);
        const rem = totalDays % 7;
        totalPrice = weeks * weekly + rem * (daily ?? 0);
      } else {
        totalPrice = totalDays * (daily ?? 0);
      }
    }
  }

  // Check if a date is booked
  function isDateBooked(d: Date): boolean {
    if (!availability) return false;
    return availability.some(b => {
      const s = new Date(b.startDate);
      const e = new Date(b.endDate);
      return d >= s && d <= e;
    });
  }

  function handleDateClick(d: Date) {
    if (isDateBooked(d)) return;
    if (picking === 'in') {
      setCheckIn(d);
      setCheckOut(null);
      setPicking('out');
    } else {
      if (checkIn && d > checkIn) {
        setCheckOut(d);
        setPicking('in');
      } else {
        setCheckIn(d);
        setCheckOut(null);
        setPicking('out');
      }
    }
  }

  function handleBook() {
    if (!checkIn || !checkOut) return;
    requireAuth(async () => {
      try {
        const booking = await createBooking.mutateAsync({
          entityType,
          entityId,
          startDate: toYMD(checkIn),
          endDate: toYMD(checkOut),
        });
        addToast('success', tp('bookingCardSuccess'));
        router.push(`/bookings/${booking.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : tp('bookingCardError'));
      }
    }, tp('bookingCardLoginRequired'));
  }

  // Mini calendar
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const startDay = calMonth.getDay();

  if (!daily && !weekly && !monthly) return null;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl overflow-hidden shadow-lg sticky top-24">
      {/* Header */}
      <div className="p-5 border-b border-outline-variant/10">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black text-on-surface">{displayPrice?.toLocaleString('en-US')}</span>
          <span className="text-sm text-on-surface-variant font-medium">{currency} / {periodLabel}</span>
        </div>
        {minRentalDays && minRentalDays > 1 && (
          <p className="text-xs text-on-surface-variant mt-1">{tp('bookingCardMinDays', { days: minRentalDays })}</p>
        )}
      </div>

      {/* Pricing tabs */}
      {(daily || weekly || monthly) && (
        <div className="flex border-b border-outline-variant/10">
          {daily && (
            <button onClick={() => setPricingTab('daily')} className={`flex-1 py-2.5 text-xs font-bold transition-colors ${pricingTab === 'daily' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {tp('bookingCardDaily')}
            </button>
          )}
          {weekly && (
            <button onClick={() => setPricingTab('weekly')} className={`flex-1 py-2.5 text-xs font-bold transition-colors ${pricingTab === 'weekly' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {tp('bookingCardWeekly')}
            </button>
          )}
          {monthly && (
            <button onClick={() => setPricingTab('monthly')} className={`flex-1 py-2.5 text-xs font-bold transition-colors ${pricingTab === 'monthly' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
              {tp('bookingCardMonthly')}
            </button>
          )}
        </div>
      )}

      {/* Date pickers */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => setPicking('in')}
            className={`p-3 rounded-xl border text-start ${picking === 'in' ? 'border-primary bg-primary/5' : 'border-outline-variant/20'}`}
          >
            <span className="text-[10px] text-on-surface-variant font-bold block">{tp('bookingCardCheckIn')}</span>
            <span className="text-sm font-bold text-on-surface">{checkIn ? toYMD(checkIn) : '—'}</span>
          </button>
          <button
            onClick={() => setPicking('out')}
            className={`p-3 rounded-xl border text-start ${picking === 'out' ? 'border-primary bg-primary/5' : 'border-outline-variant/20'}`}
          >
            <span className="text-[10px] text-on-surface-variant font-bold block">{tp('bookingCardCheckOut')}</span>
            <span className="text-sm font-bold text-on-surface">{checkOut ? toYMD(checkOut) : '—'}</span>
          </button>
        </div>

        {/* Mini calendar */}
        <div className="grid grid-cols-7 gap-1 text-center mb-4">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-on-surface-variant py-1">{d}</span>
          ))}
          {Array.from({ length: startDay }).map((_, i) => <span key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = new Date(calMonth.getFullYear(), calMonth.getMonth(), i + 1);
            const isPast = d < today;
            const booked = isDateBooked(d);
            const isStart = checkIn && d.getTime() === checkIn.getTime();
            const isEnd = checkOut && d.getTime() === checkOut.getTime();
            const inRange = checkIn && checkOut && d > checkIn && d < checkOut;

            return (
              <button
                key={i}
                disabled={isPast || booked}
                onClick={() => handleDateClick(d)}
                className={`w-8 h-8 rounded-full text-xs font-bold transition-all mx-auto
                  ${isPast ? 'text-on-surface-variant/30 cursor-not-allowed' : ''}
                  ${booked ? 'bg-red-100 text-red-400 line-through cursor-not-allowed' : ''}
                  ${isStart || isEnd ? 'bg-primary text-on-primary' : ''}
                  ${inRange ? 'bg-primary/10 text-primary' : ''}
                  ${!isPast && !booked && !isStart && !isEnd && !inRange ? 'hover:bg-surface-container text-on-surface' : ''}
                `}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Total */}
        {totalDays > 0 && totalPrice > 0 && (
          <div className="flex justify-between items-center p-3 rounded-xl bg-surface-container mb-4">
            <span className="text-xs text-on-surface-variant">{totalDays} {tp('bookingCardDaysLabel')}</span>
            <span className="font-black text-on-surface">{totalPrice.toLocaleString('en-US')} {currency}</span>
          </div>
        )}

        {/* Book button */}
        {!isOwner && (
          <button
            onClick={handleBook}
            disabled={!checkIn || !checkOut || createBooking.isPending}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-black text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createBooking.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CalendarDays size={16} />
            )}
            {tp('bookingCardBookNow')}
          </button>
        )}

        {isOwner && (
          <div className="text-center py-3 text-xs text-on-surface-variant font-medium">
            {tp('bookingCardOwnListing')}
          </div>
        )}

        {/* Message button */}
        {onMessage && !isOwner && (
          <button
            onClick={onMessage}
            disabled={isMessagePending}
            className="w-full mt-3 py-3 rounded-xl border border-outline-variant/20 text-on-surface font-bold text-sm hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={16} />
            {tp('bookingCardMessage')}
          </button>
        )}
      </div>
    </div>
  );
}
