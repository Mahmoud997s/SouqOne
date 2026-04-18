'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { CardSkeleton } from '@/components/loading-skeleton';
import { getImageUrl } from '@/lib/image-utils';
import type { EquipmentListingItem } from '@/lib/api/equipment';

interface EquipmentShowcaseProps {
  items: EquipmentListingItem[];
  isLoading: boolean;
}

const CONDITION_DOT: Record<string, string> = {
  NEW: 'bg-emerald-500', USED: 'bg-slate-400', REFURBISHED: 'bg-sky-500',
};

export function EquipmentShowcase({ items, isLoading }: EquipmentShowcaseProps) {
  const t = useTranslations('home');
  const tl = useTranslations('listings');
  const tc = useTranslations('categories');
  const tm = useTranslations('mappings');

  const TYPE_LABELS: Record<string, string> = {
    EQUIPMENT_SALE: tc('equipmentSale'),
    EQUIPMENT_RENT: tc('equipmentRental'),
  };

  function condLabel(c: string) {
    if (c === 'NEW') return tm('conditionNew');
    if (c === 'REFURBISHED') return tm('conditionRefurbished');
    return tm('conditionUsed');
  }

  function priceText(eq: EquipmentListingItem) {
    const cur = eq.currency === 'OMR' ? tl('currency') : eq.currency;
    if (eq.dailyPrice) return `${eq.dailyPrice} ${cur}${tl('perDay')}`;
    if (eq.monthlyPrice) return `${eq.monthlyPrice} ${cur}${tl('perMonth')}`;
    if (eq.price) return `${eq.price} ${cur}`;
    return null;
  }

  return (
    <section className="bg-surface-container-low dark:bg-surface-dim py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-wrap justify-between items-end gap-2 mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="h-6 sm:h-8 w-1 bg-primary" />
              <h2 className="text-base sm:text-xl md:text-3xl font-black">{t('latestEquipment')}</h2>
            </div>
            <p className="text-on-surface-variant text-xs sm:text-sm">{t('latestEquipmentDesc')}</p>
          </div>
          <Link href="/equipment" className="text-primary font-bold text-xs sm:text-sm hover:underline transition-colors">
            {t('viewAll')}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            {items.map((eq) => {
              const img = eq.images?.[0];
              const imgUrl = getImageUrl(img?.url);
              const pt = priceText(eq);
              return (
                <Link key={eq.id} href={`/equipment/${eq.id}`} className="group h-full flex flex-col bg-surface-container-lowest dark:bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300">
                  {/* ── Image ── */}
                  <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={eq.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 50vw, (max-width:1024px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl sm:text-5xl text-on-surface-variant/20">construction</span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                    {/* أعلى يسار: نوع الإعلان */}
                    <span className="absolute top-2 left-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
                      {TYPE_LABELS[eq.listingType] || eq.listingType}
                    </span>

                    {/* أعلى يمين: الحالة (نقطة + label) */}
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${CONDITION_DOT[eq.condition] || 'bg-slate-400'}`} />
                      {condLabel(eq.condition)}
                    </span>

                    {/* أسفل يمين: السعر */}
                    {pt && (
                      <div className="absolute bottom-2 right-2">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-black bg-primary text-on-primary shadow-sm">
                          {pt}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Body ── */}
                  <div className="p-2 sm:p-3 flex-1 flex flex-col gap-1">
                    <h3 className="font-black text-xs sm:text-sm text-on-surface leading-snug line-clamp-1">{eq.title}</h3>

                    {/* Meta: make model year · location */}
                    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] text-on-surface-variant leading-none">
                      <span className="truncate">
                        {[eq.make, eq.model, eq.year].filter(Boolean).join(' ')}
                      </span>
                      {eq.governorate && (
                        <>
                          <span className="text-outline-variant/40 mx-0.5">·</span>
                          <span className="material-symbols-outlined text-[10px]">location_on</span>
                          <span className="truncate">{eq.governorate}</span>
                        </>
                      )}
                    </div>

                    {/* Meta tags — ordered by importance */}
                    <div className="flex items-center flex-wrap gap-x-1.5 text-[8px] sm:text-[10px] text-on-surface-variant">
                      {eq.user?.isVerified && (
                        <span className="inline-flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                          {tl('verified')}
                        </span>
                      )}
                      {eq.user?.isVerified && (eq.withOperator || eq.hoursUsed || eq.isPriceNegotiable) && (
                        <span className="text-outline-variant/40">·</span>
                      )}
                      {eq.withOperator && (
                        <span>{tl('withOperator')}</span>
                      )}
                      {eq.withOperator && (eq.hoursUsed || eq.isPriceNegotiable) && (
                        <span className="text-outline-variant/40">·</span>
                      )}
                      {eq.hoursUsed != null && eq.hoursUsed > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">schedule</span>
                          {eq.hoursUsed.toLocaleString()} {tl('hours')}
                        </span>
                      )}
                      {eq.hoursUsed != null && eq.hoursUsed > 0 && eq.isPriceNegotiable && (
                        <span className="text-outline-variant/40">·</span>
                      )}
                      {eq.isPriceNegotiable && (
                        <span>{tl('negotiable')}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-3 block">construction</span>
            <p className="font-medium">{t('noEquipmentNow')}</p>
          </div>
        )}
      </div>
    </section>
  );
}
