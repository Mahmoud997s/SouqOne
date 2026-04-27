/**
 * Spec cards grid component.
 * Renders the 4 top spec cards with icons and formatted values.
 */

'use client';

import { memo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { UnifiedListing } from '../types/unified.types';
import type { SpecField } from '../types/config.types';
import { getNestedValue } from '../config/specs.config';
import { useEnumTranslations } from '@/lib/enum-translations';
import { translateEnum } from '@/lib/translate-enum';
import * as Icons from 'lucide-react';
import { resolveLocationLabel, resolveCityLabel } from '@/lib/location-data';

interface SpecsGridProps {
  listing: UnifiedListing;
  fields: SpecField[];
}

/**
 * Format a spec value based on its type.
 */
function formatValue(value: unknown, format?: string, unit?: string, boolYes?: string, boolNo?: string): string {
  if (value === null || value === undefined || value === '') return '—';

  switch (format) {
    case 'number':
      if (typeof value === 'number') {
        return unit ? `${value.toLocaleString('en-US')} ${unit}` : value.toLocaleString('en-US');
      }
      return unit ? `${value} ${unit}` : String(value);

    case 'km':
      if (typeof value === 'number') {
        return `${value.toLocaleString('en-US')} ${unit || 'km'}`;
      }
      return String(value);

    case 'year':
      return String(value);

    case 'boolean':
      return value === true || value === 'true' ? (boolYes ?? 'Yes') : (boolNo ?? 'No');

    default:
      return String(value);
  }
}

export const SpecsGrid = memo(function SpecsGrid({ listing, fields }: SpecsGridProps) {
  const ts = useTranslations('sale');
  const enums = useEnumTranslations();
  const locale = useLocale();
  // Filter out empty fields if hideIfEmpty is true
  const visibleFields = fields.filter((field) => {
    const value = getNestedValue(listing, field.key);
    if (field.hideIfEmpty && (value === null || value === undefined || value === '')) {
      return false;
    }
    return true;
  });

  if (visibleFields.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {visibleFields.map((field) => {
        const value = getNestedValue(listing, field.key);
        const resolvedValue =
          field.key === 'governorate'
            ? (resolveLocationLabel(value as string, locale) ?? value)
            : field.key === 'city'
              ? (resolveCityLabel(value as string, locale) ?? value)
              : field.format === 'enum' && field.enumKey
                ? translateEnum(enums[field.enumKey], value as string)
                : value;
        const formatted = formatValue(resolvedValue, field.format, field.unit, ts('boolYes'), ts('boolNo'));

        // Get icon component dynamically
        const IconComponent = (Icons[field.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>) || Icons.Circle;

        return (
          <div
            key={field.key}
            className="relative rounded-2xl p-4 text-center overflow-hidden border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/30 hover:from-primary/8 hover:to-primary/15 transition-all duration-200"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <IconComponent size={18} className="text-primary" />
            </div>
            <p className="text-[15px] font-bold text-primary leading-tight">{formatted}</p>
            <p className="text-[11px] text-on-surface-variant mt-1 uppercase tracking-wide">
              {field.label}
            </p>
          </div>
        );
      })}
    </div>
  );
});
