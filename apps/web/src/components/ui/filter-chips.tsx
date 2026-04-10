'use client';

import clsx from 'clsx';

export interface FilterChipsProps {
  options: { label: string; value: string }[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterChips({ options, selected, onChange, className }: FilterChipsProps) {
  return (
    <div className={clsx('flex flex-wrap gap-3', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            'px-8 py-2.5 rounded-lg font-bold font-headline transition-all text-sm',
            selected === opt.value
              ? 'bg-primary text-on-primary shadow-ambient'
              : 'bg-secondary-container text-on-secondary-container hover:bg-surface-container-high',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
