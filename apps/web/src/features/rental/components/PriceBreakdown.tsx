'use client';

import { useTranslations } from 'next-intl';
import { diffDays } from '../utils/date-helpers';

// ─── Types ────────────────────────────────────────────────────────────────────

type PricingTab = 'daily' | 'weekly' | 'monthly';

export interface PriceBreakdownProps {
  checkIn: Date;
  checkOut: Date;
  dailyPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  currency: string;
  activeTab: PricingTab;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PriceBreakdown({
  checkIn, checkOut,
  dailyPrice, weeklyPrice, monthlyPrice,
  currency, activeTab,
}: PriceBreakdownProps) {
  const tr = useTranslations('rental');
  const nights = diffDays(checkIn, checkOut);
  if (nights <= 0) return null;

  let subtotal = 0;
  let breakdown = '';

  if (activeTab === 'monthly' && monthlyPrice) {
    const months = Math.floor(nights / 30);
    const rem = nights % 30;
    subtotal = months * monthlyPrice + rem * (dailyPrice ?? 0);
    if (months > 0) {
      breakdown = `${monthlyPrice.toLocaleString('en-US')} × ${months} ${tr('breakdownMonth')}`;
      if (rem > 0 && dailyPrice) breakdown += ` + ${dailyPrice.toLocaleString('en-US')} × ${rem} ${tr('breakdownDay')}`;
    } else {
      breakdown = `${(dailyPrice ?? 0).toLocaleString('en-US')} × ${rem} ${tr('breakdownDay')}`;
    }
  } else if (activeTab === 'weekly' && weeklyPrice) {
    const weeks = Math.floor(nights / 7);
    const rem = nights % 7;
    subtotal = weeks * weeklyPrice + rem * (dailyPrice ?? 0);
    breakdown = `${weeklyPrice.toLocaleString('en-US')} × ${weeks} ${tr('breakdownWeek')}`;
    if (rem > 0 && dailyPrice) breakdown += ` + ${dailyPrice.toLocaleString('en-US')} × ${rem} ${tr('breakdownDay')}`;
  } else {
    subtotal = nights * (dailyPrice ?? 0);
    breakdown = `${(dailyPrice ?? 0).toLocaleString('en-US')} × ${nights} ${tr('breakdownDay')}`;
  }

  if (subtotal <= 0) return null;

  return (
    <div className="flex flex-col gap-2 text-[13px] mt-4 animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="flex items-center justify-between">
        <span className="text-on-surface-variant">{breakdown}</span>
        <span className="text-on-surface">{subtotal.toLocaleString('en-US')} {currency}</span>
      </div>
      <hr className="border-outline-variant/20 my-1" />
      <div className="flex items-center justify-between font-medium">
        <span className="text-on-surface">{tr('breakdownTotal')}</span>
        <span className="text-on-surface">{subtotal.toLocaleString('en-US')} {currency}</span>
      </div>
    </div>
  );
}
