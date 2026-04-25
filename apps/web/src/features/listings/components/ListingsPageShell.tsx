'use client'

import { Suspense, useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { 
  SlidersHorizontal, ChevronLeft, Search, Plus, X, 
  List, LayoutGrid, Loader2, SearchX,
  Car, Bus, Wrench, Settings
} from 'lucide-react'
import { clsx } from 'clsx'

import type { ListingCategory } from '../types/category.types'
import { CATEGORY_META } from '../types/category.types'
import { CATEGORY_SORT_OPTIONS } from '../config/filters.config'
import { useUnifiedListings } from '../hooks/useUnifiedListings'
import { useFilterState } from '../hooks/useFilterState'
import { getAddListingHref } from '../utils/filter-helpers'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

import { FilterSidebar } from './FilterSidebar'
import { FilterSheet } from './FilterSheet'
import { ActiveFilters } from './ActiveFilters'
import { ListingCard } from './ListingCard'
import { ListingCardSkeleton } from './ListingCardSkeleton'
import { VehicleCard } from '@/features/ads/components/vehicle-card'
import { CardSkeleton } from '@/components/loading-skeleton'

// ── Icons ────────────────────────────────────────────────────────────────────

type LucideIcon = React.ComponentType<{ size?: number; className?: string }>
const CATEGORY_ICON: Record<ListingCategory, LucideIcon> = {
  cars: Car, buses: Bus, equipment: Wrench,
  parts: Settings, services: Wrench,
}

// ── Main Shell Export ────────────────────────────────────────────────────────

interface ListingsPageShellProps {
  category: ListingCategory
}

export function ListingsPageShell({ category }: ListingsPageShellProps) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <ShellContent category={category} />
    </Suspense>
  )
}

function ShellFallback() {
  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-4 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-10 bg-outline-variant/30 rounded-lg animate-pulse mb-6" />
          <div className="h-14 bg-outline-variant/30 rounded-xl animate-pulse mb-8" />
          <div className="flex gap-6">
            <div className="hidden lg:block w-[308px] h-[600px] bg-outline-variant/20 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-4">
              {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// ── Shell Content ────────────────────────────────────────────────────────────

function ShellContent({ category }: { category: ListingCategory }) {
  const t = useTranslations('listings')
  const meta = CATEGORY_META[category]
  const sortOptions = CATEGORY_SORT_OPTIONS[category]
  const CategoryIcon = CATEGORY_ICON[category]

  // Filter State (from URL params)
  const { filters, setFilter, clearAll, activeCount, hasActiveFilters } = useFilterState(category)

  // Local State
  const [fabSheetOpen, setFabSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState((filters['q'] as string) || '')
  
  // Sync search state with URL when initial loads
  useEffect(() => {
    setSearchQuery((filters['q'] as string) || '')
  }, [filters])

  const sort = (filters['sort'] as string) ?? sortOptions[0]?.value ?? ''
  const page = Number(filters['page'] ?? '1')

  // Fetch Data
  const { items, total, totalPages, isLoading, isFetching } = useUnifiedListings(category, filters, page)

  // Handlers
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setFilter('page', null)
      setFilter('q', searchQuery || null)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setFilter('page', null)
    setFilter('q', null)
  }

  const handleFilterChange = (key: string, value: string | boolean | null) => {
    if (key !== 'page') setFilter('page', null)
    setFilter(key, value)
  }

  const handleSave = (id: string) => {
    // TODO: wire to favorites API
    console.log('save', id)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* ── 1. Breadcrumb Bar ────────────────────────────────────────────── */}
      <div className="bg-background border-b border-outline-variant/40 py-2.5">
        <nav className="flex items-center gap-1.5 text-[12px] text-on-surface-variant max-w-7xl mx-auto px-6">
          <Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link>
          <ChevronLeft size={13} className="text-outline-variant/80" />
          <span className="text-on-surface font-medium">{meta.labelAr}</span>
          
          {(filters['q'] as string) && (
            <>
              <ChevronLeft size={13} className="text-outline-variant/80" />
              <span className="text-on-surface-variant">
                {t('resultsFor', { q: filters['q'] as string })}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* ── 2. Search + Action Bar ────────────────────────────────────────── */}
      <div className="bg-background border-b border-outline-variant/40 py-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 max-w-7xl mx-auto px-6">
          
          {/* Title */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
            <CategoryIcon size={20} className="text-primary" />
            <h1 className="text-[16px] font-semibold text-on-surface">
              {meta.labelAr}
            </h1>
          </div>

          {/* Search */}
          <div className="relative w-full sm:flex-1 max-w-xl">
            <Search 
              size={15} 
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none" 
            />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder={t('searchIn', { category: meta.labelAr })}
              className="w-full h-10 rounded-full border border-outline-variant/60 bg-background pr-10 pl-10 text-[13px] placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all text-right"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Add Button */}
          <Link
            href={getAddListingHref(category)}
            className="hidden sm:flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 transition-colors whitespace-nowrap flex-shrink-0 shadow-sm shadow-primary/20"
          >
            <Plus size={15} />
            {t('addListing')}
          </Link>
        </div>
      </div>

      {/* ── 3. Main Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 flex gap-6 items-start py-5">
        
        {/* Sidebar */}
        <FilterSidebar
          category={category}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={clearAll}
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 pb-16">
          
          {/* ── A) Sort Bar ── */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <span className="text-[13px] text-on-surface-variant">
              {isLoading
                ? <span className="h-4 w-24 bg-surface-container rounded animate-pulse inline-block" />
                : `${total.toLocaleString('ar-EG')} ${t('advertisement')}` 
              }
            </span>

            <div className="flex items-center justify-between sm:justify-start gap-3">
              {/* Grid/List Toggle */}
              <div className="flex border border-outline-variant/60 rounded-lg overflow-hidden bg-background">
                <button
                  onClick={() => setViewMode('list')}
                  className={clsx(
                    "p-1.5 transition-colors",
                    viewMode === 'list' ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                  )}
                  aria-label={t('viewList')}
                >
                  <List size={15} />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={clsx(
                    "p-1.5 transition-colors",
                    viewMode === 'grid' ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                  )}
                  aria-label={t('viewGrid')}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-[12px] text-on-surface-variant">{t('sortBy')}:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setFilter('sort', e.target.value)}
                    className="h-8 rounded-lg border border-outline-variant/60 bg-background pl-6 pr-2.5 text-[12px] text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer appearance-none transition-colors hover:border-outline-variant/80"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.labelAr}
                      </option>
                    ))}
                  </select>
                  <ChevronLeft size={12} className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-on-surface-variant pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ── B) Active Filters ── */}
          {hasActiveFilters && (
            <div className="mb-4">
              <ActiveFilters
                category={category}
                filters={filters}
                onRemove={key => setFilter(key, null)}
                onClearAll={clearAll}
              />
            </div>
          )}

          {/* ── C) Results ── */}
          {/* Loading */}
          {isLoading && viewMode === 'list' && (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
            </div>
          )}
          {isLoading && viewMode === 'grid' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {/* Error */}
          {/* NOTE: error state not currently returned by hook in a way that triggers this, but keeping structure ready */}

          {/* Empty (No filters) */}
          {!isLoading && total === 0 && !hasActiveFilters && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-outline-variant/30 rounded-xl bg-background mt-4">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <CategoryIcon size={30} className="text-on-surface-variant/40" />
              </div>
              <h3 className="text-[15px] font-medium text-on-surface mb-1">
                {t('noListingsYet', { category: meta.labelAr })}
              </h3>
              <p className="text-[13px] text-on-surface-variant mb-5">
                {t('beFirst')}
              </p>
              <Link
                href={getAddListingHref(category)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 shadow-sm"
              >
                <Plus size={15} />
                {t('addListing')}
              </Link>
            </div>
          )}

          {/* Empty (With filters) */}
          {!isLoading && total === 0 && hasActiveFilters && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-outline-variant/30 rounded-xl bg-background mt-4">
              <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
                <SearchX size={30} className="text-on-surface-variant/40" />
              </div>
              <h3 className="text-[15px] font-medium text-on-surface mb-1">
                {t('noResults')}
              </h3>
              <p className="text-[13px] text-on-surface-variant mb-5">
                {t('tryChangeFilters')}
              </p>
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-outline-variant/60 text-[13px] text-on-surface hover:bg-surface-container transition-colors"
              >
                <X size={14} />
                {t('clearFilters')}
              </button>
            </div>
          )}

          {/* Items */}
          {!isLoading && total > 0 && (
            <>
              {viewMode === 'list' ? (
                <div className="space-y-2">
                  {items.map(item => <ListingCard key={item.id} item={item} onSave={handleSave} />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {items.map(item => (
                    <VehicleCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      make={item.attributes?.make || ''}
                      model={item.attributes?.model || ''}
                      year={item.attributes?.year || 0}
                      price={item.price || 0}
                      currency={item.currency}
                      mileage={item.attributes?.mileage}
                      fuelType={item.attributes?.fuelType}
                      transmission={item.attributes?.transmission}
                      condition={item.attributes?.condition}
                      governorate={item.governorate}
                      imageUrl={item.images[0]}
                      createdAt={item.createdAt}
                      isVerified={item.sellerVerified}
                      isPriceNegotiable={item.isPriceNegotiable}
                      listingType={item.attributes?.listingType}
                      dailyPrice={item.attributes?.dailyPrice}
                      monthlyPrice={item.attributes?.monthlyPrice}
                      href={item.href}
                    />
                  ))}
                </div>
              )}

              {/* Load More */}
              {totalPages > page && (
                <div className="flex justify-center mt-8 pb-8">
                  <button
                    onClick={() => setFilter('page', String(page + 1))}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-8 py-2.5 rounded-full border border-outline-variant/60 text-[13px] text-on-surface font-medium hover:border-outline-variant/80 hover:bg-surface-container/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-background shadow-sm"
                  >
                    {isFetching ? (
                      <Loader2 size={15} className="animate-spin text-primary" />
                    ) : (
                      <>
                        <span>{t('loadMore')}</span>
                        <span className="text-on-surface-variant text-[11px] font-normal">
                          ({t('remaining', { n: (total - items.length).toLocaleString('ar-EG') })})
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* ── Mobile FAB (lg:hidden) ────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-6 left-4 z-40">
        <button
          onClick={() => setFabSheetOpen(true)}
          className="flex items-center gap-2 h-12 px-6 rounded-full shadow-lg text-[14px] font-medium bg-on-surface text-background active:scale-95 transition-all cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          {t('filters')}
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-on-primary text-[10px] font-bold flex items-center justify-center -mr-1">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* FAB FilterSheet (mobile) */}
      {fabSheetOpen && (
        <FilterSheet
          category={category}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={clearAll}
          onClose={() => setFabSheetOpen(false)}
          total={total}
        />
      )}

      <Footer />
    </div>
  )
}
