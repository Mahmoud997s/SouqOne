/**
 * Details table component.
 * Renders key-value rows with icons for listing details.
 */

'use client';

import { memo } from 'react';
import { useTranslations } from 'next-intl';
import * as Icons from 'lucide-react';
import type { UnifiedListing } from '../types/unified.types';
import type { SpecField } from '../types/config.types';
import { getNestedValue } from '../config/specs.config';

interface DetailsTableProps {
  listing: UnifiedListing;
  fields: SpecField[];
}

/**
 * Format a value for display in the table.
 */
function formatTableValue(value: unknown, format?: string, boolYes?: string, boolNo?: string): string {
  if (value === null || value === undefined || value === '') return '—';

  if (format === 'boolean') {
    return value === true || value === 'true' ? (boolYes ?? 'Yes') : (boolNo ?? 'No');
  }

  if (Array.isArray(value)) {
    return value.join('، ');
  }

  return String(value);
}

export const DetailsTable = memo(function DetailsTable({ listing, fields }: DetailsTableProps) {
  const ts = useTranslations('sale');
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
    <div className="border border-outline-variant/15 rounded-xl overflow-hidden text-[12px]">
      {visibleFields.map((field, index, arr) => {
        const value = getNestedValue(listing, field.key);
        const formatted = formatTableValue(value, field.format, ts('boolYes'), ts('boolNo'));
        const isLast = index === arr.length - 1;

        // Get icon component dynamically
        const IconComponent = (Icons[field.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>) || Icons.Circle;

        return (
          <div
            key={field.key}
            className={`flex items-center justify-between px-4 py-3 ${
              index % 2 === 0 ? 'bg-surface-container-low/40' : ''
            } ${!isLast ? 'border-b border-outline-variant/10' : ''}`}
          >
            <div className="flex items-center gap-2 text-on-surface-variant">
              <IconComponent size={14} className="text-primary" />
              <span>{field.label}</span>
            </div>
            <span className="font-medium text-on-surface">{formatted}</span>
          </div>
        );
      })}
    </div>
  );
});
