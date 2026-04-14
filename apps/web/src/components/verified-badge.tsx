'use client';

import { useTranslations } from 'next-intl';

interface VerifiedBadgeProps {
  label?: string;
  className?: string;
}

export function VerifiedBadge({ label, className = '' }: VerifiedBadgeProps) {
  const tp = useTranslations('pages');
  return (
    <span className={`inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[9px] font-black px-1.5 py-0.5 rounded ${className}`}>
      <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
      {label || tp('verifiedBadge')}
    </span>
  );
}
