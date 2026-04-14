'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
}

const SIZES = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };

export function StarRating({ value, onChange, size = 'md', readonly = false }: StarRatingProps) {
  const [hover, setHover] = useState(0);
  const sizeClass = SIZES[size];

  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= (hover || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHover(star)}
            onMouseLeave={() => !readonly && setHover(0)}
            className={`${sizeClass} transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
          >
            <span
              className={`material-symbols-outlined ${sizeClass} ${filled ? 'text-amber-500' : 'text-on-surface-variant/20'}`}
              style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
            >
              star
            </span>
          </button>
        );
      })}
    </div>
  );
}
