/**
 * Homepage Badge - Custom badge style for homepage cards
 * Different from ListingBadge with unique design
 */

import { memo } from 'react';
import { useTranslations } from 'next-intl';

interface HomepageBadgeProps {
  type: string;
  variant?: 'modern' | 'classic' | 'minimal' | 'bold';
  className?: string;
}

export const HomepageBadge = memo(function HomepageBadge({ 
  type, 
  variant = 'modern', 
  className = '' 
}: HomepageBadgeProps) {
  const t = useTranslations('common');

  const getBadgeStyle = () => {
    const styles = {
      modern: {
        RENTAL: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25',
        WANTED: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25',
        SALE: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
      },
      classic: {
        RENTAL: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300',
        WANTED: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-300',
        SALE: 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300'
      },
      minimal: {
        RENTAL: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200',
        WANTED: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium bg-orange-50 text-orange-700 border border-orange-200',
        SALE: 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-medium bg-blue-50 text-blue-700 border border-blue-200'
      },
      bold: {
        RENTAL: 'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-black bg-emerald-500 text-white uppercase tracking-wider shadow-md',
        WANTED: 'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-black bg-orange-500 text-white uppercase tracking-wider shadow-md',
        SALE: 'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-black bg-blue-500 text-white uppercase tracking-wider shadow-md'
      }
    };

    const typeKey = type === 'RENTAL' ? 'RENTAL' : type === 'WANTED' ? 'WANTED' : 'SALE';
    return styles[variant][typeKey];
  };

  const getIcon = () => {
    const icons = {
      RENTAL: <span className="material-symbols-outlined text-xs">home</span>,
      WANTED: <span className="material-symbols-outlined text-xs">search</span>,
      SALE: <span className="material-symbols-outlined text-xs">sell</span>
    };

    return icons[type === 'RENTAL' ? 'RENTAL' : type === 'WANTED' ? 'WANTED' : 'SALE'];
  };

  const getText = () => {
    if (type === 'RENTAL') return t('rental') || 'إيجار';
    if (type === 'WANTED') return t('wanted') || 'مطلوب';
    return t('sale') || 'للبيع';
  };

  return (
    <span className={`${getBadgeStyle()} ${className}`}>
      {getIcon()}
      {getText()}
    </span>
  );
});
