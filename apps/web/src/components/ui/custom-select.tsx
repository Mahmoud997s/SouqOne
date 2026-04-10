import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder: string;
  disabled?: boolean;
  searchable?: boolean;
  variant?: 'default' | 'light';
}

export function CustomSelect({ value, onChange, options, placeholder, disabled = false, searchable = false, variant = 'default' }: CustomSelectProps) {
  const isLight = variant === 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) setSearch('');
  }, [isOpen, searchable]);

  const selectedOption = options.find((opt) => opt.value === value);
  const filtered = searchable && search
    ? options.filter((opt) => opt.label.includes(search) || opt.value.toLowerCase().includes(search.toLowerCase()))
    : options;

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-[13px] font-medium h-[20px] bg-transparent border-none p-0 focus:outline-none transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : isLight ? 'cursor-pointer text-on-surface' : 'cursor-pointer text-white'
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : <span className={isLight ? 'text-on-surface-variant/60' : 'text-white/50'}>{placeholder}</span>}</span>
        <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isLight ? 'text-on-surface-variant/50' : 'text-white/40'} ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[calc(100%+3px)] bg-surface-container-lowest/95 backdrop-blur-2xl rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-outline-variant/20 z-50 overflow-hidden flex flex-col">
          {searchable && (
            <div className="p-2 border-b border-outline-variant/20">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث..."
                className="w-full bg-surface-container border border-outline-variant/20 rounded-lg py-2 px-3 text-sm text-on-surface placeholder-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all"
                dir="rtl"
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto premium-scrollbar pb-1">
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className={`w-full text-center px-4 py-3 text-sm transition-all duration-300 relative overflow-hidden ${
                value === ''
                  ? 'bg-primary/15 text-primary font-bold'
                  : 'text-on-surface font-medium hover:bg-surface-container hover:text-primary'
              }`}
            >
              {placeholder}
            </button>
            
            {filtered.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-center px-4 py-3 text-sm transition-all duration-300 relative overflow-hidden border-t border-outline-variant/10 ${
                    isSelected
                      ? 'bg-primary/15 text-primary font-bold'
                      : 'text-on-surface font-medium hover:bg-surface-container hover:text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            {searchable && filtered.length === 0 && (
              <div className="px-3 py-6 text-center text-sm font-medium text-on-surface-variant">لا توجد نتائج</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
