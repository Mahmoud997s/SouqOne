'use client';

import { useState } from 'react';
import clsx from 'clsx';

export interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function SearchBar({ onSearch, placeholder = 'ابحث...', defaultValue = '', className }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx(
        'bg-surface-container-low p-6 md:p-8 rounded-xl',
        className,
      )}
    >
      <div className="flex flex-col lg:flex-row-reverse gap-4">
        <div className="relative flex-grow">
          <span className="absolute right-5 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-surface-container-lowest pr-14 py-4 md:py-5 text-on-surface placeholder:text-on-surface-variant/50 outline-none rounded-xl focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
        <button
          type="submit"
          className="btn-editorial px-10 md:px-12 py-4 md:py-5 font-headline font-black hover:brightness-105 hover:shadow-ambient text-lg"
        >
          ابحث الآن
        </button>
      </div>
    </form>
  );
}
