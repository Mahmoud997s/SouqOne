/**
 * Price card component (desktop sticky sidebar).
 * Shows price, quick info, CTA buttons, and seller mini-card.
 */

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Phone, MessageCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { UnifiedListing } from '../types/unified.types';
import { getSaleConfig } from '../config/specs.config';

interface PriceCardProps {
  listing: UnifiedListing;
  onMessage: () => void;
  onWhatsApp: () => void;
  onCall?: () => void;
  onReport: () => void;
}

function formatRelativeTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return locale === 'ar' ? 'اليوم' : 'Today';
  if (diffDays === 1) return locale === 'ar' ? 'أمس' : 'Yesterday';
  if (diffDays < 7) return locale === 'ar' ? `منذ ${diffDays} أيام` : `${diffDays} days ago`;
  if (diffDays < 30) return locale === 'ar' ? `منذ ${Math.floor(diffDays / 7)} أسابيع` : `${Math.floor(diffDays / 7)} weeks ago`;
  return locale === 'ar' ? `منذ ${Math.floor(diffDays / 30)} شهر` : `${Math.floor(diffDays / 30)} months ago`;
}

export const PriceCard = memo(function PriceCard({
  listing,
  onMessage,
  onWhatsApp,
  onCall,
  onReport,
}: PriceCardProps) {
  const ts = useTranslations('sale');
  const locale = useLocale();
  const { seller, type } = listing;
  const config = getSaleConfig(ts)[type];

  const infoRows = [
    { label: ts('infoType'), value: config.displayName },
    { label: ts('infoCondition'), value: listing.condition },
    { label: ts('infoGovernorate'), value: listing.governorate },
    { label: ts('infoViews'), value: ts('views', { count: listing.views }) },
    { label: ts('infoPublishDate'), value: formatRelativeTime(listing.createdAt, locale) },
  ];

  const hasPhone = Boolean(seller.phone);
  const hasWhatsApp = Boolean(seller.whatsapp);

  return (
    <div className="hidden lg:block sticky top-5">
      <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <div className="h-[3px] w-full bg-primary" />
        <div className="p-5">
          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[26px] font-bold text-on-surface">
                {listing.price.toLocaleString('en-US')}
              </span>
              <span className="text-[13px] text-on-surface-variant">{listing.currency}</span>
            </div>
            {listing.negotiable && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] px-2 py-0.5 rounded-full mt-1 border border-emerald-100">
                {ts('negotiableLabel')}
              </span>
            )}
          </div>

          {/* Info rows */}
          <div className="mb-4 flex flex-col gap-2.5">
            {infoRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-on-surface">{row.label}</span>
                <span className="text-on-surface-variant">{row.value}</span>
              </div>
            ))}
          </div>

          <hr className="border-t border-outline-variant/15 my-4" />

          {/* CTA buttons */}
          <div className="space-y-2.5">
            <button
              onClick={onMessage}
              className="w-full h-12 rounded-xl bg-primary text-on-primary text-[14px] font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all duration-150 shadow-sm"
            >
              <MessageCircle size={18} />
              {ts('contactWithSeller')}
            </button>

            {hasWhatsApp && (
              <button
                onClick={onWhatsApp}
                className="w-full h-11 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 transition-colors"
              >
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {ts('whatsapp')}
              </button>
            )}

            {hasPhone && onCall && (
              <button
                onClick={onCall}
                className="w-full h-11 rounded-xl border border-outline-variant/30 text-on-surface text-[13px] font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Phone size={16} />
                {ts('call')}
              </button>
            )}
          </div>

          {/* Seller mini-card */}
          <div className="pt-4 border-t border-outline-variant/15 mt-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/20 bg-surface-container-high flex items-center justify-center flex-shrink-0">
                {seller.image ? (
                  <Image
                    src={seller.image}
                    alt={seller.name}
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{seller.name[0]?.toUpperCase()}</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-[13px] font-semibold text-on-surface truncate">{seller.name}</p>
                  {seller.verified && (
                    <span
                      className="material-symbols-outlined text-primary text-sm flex-shrink-0"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      verified
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {seller.verified ? ts('verifiedSeller') : ts('seller')} · {seller.governorate || ts('country')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant mb-3">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">visibility</span>
                {ts('views', { count: listing.views })}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {formatRelativeTime(listing.createdAt, locale)}
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {ts('statusActive')}
              </span>
            </div>
            <div className="text-center">
              <button
                onClick={onReport}
                className="text-[10px] text-on-surface-variant hover:text-error cursor-pointer underline underline-offset-2 transition-colors"
              >
                {ts('reportListing')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
