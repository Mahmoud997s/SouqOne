'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { 
  SlidersHorizontal, ChevronLeft, Search, Plus, X, 
  List, LayoutGrid, Loader2, SearchX,
  Car, Bus, Wrench, Settings, Briefcase, Clock
} from 'lucide-react'
import { clsx } from 'clsx'

import type { ListingCategory } from '../types/category.types'
import { CATEGORY_META, VALID_CATEGORIES } from '../types/category.types'
import { CATEGORY_SORT_OPTIONS } from '../config/filters.config'
import { useUnifiedListings } from '../hooks/useUnifiedListings'
import { useFilterState } from '../hooks/useFilterState'
import { useRecentSearches } from '../hooks/useRecentSearches'
import { getAddListingHref } from '../utils/filter-helpers'
import { useDebounce } from '@/hooks/useDebounce'
import { useSuggestions } from '@/lib/api/listings'

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

type LucideIcon = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>
const CATEGORY_ICON: Record<ListingCategory, LucideIcon> = {
  cars: Car, buses: Bus, equipment: Wrench,
  parts: Settings, services: Briefcase,
}

function CategoryBar({ currentCategory }: { currentCategory: ListingCategory }) {
  return (
    <div className="bg-background/80 backdrop-blur-md border-b border-outline-variant/20 sticky top-0 z-30 pt-3 pb-3">
      <div className="w-full px-2 sm:max-w-4xl sm:mx-auto sm:px-6">
        {/* The Premium Capsule */}
        <div className="flex items-center p-1 sm:p-1.5 bg-surface-container-lowest/80 backdrop-blur-xl border border-outline-variant/40 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-300">
          {VALID_CATEGORIES.map((cat, index) => {
            const m = CATEGORY_META[cat]
            const isActive = cat === currentCategory
            const Icon = CATEGORY_ICON[cat]
            const isLast = index === VALID_CATEGORIES.length - 1
            
            return (
              <div key={cat} className="flex items-center flex-1">
                <Link
                  href={`/browse/${cat}`}
                  className={clsx(
                    'flex flex-row items-center justify-center gap-1 sm:gap-2.5 px-0.5 py-2.5 sm:px-5 sm:py-3 w-full rounded-full transition-all duration-300 group',
                    isActive 
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20 scale-[1.02]' 
                      : 'text-on-surface-variant hover:bg-primary/10 hover:text-primary'
                  )}
                >
                  <Icon 
                    size={18} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={clsx(
                      "w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:scale-110", 
                      isActive ? "text-on-primary" : "text-on-surface-variant group-hover:text-primary"
                    )} 
                  />
                  <span className={clsx(
                    "text-[10px] sm:text-[13px] whitespace-nowrap tracking-tight sm:tracking-wide", 
                    isActive ? 'font-bold' : 'font-semibold'
                  )}>
                    {m.labelAr}
                  </span>
                </Link>
                
                {/* Vertical Divider */}
                {!isLast && (
                  <div className="w-[1px] h-5 sm:h-8 bg-outline-variant/30 mx-0.5 sm:mx-1 flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

import { BRAND_LOGOS } from '../config/brand-logos.config'

// ── Popular Makes (Cars Only) ────────────────────────────────────────────────

const POPULAR_MAKES = [
  { name: 'تويوتا', value: 'Toyota', logo: BRAND_LOGOS['toyota'] },
  { name: 'نيسان', value: 'Nissan', logo: BRAND_LOGOS['nissan'] },
  { name: 'هيونداي', value: 'Hyundai', logo: BRAND_LOGOS['hyundai'] },
  { name: 'لكزس', value: 'Lexus', logo: BRAND_LOGOS['lexus'] },
  { name: 'كيا', value: 'Kia', logo: BRAND_LOGOS['kia'] },
  { name: 'مرسيدس', value: 'Mercedes-Benz', logo: BRAND_LOGOS['mercedes-benz'] },
  { name: 'بي إم دبليو', value: 'BMW', logo: BRAND_LOGOS['bmw'] },
  { name: 'فورد', value: 'Ford', logo: BRAND_LOGOS['ford'] },
  { name: 'شفروليه', value: 'Chevrolet', logo: BRAND_LOGOS['chevrolet'] },
  { name: 'هوندا', value: 'Honda', logo: BRAND_LOGOS['honda'] },
  { name: 'لاند روفر', value: 'Land Rover', logo: BRAND_LOGOS['land-rover'] },
  { name: 'جيب', value: 'Jeep', logo: BRAND_LOGOS['jeep'] },
  { name: 'جي إم سي', value: 'GMC', logo: BRAND_LOGOS['gmc'] },
  { name: 'أودي', value: 'Audi', logo: BRAND_LOGOS['audi'] },
  { name: 'بورش', value: 'Porsche', logo: BRAND_LOGOS['porsche'] },
  { name: 'ميتسوبيشي', value: 'Mitsubishi', logo: BRAND_LOGOS['mitsubishi'] },
  { name: 'فولكس فاجن', value: 'Volkswagen', logo: BRAND_LOGOS['volkswagen'] },
  { name: 'مازدا', value: 'Mazda', logo: BRAND_LOGOS['mazda'] },
  { name: 'دودج', value: 'Dodge', logo: BRAND_LOGOS['dodge'] },
  { name: 'سوزوكي', value: 'Suzuki', logo: BRAND_LOGOS['suzuki'] },
  { name: 'بي واي دي', value: 'BYD', logo: BRAND_LOGOS['byd'] },
  { name: 'شانجان', value: 'Changan', logo: BRAND_LOGOS['changan'] },
  { name: 'جيلي', value: 'Geely', logo: BRAND_LOGOS['geely'] },
  { name: 'شيري', value: 'Chery', logo: BRAND_LOGOS['chery'] },
  { name: 'هافال', value: 'Haval', logo: BRAND_LOGOS['haval'] },
  { name: 'إم جي', value: 'MG', logo: BRAND_LOGOS['mg'] },
  { name: 'جي أيه سي', value: 'GAC', logo: BRAND_LOGOS['gac'] },
  { name: 'جيتور', value: 'Jetour', logo: BRAND_LOGOS['jetour'] },
  { name: 'تانك', value: 'Tank', logo: BRAND_LOGOS['tank'] },
  { name: 'بايك', value: 'BAIC', logo: BRAND_LOGOS['baic'] },
  { name: 'هونشي', value: 'Hongqi', logo: BRAND_LOGOS['hongqi'] },
  { name: 'بيستون', value: 'Bestune', logo: BRAND_LOGOS['bestune'] },
  { name: 'إكسيد', value: 'Exeed', logo: BRAND_LOGOS['exeed'] },
  { name: 'فولفو', value: 'Volvo', logo: BRAND_LOGOS['volvo'] },
  { name: 'جاكوار', value: 'Jaguar', logo: BRAND_LOGOS['jaguar'] },
  { name: 'مازيراتي', value: 'Maserati', logo: BRAND_LOGOS['maserati'] },
  { name: 'فيراري', value: 'Ferrari', logo: BRAND_LOGOS['ferrari'] },
  { name: 'لامبورغيني', value: 'Lamborghini', logo: BRAND_LOGOS['lamborghini'] },
  { name: 'بنتلي', value: 'Bentley', logo: BRAND_LOGOS['bentley'] },
  { name: 'رولز رويس', value: 'Rolls-Royce', logo: BRAND_LOGOS['rolls-royce'] },
  { name: 'أستون مارتن', value: 'Aston Martin', logo: BRAND_LOGOS['aston-martin'] },
  { name: 'ماكلارين', value: 'McLaren', logo: BRAND_LOGOS['mclaren'] },
  { name: 'جينيسيس', value: 'Genesis', logo: BRAND_LOGOS['genesis'] },
  { name: 'بيجو', value: 'Peugeot', logo: BRAND_LOGOS['peugeot'] },
  { name: 'رينو', value: 'Renault', logo: BRAND_LOGOS['renault'] },
  { name: 'سيتروين', value: 'Citroen', logo: BRAND_LOGOS['citroen'] },
  { name: 'سكودا', value: 'Skoda', logo: BRAND_LOGOS['skoda'] },
  { name: 'ميني', value: 'Mini', logo: BRAND_LOGOS['mini'] },
  { name: 'فيات', value: 'Fiat', logo: BRAND_LOGOS['fiat'] },
  { name: 'ألفا روميو', value: 'Alfa Romeo', logo: BRAND_LOGOS['alfa-romeo'] },
  { name: 'تسلا', value: 'Tesla', logo: BRAND_LOGOS['tesla'] },
  { name: 'سوبارو', value: 'Subaru', logo: BRAND_LOGOS['subaru'] },
  { name: 'كاديلاك', value: 'Cadillac', logo: BRAND_LOGOS['cadillac'] },
  { name: 'لينكولن', value: 'Lincoln', logo: BRAND_LOGOS['lincoln'] },
  { name: 'إنفينيتي', value: 'Infiniti', logo: BRAND_LOGOS['infiniti'] },
  { name: 'أكورا', value: 'Acura', logo: BRAND_LOGOS['acura'] },
  { name: 'أوبل', value: 'Opel', logo: BRAND_LOGOS['opel'] },
  { name: 'رام', value: 'RAM', logo: BRAND_LOGOS['ram'] },
  { name: 'ايسوزو', value: 'Isuzu', logo: BRAND_LOGOS['isuzu'] },
  { name: 'ديهاتسو', value: 'Daihatsu', logo: BRAND_LOGOS['daihatsu'] },
  { name: 'بروتون', value: 'Proton', logo: BRAND_LOGOS['proton'] },
  { name: 'داسيا', value: 'Dacia', logo: BRAND_LOGOS['dacia'] },
  { name: 'سمارت', value: 'Smart', logo: BRAND_LOGOS['smart'] },
  { name: 'سانغ يونغ', value: 'SsangYong', logo: BRAND_LOGOS['ssangyong'] },
  { name: 'لوتس', value: 'Lotus', logo: BRAND_LOGOS['lotus'] },
  { name: 'كوبرا', value: 'Cupra', logo: BRAND_LOGOS['cupra'] },
  { name: 'بولستار', value: 'Polestar', logo: BRAND_LOGOS['polestar'] },
  { name: 'لوسيد', value: 'Lucid', logo: BRAND_LOGOS['lucid'] },
  { name: 'ريفيان', value: 'Rivian', logo: BRAND_LOGOS['rivian'] },
  { name: 'فين فاست', value: 'VinFast', logo: BRAND_LOGOS['vinfast'] },
  { name: 'ماهيندرا', value: 'Mahindra', logo: BRAND_LOGOS['mahindra'] },
  { name: 'تاتا', value: 'Tata', logo: BRAND_LOGOS['tata'] },
  { name: 'هامر', value: 'Hummer', logo: BRAND_LOGOS['hummer'] },
  { name: 'بونتياك', value: 'Pontiac', logo: BRAND_LOGOS['pontiac'] },
  { name: 'ساب', value: 'Saab', logo: BRAND_LOGOS['saab'] },
  { name: 'لانشيا', value: 'Lancia', logo: BRAND_LOGOS['lancia'] },
  { name: 'سيات', value: 'Seat', logo: BRAND_LOGOS['seat'] },
  { name: 'مايباخ', value: 'Maybach', logo: BRAND_LOGOS['maybach'] },
  { name: 'بوغاتي', value: 'Bugatti', logo: BRAND_LOGOS['bugatti'] },
  { name: 'باجاني', value: 'Pagani', logo: BRAND_LOGOS['pagani'] },
  { name: 'كونيغسيغ', value: 'Koenigsegg', logo: BRAND_LOGOS['koenigsegg'] },
  { name: 'ألبين', value: 'Alpine', logo: BRAND_LOGOS['alpine'] },
  { name: 'إيفيكو', value: 'Iveco', logo: BRAND_LOGOS['iveco'] },
  { name: 'مان', value: 'MAN', logo: BRAND_LOGOS['man'] },
  { name: 'سكانيا', value: 'Scania', logo: BRAND_LOGOS['scania'] },
  { name: 'هينو', value: 'Hino', logo: BRAND_LOGOS['hino'] },
  { name: 'فوزو', value: 'Fuso', logo: BRAND_LOGOS['fuso'] },
]

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
  const { filters, setFilter, setFilters, clearAll, activeCount, hasActiveFilters } = useFilterState(category)

  // Local State
  const [fabSheetOpen, setFabSheetOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [searchQuery, setSearchQuery] = useState((filters['q'] as string) || '')
  const [brandPage, setBrandPage] = useState(0)
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  const { recentSearches, addSearch, removeSearch, clearSearches } = useRecentSearches()
  const { data: suggestions = [], isFetching: isFetchingSuggestions } = useSuggestions(debouncedSearch)

  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  // Sync search state with URL when initial loads
  useEffect(() => {
    setSearchQuery((filters['q'] as string) || '')
  }, [filters])

  const sort = (filters['sort'] as string) ?? sortOptions[0]?.value ?? ''
  const page = Number(filters['page'] ?? '1')

  // Fetch Data
  const { items, total, totalPages, isLoading, isFetching } = useUnifiedListings(category, filters, page)

  // Handlers
  const submitSearch = (query: string = searchQuery) => {
    if (query.trim()) addSearch(query)
    setSearchQuery(query)
    setFilter('page', null)
    setFilter('q', query || null)
    setIsSearchFocused(false)
  }

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submitSearch()
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

  const handleFiltersChange = (updates: Record<string, string | boolean | null>) => {
    setFilters({ ...updates, page: null })
  }

  const handleSave = (id: string) => {
    // TODO: wire to favorites API
    console.log('save', id)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CategoryBar currentCategory={category} />

      {/* ── 1. Premium Header (Breadcrumb + Search + Action) ──────────────── */}
      <div className="bg-gradient-to-b from-surface-container-lowest to-background border-b border-outline-variant/30 pb-5 pt-3">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-2">
            
            {/* Title & Breadcrumb Group */}
            <div className="flex flex-col gap-1.5 flex-shrink-0 w-full md:w-auto">
              
              {/* Premium Title */}
              <div className="flex items-center gap-3">
                {/* Clean, Elegant Icon Box */}
                <div className="w-12 h-12 rounded-[14px] bg-primary/5 border border-primary/10 shadow-sm flex items-center justify-center text-primary">
                  <CategoryIcon size={22} strokeWidth={2.5} />
                </div>
                
                {/* Sharp, Heavy Typography */}
                <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-on-surface leading-none">
                  {meta.labelAr}
                </h1>
              </div>
              
              {/* Minimalist Breadcrumb */}
              <nav className="flex items-center gap-2 text-[13px] font-medium text-on-surface-variant/70 mt-1 px-1">
                <Link href="/" className="hover:text-primary transition-colors">{t('home')}</Link>
                <ChevronLeft size={14} className="text-outline-variant/60" />
                <span className="text-on-surface/90">{meta.labelAr}</span>
                
                {(filters['q'] as string) && (
                  <>
                    <ChevronLeft size={14} className="text-outline-variant/60" />
                    <span className="text-on-surface">
                      {filters['q']}
                    </span>
                  </>
                )}
              </nav>
            </div>

            {/* Search */}
            <div ref={searchContainerRef} className="relative w-full md:max-w-xl lg:max-w-2xl mx-auto group z-40">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={t('searchIn', { category: meta.labelAr })}
                className={clsx(
                  "w-full h-14 border border-outline-variant/50 bg-surface-container-lowest/50 pr-6 pl-24 text-[14px] placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10 shadow-sm transition-all text-right",
                  isSearchFocused && (searchQuery ? suggestions.length > 0 : recentSearches.length > 0) 
                    ? "rounded-t-3xl rounded-b-none border-b-transparent shadow-md"
                    : "rounded-full hover:shadow-md"
                )}
              />
              
              {/* Clear Button */}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute left-[60px] top-[14px] text-on-surface-variant hover:text-on-surface hover:bg-surface-container p-1.5 rounded-full transition-colors z-10"
                >
                  <X size={15} />
                </button>
              )}

              {/* Primary Search Button (Like Airbnb) */}
              <button
                onClick={() => submitSearch()}
                className="absolute left-1.5 top-1.5 w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20 z-10"
              >
                <Search size={18} strokeWidth={2.5} />
              </button>

              {/* Dropdown (Recent Searches / Suggestions) */}
              {isSearchFocused && (searchQuery ? suggestions.length > 0 : recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 bg-background border border-outline-variant/50 border-t-0 rounded-b-3xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-3 flex items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest/50">
                    <span className="text-[12px] font-semibold text-on-surface-variant">
                      {searchQuery ? 'اقتراحات' : 'عمليات البحث السابقة'}
                    </span>
                    {!searchQuery && (
                      <button 
                        onClick={clearSearches}
                        className="text-[11px] text-primary hover:underline"
                      >
                        مسح السجل
                      </button>
                    )}
                    {searchQuery && isFetchingSuggestions && (
                      <Loader2 size={12} className="animate-spin text-primary" />
                    )}
                  </div>
                  <ul className="py-2">
                    {searchQuery ? (
                      // Suggestions
                      suggestions.map(term => (
                        <li key={term} className="px-2 py-0.5">
                          <button
                            onClick={() => submitSearch(term)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container rounded-lg transition-colors text-right"
                          >
                            <Search size={15} className="text-on-surface-variant/70" />
                            <span className="text-[14px] text-on-surface font-medium">{term}</span>
                          </button>
                        </li>
                      ))
                    ) : (
                      // Recent Searches
                      recentSearches.map(term => (
                        <li key={term} className="flex items-center justify-between px-2 py-0.5">
                          <button
                            onClick={() => submitSearch(term)}
                            className="flex-1 flex items-center gap-3 px-3 py-2.5 hover:bg-surface-container rounded-lg transition-colors text-right"
                          >
                            <Clock size={15} className="text-on-surface-variant/70" />
                            <span className="text-[14px] text-on-surface font-medium">{term}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSearch(term)
                            }}
                            className="p-2 mr-2 text-on-surface-variant/50 hover:text-error hover:bg-error/10 rounded-full transition-colors"
                            aria-label="مسح من السجل"
                          >
                            <X size={14} />
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Add Button */}
            <Link
              href={getAddListingHref(category)}
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-[#2563eb] text-on-primary text-[14px] font-semibold hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all whitespace-nowrap flex-shrink-0"
            >
              <Plus size={18} strokeWidth={2.5} />
              {t('addListing')}
            </Link>
          </div>
        </div>
      </div>

      {/* ── 0. Popular Brands (Responsive Swipeable Slider) ────────────────── */}
      {category === 'cars' && (() => {
        // Responsive: 3 cols on mobile (6/page), 4 cols on md (8/page), 5 cols on lg (10/page)
        // We compute per page count from CSS breakpoints but for pagination use 6 (mobile-first)
        const ITEMS_PER_PAGE_LG = 10 // 5x2
        // Use the largest (10) for page slicing — smaller screens just hide extras via CSS
        const totalPages = Math.ceil(POPULAR_MAKES.length / ITEMS_PER_PAGE_LG)
        
        return (
        <div className="bg-surface-container-lowest border-b border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 relative group">
            
            {/* Section Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-sm font-bold text-on-surface tracking-wide">تصفح حسب الماركة</h2>
              </div>
              <span className="text-xs text-on-surface-variant font-medium">
                {brandPage + 1} / {totalPages}
              </span>
            </div>

            {/* Navigation Arrow — Left (Next in RTL) — hidden on mobile */}
            <div className="absolute inset-y-0 -left-1 hidden sm:flex items-center z-20">
              <button 
                onClick={() => setBrandPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={brandPage >= totalPages - 1}
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  "bg-surface-container-high border border-outline-variant/30 shadow-md text-on-surface-variant",
                  brandPage >= totalPages - 1 
                    ? "opacity-0 scale-90 pointer-events-none" 
                    : "hover:bg-primary hover:text-on-primary hover:border-primary hover:shadow-lg opacity-0 group-hover:opacity-100"
                )}
              >
                <span className="material-symbols-outlined text-xl">chevron_left</span>
              </button>
            </div>
            
            {/* Navigation Arrow — Right (Prev in RTL) — hidden on mobile */}
            <div className="absolute inset-y-0 -right-1 hidden sm:flex items-center z-20">
              <button 
                onClick={() => setBrandPage(p => Math.max(0, p - 1))}
                disabled={brandPage === 0}
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  "bg-surface-container-high border border-outline-variant/30 shadow-md text-on-surface-variant",
                  brandPage === 0 
                    ? "opacity-0 scale-90 pointer-events-none" 
                    : "hover:bg-primary hover:text-on-primary hover:border-primary hover:shadow-lg opacity-0 group-hover:opacity-100"
                )}
              >
                <span className="material-symbols-outlined text-xl">chevron_right</span>
              </button>
            </div>

            {/* Slider Content — touch swipeable */}
            <div 
              className="overflow-hidden rounded-2xl touch-pan-y"
              onTouchStart={(e) => {
                const touch = e.touches[0]
                ;(e.currentTarget as any)._touchStartX = touch.clientX
                ;(e.currentTarget as any)._touchStartY = touch.clientY
              }}
              onTouchEnd={(e) => {
                const startX = (e.currentTarget as any)._touchStartX
                const startY = (e.currentTarget as any)._touchStartY
                if (startX == null) return
                const endX = e.changedTouches[0].clientX
                const endY = e.changedTouches[0].clientY
                const diffX = startX - endX
                const diffY = Math.abs(startY - endY)
                // Only swipe if horizontal movement > 50px and more horizontal than vertical
                if (Math.abs(diffX) > 50 && Math.abs(diffX) > diffY) {
                  if (diffX > 0) {
                    // Swiped left → in RTL = next page
                    setBrandPage(p => Math.min(totalPages - 1, p + 1))
                  } else {
                    // Swiped right → in RTL = prev page
                    setBrandPage(p => Math.max(0, p - 1))
                  }
                }
              }}
            >
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(${brandPage * 100}%)` }}
              >
                {Array.from({ length: totalPages }).map((_, pageIdx) => (
                  <div key={pageIdx} className="w-full flex-shrink-0 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 grid-rows-2 gap-2 sm:gap-4 px-1 sm:px-6">
                    {POPULAR_MAKES.slice(pageIdx * ITEMS_PER_PAGE_LG, (pageIdx + 1) * ITEMS_PER_PAGE_LG).map((make, makeIdx) => {
                      const isActive = filters['make'] === make.value;
                      return (
                        <button
                          key={make.value}
                          onClick={() => handleFilterChange('make', isActive ? null : make.value)}
                          className={clsx(
                            "flex flex-col items-center gap-1.5 sm:gap-2.5 py-3 sm:py-4 px-1 sm:px-2 rounded-xl transition-all duration-300",
                            // Hide 9th & 10th items on md (4-col shows 8), hide 7th-10th on mobile (3-col shows 6)
                            makeIdx >= 6 && "hidden sm:flex",
                            makeIdx >= 8 && "sm:hidden lg:flex",
                            isActive 
                              ? "bg-primary-fixed/60 ring-1 ring-primary/30 shadow-sm" 
                              : "hover:bg-surface-container hover:shadow-sm"
                          )}
                        >
                          <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={make.logo} 
                              alt={make.name} 
                              className={clsx(
                                "w-9 h-9 sm:w-12 sm:h-12 object-contain transition-all duration-300",
                                isActive ? "scale-110" : "opacity-75 group-hover/brand:opacity-100"
                              )} 
                              loading="lazy"
                              onError={(e) => {
                                const target = e.currentTarget
                                target.style.display = 'none'
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = 'flex'
                              }}
                            />
                            <span 
                              style={{ display: 'none' }}
                              className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-primary-fixed items-center justify-center text-primary font-bold text-base sm:text-lg"
                            >
                              {make.name.charAt(0)}
                            </span>
                          </div>
                          <span className={clsx(
                            "text-[10px] sm:text-[11px] text-center font-bold tracking-tight truncate w-full leading-tight",
                            isActive ? "text-primary" : "text-on-surface-variant"
                          )}>
                            {make.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5 mt-4 sm:mt-5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setBrandPage(i)}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                    brandPage === i 
                      ? "w-8 bg-primary" 
                      : "w-2 bg-outline-variant/40 hover:bg-outline-variant"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>
        )
      })()}


      {/* ── 3. Main Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 flex gap-6 items-start py-5">
        
        {/* Sidebar */}
        <FilterSidebar
          category={category}
          filters={filters}
          onFilterChange={handleFilterChange}
          onFiltersChange={handleFiltersChange}
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
                onRemove={key => {
                  if (key === 'make') {
                    handleFiltersChange({ make: null, model: null })
                  } else if (key === 'governorate') {
                    handleFiltersChange({ governorate: null, city: null })
                  } else {
                    setFilter(key, null)
                  }
                }}
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
      <div 
        className="lg:hidden fixed left-4 z-40 transition-all duration-300"
        style={{ bottom: 'calc(75px + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={() => setFabSheetOpen(true)}
          className="flex items-center gap-2 h-12 px-6 rounded-full shadow-[0_8px_30px_rgb(37,99,235,0.3)] text-[14px] font-medium bg-primary text-on-primary active:scale-95 transition-all cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          {t('filters')}
          {activeCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-background text-primary text-[10px] font-bold flex items-center justify-center -mr-1 shadow-sm">
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
          onFiltersChange={handleFiltersChange}
          onClearAll={clearAll}
          onClose={() => setFabSheetOpen(false)}
          total={total}
        />
      )}

      <Footer />
    </div>
  )
}
