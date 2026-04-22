'use client';

import { useTranslations } from 'next-intl';

// ─── Types ────────────────────────────────────────────────────────────────────────────

type PricingTab = 'daily' | 'weekly' | 'monthly';

export interface PricingTabsProps {
  dailyPrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  activeTab: PricingTab;
  onTabChange: (tab: PricingTab) => void;
  currency: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PricingTabs({
  dailyPrice, weeklyPrice, monthlyPrice,
  activeTab, onTabChange, currency,
}: PricingTabsProps) {
  const tr = useTranslations('rental');
  const allTabs: { key: PricingTab; label: string; price: number }[] = [];
  if (dailyPrice != null)   allTabs.push({ key: 'daily',   label: tr('pricingDaily'),   price: dailyPrice });
  if (weeklyPrice != null)  allTabs.push({ key: 'weekly',  label: tr('pricingWeekly'), price: weeklyPrice });
  if (monthlyPrice != null) allTabs.push({ key: 'monthly', label: tr('pricingMonthly'),   price: monthlyPrice });

  if (allTabs.length === 0) return null;

  if (allTabs.length === 1) {
    const t = allTabs[0];
    return (
      <div className="flex flex-col items-center py-2.5 rounded-xl border-2 border-primary bg-primary/5">
        <span className="text-[10px] text-primary font-medium">{t.label}</span>
        <span className="text-[14px] font-semibold text-primary">{t.price.toLocaleString('en-US')} {currency}</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {allTabs.map(t => {
        const isActive = activeTab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onTabChange(t.key)}
            className={
              isActive
                ? 'flex-1 flex flex-col items-center py-2.5 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer transition-colors'
                : 'flex-1 flex flex-col items-center py-2.5 rounded-xl border border-outline-variant hover:border-primary/40 cursor-pointer transition-colors'
            }
          >
            <span className={isActive ? 'text-[10px] text-primary font-medium' : 'text-[10px] text-on-surface-variant'}>
              {t.label}
            </span>
            <span className={isActive ? 'text-[14px] font-semibold text-primary' : 'text-[13px] font-medium text-on-surface'}>
              {t.price.toLocaleString('en-US')} {currency}
            </span>
          </button>
        );
      })}
    </div>
  );
}
