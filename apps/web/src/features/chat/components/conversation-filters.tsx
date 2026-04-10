'use client';

interface ConversationFiltersProps {
  active: string;
  onChange: (filter: string) => void;
}

const FILTERS = [
  { key: 'all', label: 'الكل' },
  { key: 'buying', label: 'شراء' },
  { key: 'selling', label: 'بيع' },
];

export function ConversationFilters({ active, onChange }: ConversationFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {FILTERS.map(f => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`px-4 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 ${
            active === f.key
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-surface-container text-on-surface-variant/60 hover:bg-surface-container-high hover:text-on-surface-variant'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
