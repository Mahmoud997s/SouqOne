'use client';

import { Link } from '@/i18n/navigation';
import { useParts } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { PART_CONDITION_BADGE, BADGE_COLORS } from '@/lib/constants/mappings';
import { ListingPageShell } from '@/components/listing-page-shell';

const PART_CATS = [
  { value: '', label: 'الكل' },
  { value: 'ENGINE', label: 'محرك' },
  { value: 'BODY', label: 'هيكل' },
  { value: 'ELECTRICAL', label: 'كهرباء' },
  { value: 'SUSPENSION', label: 'تعليق' },
  { value: 'BRAKES', label: 'فرامل' },
  { value: 'INTERIOR', label: 'داخلية' },
  { value: 'TIRES', label: 'إطارات' },
  { value: 'BATTERIES', label: 'بطاريات' },
  { value: 'OILS', label: 'زيوت' },
  { value: 'ACCESSORIES', label: 'إكسسوارات' },
];


export default function PartsPage() {
  return (
    <ListingPageShell
      title="قطع غيار"
      countLabel="إعلان"
      searchPlaceholder="ابحث عن قطعة غيار..."
      addHref="/add-listing/parts"
      addLabel="+ أضف قطعة"
      addBtnClass="btn-warning"
      heroIcon="build"
      heroSubtitle="ابحث عن قطع غيار أصلية ومستعملة لجميع أنواع السيارات"
      basePath="/parts"
      categories={PART_CATS}
      filterParamKey="partCategory"
      gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      useDataHook={useParts}
      emptyTitle="لا توجد قطع غيار"
      emptyDescription="جرب البحث بكلمات مختلفة"
      renderCard={(part) => (
        <Link key={part.id} href={`/parts/${part.id}`} className="glass-card rounded-xl overflow-hidden group">
          <div className="aspect-[4/3] bg-surface-container-low relative overflow-hidden">
            {part.images?.[0] ? (
              <img src={getImageUrl(part.images[0].url) || ''} alt={part.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-on-surface-variant/30">
                <span className="text-4xl">🔩</span>
              </div>
            )}
            {PART_CONDITION_BADGE[part.condition] && (
              <span className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-black ${PART_CONDITION_BADGE[part.condition].cls}`}>
                {PART_CONDITION_BADGE[part.condition].label}
              </span>
            )}
            {part.isOriginal && (
              <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-black ${BADGE_COLORS.original}`}>أصلي</span>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-bold text-sm text-on-surface line-clamp-2 mb-2">{part.title}</h3>
            {part.compatibleMakes.length > 0 && (
              <p className="text-[11px] text-on-surface-variant mb-2 line-clamp-1">
                يتوافق مع: {part.compatibleMakes.join(', ')}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-primary">{parseFloat(part.price).toFixed(3)} <span className="text-xs font-medium text-on-surface-variant">ر.ع.</span></span>
              {part.governorate && (
                <span className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-xs">location_on</span> {part.governorate}
                </span>
              )}
            </div>
          </div>
        </Link>
      )}
    />
  );
}
