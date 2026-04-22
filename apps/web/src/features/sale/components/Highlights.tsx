/**
 * Highlights section component.
 * Renders the 3 info cards below the seller row.
 */

'use client';

import { memo } from 'react';
import * as Icons from 'lucide-react';
import type { UnifiedListing } from '../types/unified.types';
import type { HighlightField } from '../types/config.types';

interface HighlightsProps {
  listing: UnifiedListing;
  fields: HighlightField[];
}

export const Highlights = memo(function Highlights({ listing, fields }: HighlightsProps) {
  // Filter by condition and limit to 3
  const visibleFields = fields
    .filter((field) => {
      if (field.condition) {
        return field.condition(listing);
      }
      return true;
    })
    .slice(0, 3);

  if (visibleFields.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {visibleFields.map((field, index) => {
        const title = field.getTitle(listing);
        const subtitle = field.getSub(listing);

        // Get icon component dynamically
        const IconComponent = (Icons[field.icon as keyof typeof Icons] as React.ComponentType<{ size?: number; className?: string }>) || Icons.Shield;

        return (
          <div
            key={index}
            className="flex items-start gap-4 p-3 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary/25 transition-all duration-200"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 border border-primary/20">
              <IconComponent size={18} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-on-surface truncate">{title}</p>
              <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
});
