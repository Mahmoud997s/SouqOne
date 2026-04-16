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

const TYPE_COLORS: Record<string, string> = {
  SALE: 'bg-blue-600',
  RENTAL: 'bg-violet-600',
};

export function EquipmentShowcase({ items, isLoading }: EquipmentShowcaseProps) {
  const t = useTranslations('home');

  return (
    <section className="bg-surface-container-low dark:bg-surface-dim py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap justify-between items-end gap-2 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-primary" />
              <h2 className="text-xl md:text-3xl font-black">{t('latestEquipment')}</h2>
            </div>
            <p className="text-on-surface-variant text-sm">{t('latestEquipmentDesc')}</p>
          </div>
          <Link href="/equipment" className="text-primary font-bold text-sm hover:underline transition-colors">
            {t('viewAll')}
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((eq) => {
              const img = eq.images?.[0];
              const imgUrl = getImageUrl(img?.url);
              return (
                <Link key={eq.id} href={`/equipment/${eq.id}`} className="group bg-surface-container-lowest dark:bg-surface-container rounded-2xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 shadow-sm hover:shadow-md transition-all">
                  <div className="relative aspect-[16/10] bg-surface-container-low overflow-hidden">
                    {imgUrl ? (
                      <Image src={imgUrl} alt={eq.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">construction</span>
                      </div>
                    )}
                    <span className={`absolute top-2 start-2 text-[10px] font-black text-white px-2 py-0.5 rounded-md ${TYPE_COLORS[eq.listingType] || 'bg-gray-600'}`}>
                      {eq.listingType}
                    </span>
                    <span className={`absolute top-2 end-2 text-[10px] font-black text-white px-2 py-0.5 rounded-md ${eq.condition === 'NEW' ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                      {eq.condition}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm text-on-surface truncate">{eq.title}</h3>
                    <div className="flex items-center gap-1 mt-1 text-xs text-on-surface-variant">
                      {eq.make && <span className="truncate">{eq.make}</span>}
                      {eq.governorate && (
                        <>
                          <span className="mx-1">·</span>
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          <span className="truncate">{eq.governorate}</span>
                        </>
                      )}
                    </div>
                    {eq.price && (
                      <p className="text-primary font-black text-sm mt-2">{eq.price} {eq.currency}</p>
                    )}
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
