'use client';

import clsx from 'clsx';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className={clsx('flex items-center justify-center gap-1 sm:gap-1.5', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <span className="material-symbols-outlined icon-flip text-lg">chevron_right</span>
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="text-on-surface-variant px-1 text-xs font-black">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={clsx(
              'w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-xs sm:text-sm font-bold transition-all',
              currentPage === page
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary',
            )}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-primary hover:text-on-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
      >
        <span className="material-symbols-outlined icon-flip text-lg">chevron_left</span>
      </button>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}
