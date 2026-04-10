'use client';

import { Suspense, useState, type ReactNode } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';

/* ── Types ── */

interface CategoryOption {
  value: string;
  label: string;
}

interface PaginatedMeta {
  page: number;
  total: number;
  totalPages: number;
}

interface ListingPageShellProps<T> {
  /** Page title (e.g. "قطع غيار") */
  title: string;
  /** Count label suffix (e.g. "إعلان", "خدمة") */
  countLabel: string;
  /** Placeholder for search input */
  searchPlaceholder: string;
  /** URL path for "add" button (e.g. "/add-listing/parts") */
  addHref: string;
  /** Label for "add" button (e.g. "+ أضف قطعة") */
  addLabel: string;
  /** CSS class for add button (e.g. "btn-orange", "btn-green") */
  addBtnClass?: string;
  /** Base URL path for this page (e.g. "/parts") */
  basePath: string;
  /** Category filter options */
  categories: CategoryOption[];
  /** URL param key for category filter (e.g. "partCategory", "serviceType") */
  filterParamKey: string;
  /** Grid className override (default: 3-col) */
  gridClassName?: string;
  /** React Query hook that returns { data, isLoading, error } */
  useDataHook: (params: Record<string, string>) => {
    data: { items: T[]; meta: PaginatedMeta } | undefined;
    isLoading: boolean;
    error: unknown;
  };
  /** Render function for each item card */
  renderCard: (item: T, index: number) => ReactNode;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
}

/* ── Shell component ── */

export function ListingPageShell<T>(props: ListingPageShellProps<T>) {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[1440px] mx-auto px-4"><ListingSkeleton count={6} /></main></>}>
      <ListingPageContent {...props} />
    </Suspense>
  );
}

function ListingPageContent<T>({
  title,
  countLabel,
  searchPlaceholder,
  addHref,
  addLabel,
  addBtnClass = 'btn-orange',
  basePath,
  categories,
  filterParamKey,
  gridClassName = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  useDataHook,
  renderCard,
  emptyTitle = 'لا توجد نتائج',
  emptyDescription = 'جرب البحث بكلمات مختلفة',
}: ListingPageShellProps<T>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedFilter, setSelectedFilter] = useState(searchParams.get(filterParamKey) || '');

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (selectedFilter) params[filterParamKey] = selectedFilter;
  params.page = searchParams.get('page') || '1';

  const { data, isLoading, error } = useDataHook(params);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (search) sp.set('search', search);
    if (selectedFilter) sp.set(filterParamKey, selectedFilter);
    router.push(`${basePath}?${sp.toString()}`);
  }

  function handleFilterChange(value: string) {
    setSelectedFilter(value);
    const sp = new URLSearchParams();
    if (search) sp.set('search', search);
    if (value) sp.set(filterParamKey, value);
    router.push(`${basePath}?${sp.toString()}`);
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[1440px] mx-auto px-4 md:px-8" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">{title}</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {data?.meta.total ?? 0} {countLabel}
            </p>
          </div>
          <Link href={addHref} className={`${addBtnClass} hover:brightness-110 px-5 py-2.5 text-sm font-bold shadow-ambient`}>
            {addLabel}
          </Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-surface-container-high border border-outline/30 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-primary text-base">search</span>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-2.5 pr-10 pl-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none" />
          </div>
          <button type="submit" className="bg-primary text-on-primary hover:brightness-110 px-6 py-2.5 text-sm font-bold rounded-lg shadow-ambient shrink-0">بحث</button>
        </form>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(c => (
            <button key={c.value} onClick={() => handleFilterChange(c.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${selectedFilter === c.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <ListingSkeleton count={6} />
        ) : error ? (
          <ErrorState message="حدث خطأ في تحميل البيانات" />
        ) : !data?.items.length ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className={gridClassName}>
            {data.items.map((item, i) => renderCard(item, i))}
          </div>
        )}

        {/* Pagination */}
        {data && data.meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => { const sp = new URLSearchParams(searchParams.toString()); sp.set('page', String(p)); router.push(`${basePath}?${sp.toString()}`); }}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${p === data.meta.page ? 'bg-primary text-on-primary shadow-ambient' : 'border border-outline/30 text-on-surface-variant hover:border-primary hover:text-primary'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
