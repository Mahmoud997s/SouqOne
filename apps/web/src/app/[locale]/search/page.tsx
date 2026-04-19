'use client';

import { Suspense, useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter, Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useSearch, type SearchHit } from '@/lib/api/search';
import { fuelOptions as fuelOptionsFn, conditionOptions as conditionOptionsFn } from '@/lib/constants/mappings';
import { getGovernorates } from '@/lib/location-data';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

// ─── Entity config ───
const ENTITY_CFG: Record<string, { labelKey: string; icon: string; color: string; href: (h: SearchHit) => string }> = {
  listings:    { labelKey: 'cars',      icon: 'directions_car',          color: 'bg-blue-500',    href: h => `/listings/${h.slug || h.id}` },
  spare_parts: { labelKey: 'parts',     icon: 'settings',                color: 'bg-orange-500',  href: h => `/parts/${h.slug || h.id}` },
  buses:       { labelKey: 'buses',     icon: 'directions_bus',          color: 'bg-green-500',   href: h => `/buses/${h.slug || h.id}` },
  equipment:   { labelKey: 'equipment', icon: 'precision_manufacturing', color: 'bg-yellow-600',  href: h => `/equipment/${h.slug || h.id}` },
  services:    { labelKey: 'services',  icon: 'home_repair_service',     color: 'bg-violet-500',  href: h => `/services/${h.slug || h.id}` },
  jobs:        { labelKey: 'jobs',      icon: 'work',                    color: 'bg-teal-500',    href: h => `/jobs/${h.slug || h.id}` },
  transport:   { labelKey: 'transport', icon: 'local_shipping',          color: 'bg-sky-500',     href: h => `/transport/${h.slug || h.id}` },
  trips:       { labelKey: 'trips',     icon: 'route',                   color: 'bg-emerald-500', href: h => `/trips/${h.slug || h.id}` },
};

const TABS = [
  { value: '',            icon: 'apps',                    labelKey: 'all' },
  { value: 'listings',    icon: 'directions_car',          labelKey: 'cars' },
  { value: 'spare_parts', icon: 'settings',                labelKey: 'parts' },
  { value: 'buses',       icon: 'directions_bus',          labelKey: 'buses' },
  { value: 'equipment',   icon: 'precision_manufacturing', labelKey: 'equipment' },
  { value: 'services',    icon: 'home_repair_service',     labelKey: 'services' },
  { value: 'jobs',        icon: 'work',                    labelKey: 'jobs' },
];

const CAR_MAKES = [
  'Toyota', 'Nissan', 'Honda', 'Hyundai', 'Kia', 'Mitsubishi',
  'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Lexus',
  'Land Rover', 'Jeep', 'GMC', 'Isuzu', 'Subaru', 'Mazda',
];

const RECENT_KEY = 'carone.recent_searches';
function getRecent(): string[] { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } }
function saveRecent(q: string) { const r = getRecent().filter(s => s !== q); r.unshift(q); localStorage.setItem(RECENT_KEY, JSON.stringify(r.slice(0, 6))); }

export default function SearchPage() {
  return (
    <Suspense fallback={<><Navbar /><div className="pt-32 flex justify-center"><span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span></div></>}>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const ts = useTranslations('search');
  const tm = useTranslations('mappings');
  const searchParams = useSearchParams();
  const router = useRouter();

  const qParam      = searchParams.get('q') || '';
  const typeParam   = searchParams.get('type') || '';
  const govParam    = searchParams.get('governorate') || '';
  const sortParam   = searchParams.get('sort') || '';
  const minPParam   = searchParams.get('minPrice') || '';
  const maxPParam   = searchParams.get('maxPrice') || '';
  const makeParam   = searchParams.get('make') || '';
  const condParam   = searchParams.get('condition') || '';

  const [query, setQuery]           = useState(qParam);
  const [activeTab, setActiveTab]   = useState(typeParam);
  const [governorate, setGovernorate] = useState(govParam);
  const [sort, setSort]             = useState(sortParam);
  const [minPrice, setMinPrice]     = useState(minPParam);
  const [maxPrice, setMaxPrice]     = useState(maxPParam);
  const [selectedMake, setSelectedMake] = useState(makeParam);
  const [selectedCond, setSelectedCond] = useState(condParam);
  const [page, setPage]             = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuelOpts  = fuelOptionsFn(tm);
  const condOpts  = conditionOptionsFn(tm).filter(o => ['NEW', 'USED', 'LIKE_NEW'].includes(o.value));
  const govOpts   = getGovernorates('OM');

  useEffect(() => { setPage(1); }, [qParam, typeParam, govParam, sortParam, minPParam, maxPParam, makeParam, condParam]);

  const { data, isLoading, isError } = useSearch({
    q:           qParam || undefined,
    entityType:  typeParam || undefined,
    governorate: govParam || undefined,
    sortBy:      (sortParam as 'price:asc' | 'price:desc' | 'newest') || undefined,
    minPrice:    minPParam ? Number(minPParam) : undefined,
    maxPrice:    maxPParam ? Number(maxPParam) : undefined,
    make:        makeParam || undefined,
    condition:   condParam || undefined,
    page,
    limit: 20,
  });

  const total      = data?.meta.total ?? 0;
  const totalPages = data?.meta.totalPages ?? 1;

  const countByType = useMemo(() =>
    (data?.items ?? []).reduce<Record<string, number>>((acc, h) => {
      acc[h._entityType] = (acc[h._entityType] || 0) + 1;
      return acc;
    }, {}),
  [data]);

  const activeFilterCount = [govParam, minPParam, maxPParam, makeParam, condParam, sortParam].filter(Boolean).length;

  function buildURL(overrides: Record<string, string> = {}) {
    const p = new URLSearchParams();
    const vals: Record<string, string> = {
      q: query, type: activeTab, governorate, sort,
      minPrice, maxPrice, make: selectedMake, condition: selectedCond,
      ...overrides,
    };
    Object.entries(vals).forEach(([k, v]) => { if (v) p.set(k, v); });
    return `/search?${p.toString()}`;
  }

  function applyFilters(overrides: Record<string, string> = {}) {
    setPage(1);
    router.push(buildURL(overrides));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    saveRecent(query.trim());
    applyFilters({ q: query.trim() });
  }

  function clearAllFilters() {
    setGovernorate(''); setSort(''); setMinPrice(''); setMaxPrice('');
    setSelectedMake(''); setSelectedCond('');
    router.push(qParam ? `/search?q=${encodeURIComponent(qParam)}&type=${activeTab}` : `/search?type=${activeTab}`);
  }

  const isCarTab = activeTab === 'listings' || activeTab === '';

  // ── Filter panel (reused in sidebar + bottom sheet) ──
  function FiltersPanel({ onApply }: { onApply?: () => void }) {
    return (
      <div className="space-y-5">
        {/* Sort */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant block mb-2">الترتيب</label>
          <div className="flex flex-col gap-1.5">
            {[
              { value: '', label: 'الأحدث' },
              { value: 'price:asc', label: 'السعر: الأقل' },
              { value: 'price:desc', label: 'السعر: الأعلى' },
            ].map(opt => (
              <button key={opt.value} type="button"
                onClick={() => setSort(opt.value)}
                className={`text-start px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${sort === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Governorate */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant block mb-2">المحافظة</label>
          <select value={governorate} onChange={e => setGovernorate(e.target.value)}
            className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm">
            <option value="">كل المحافظات</option>
            {govOpts.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>

        {/* Price range */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant block mb-2">نطاق السعر</label>
          <div className="flex gap-2">
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)}
              placeholder="من" className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm" />
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              placeholder="إلى" className="flex-1 bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm" />
          </div>
        </div>

        {/* Make — car tabs only */}
        {isCarTab && (
          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-2">الماركة</label>
            <select value={selectedMake} onChange={e => setSelectedMake(e.target.value)}
              className="w-full bg-surface-container-low dark:bg-surface-container-high border border-outline-variant/15 rounded-xl py-2.5 px-3 focus:border-primary outline-none text-sm">
              <option value="">كل الماركات</option>
              {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {/* Condition */}
        <div>
          <label className="text-xs font-bold text-on-surface-variant block mb-2">الحالة</label>
          <div className="flex flex-wrap gap-1.5">
            {condOpts.map(opt => (
              <button key={opt.value} type="button"
                onClick={() => setSelectedCond(selectedCond === opt.value ? '' : opt.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedCond === opt.value ? 'bg-primary text-on-primary' : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:bg-surface-container-high'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fuel — car tabs only */}
        {isCarTab && (
          <div>
            <label className="text-xs font-bold text-on-surface-variant block mb-2">نوع الوقود</label>
            <div className="flex flex-wrap gap-1.5">
              {fuelOpts.map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => { /* fuel not in SearchParams yet — navigate with condition */ }}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant">
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => { applyFilters(); onApply?.(); }}
          className="bg-primary text-on-primary w-full py-2.5 text-sm font-black rounded-xl hover:brightness-110 transition-colors">
          تطبيق الفلاتر
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#004ac6] via-[#2563eb] to-[#0B2447]">
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 pt-20 pb-6 sm:pt-24 sm:pb-8">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-5">
              <h1 className="text-xl sm:text-2xl font-black text-white drop-shadow-sm mb-1">{ts('searchInSouqOne')}</h1>
              {qParam && (
                <p className="text-white/60 text-sm">
                  {total > 0 ? `${total} نتيجة لـ "${qParam}"` : ts('noResultsFor', { query: qParam })}
                </p>
              )}
            </div>

            {/* Search input */}
            <form onSubmit={handleSubmit}>
              <div className="flex items-center bg-white dark:bg-surface-container rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.25)] overflow-hidden">
                <span className="material-symbols-outlined text-primary/40 text-xl px-4 shrink-0">search</span>
                <input ref={inputRef} type="text" value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder={ts('searchPlaceholder')}
                  className="flex-1 py-4 text-sm font-medium text-on-surface bg-transparent focus:outline-none placeholder:text-on-surface-variant/40"
                  autoFocus />
                {query && (
                  <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="px-2 text-on-surface-variant/40 hover:text-on-surface-variant">
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                )}
                <button type="submit" className="bg-primary text-white px-6 py-4 text-sm font-black hover:brightness-110 transition-all shrink-0">
                  {ts('searchBtn')}
                </button>
              </div>
            </form>

            {/* Recent searches */}
            {!qParam && getRecent().length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                <span className="text-white/50 text-xs self-center">{ts('recentSearches')}:</span>
                {getRecent().map((r, i) => (
                  <button key={i} onClick={() => { setQuery(r); saveRecent(r); applyFilters({ q: r }); }}
                    className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full transition-all">
                    <span className="material-symbols-outlined text-[11px]">history</span>
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mt-5 pb-1 justify-center">
              {TABS.map(tab => {
                const cnt = tab.value ? (countByType[tab.value] ?? 0) : total;
                return (
                  <button key={tab.value}
                    onClick={() => { setActiveTab(tab.value); applyFilters({ type: tab.value }); }}
                    className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab.value ? 'bg-white text-primary shadow-md' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}>
                    <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                    {ts(tab.labelKey as Parameters<typeof ts>[0])}
                    {qParam && cnt > 0 && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.value ? 'bg-primary/10 text-primary' : 'bg-white/20 text-white'}`}>{cnt}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {qParam && (
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            {/* Mobile filter button */}
            <button onClick={() => setShowMobileFilters(true)}
              className="flex items-center gap-2 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl px-4 py-2.5 text-sm font-black text-on-surface-variant">
              <span className="material-symbols-outlined text-base">tune</span>
              فلاتر
              {activeFilterCount > 0 && (
                <span className="bg-primary text-on-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
              )}
            </button>
            {total > 0 && <span className="text-sm text-on-surface-variant ml-auto">{total} نتيجة</span>}
          </div>
        )}

        {/* Mobile Bottom Sheet */}
        <BottomSheet open={showMobileFilters} onClose={() => setShowMobileFilters(false)} title="فلاتر البحث">
          <FiltersPanel onApply={() => setShowMobileFilters(false)} />
        </BottomSheet>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          {qParam && (
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">tune</span>
                    <h2 className="text-sm font-black">فلاتر البحث</h2>
                    {activeFilterCount > 0 && (
                      <span className="bg-primary text-on-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">{activeFilterCount}</span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="text-[11px] font-bold text-on-surface-variant hover:text-primary transition-colors">
                      مسح الكل ×
                    </button>
                  )}
                </div>
                <div className="p-5 max-h-[calc(100vh-160px)] overflow-y-auto">
                  <FiltersPanel />
                </div>
              </div>
            </aside>
          )}

          {/* Results */}
          <div className="flex-1 min-w-0">
            {!qParam ? (
              <EmptyPrompt onSearch={q => { setQuery(q); saveRecent(q); applyFilters({ q }); }} ts={ts} />
            ) : isLoading ? (
              <SearchSkeleton />
            ) : isError ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-5xl text-error mb-3 block">error_outline</span>
                <p className="text-on-surface-variant">حدث خطأ، حاول مجدداً</p>
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="text-center py-20">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">search_off</span>
                <p className="text-xl font-black text-on-surface mb-1">{ts('noResultsFor', { query: qParam })}</p>
                <p className="text-on-surface-variant text-sm">جرّب كلمات أخرى أو تصفّح الأقسام</p>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {['تويوتا', 'نيسان', 'هوندا', 'كيا', 'فورد'].map(s => (
                    <button key={s} onClick={() => { setQuery(s); saveRecent(s); applyFilters({ q: s }); }}
                      className="bg-surface-container px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary hover:text-on-primary transition-all">{s}</button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop total */}
                <div className="hidden lg:flex items-center justify-between mb-4">
                  <p className="text-sm text-on-surface-variant">{total} نتيجة</p>
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors">{activeFilterCount} فلتر مفعّل · مسح الكل</button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.items.map(hit => <SearchCard key={hit.id} hit={hit} ts={ts} />)}
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-10">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                      className="w-10 h-10 border border-outline-variant/15 rounded-xl flex items-center justify-center hover:bg-surface-container disabled:opacity-30 transition-all">
                      <span className="material-symbols-outlined icon-flip">chevron_right</span>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-10 h-10 flex items-center justify-center font-black text-sm rounded-xl transition-all ${p === page ? 'bg-primary text-on-primary' : 'border border-outline-variant/15 hover:bg-surface-container'}`}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                      className="w-10 h-10 border border-outline-variant/15 rounded-xl flex items-center justify-center hover:bg-surface-container disabled:opacity-30 transition-all">
                      <span className="material-symbols-outlined icon-flip">chevron_left</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

// ─── Search Card ───
function SearchCard({ hit, ts }: { hit: SearchHit; ts: any }) {
  const cfg = ENTITY_CFG[hit._entityType];
  const href = cfg?.href(hit) ?? '#';
  const price = hit.price ?? hit.basePrice ?? hit.priceFrom ?? hit.pricePerTrip;

  return (
    <Link href={href}
      className="group bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-200 flex flex-col">
      <div className="relative h-44 bg-surface-container-low overflow-hidden">
        {hit.imageUrl ? (
          <Image src={getImageUrl(hit.imageUrl) as string} alt={hit.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">{cfg?.icon ?? 'category'}</span>
          </div>
        )}
        {cfg && (
          <span className={`absolute top-2 start-2 ${cfg.color} text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1`}>
            <span className="material-symbols-outlined text-[11px]">{cfg.icon}</span>
            {ts(cfg.labelKey as any)}
          </span>
        )}
        {hit.governorate && (
          <span className="absolute bottom-2 start-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-sm">
            <span className="material-symbols-outlined text-[11px]">location_on</span>
            {hit.governorate}
          </span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <p className="text-sm font-black text-on-surface line-clamp-2 group-hover:text-primary transition-colors">{hit.title}</p>
        {(hit.make || hit.model || hit.year) && (
          <p className="text-xs text-on-surface-variant">{[hit.make, hit.model, hit.year].filter(Boolean).join(' · ')}</p>
        )}
        {price !== undefined && price !== null && (
          <p className="text-base font-black text-primary mt-auto pt-2">
            {Number(price).toLocaleString()} <span className="text-xs font-bold text-on-surface-variant">{hit.currency ?? 'OMR'}</span>
          </p>
        )}
      </div>
    </Link>
  );
}

// ─── Empty prompt ───
function EmptyPrompt({ onSearch, ts }: { onSearch: (q: string) => void; ts: any }) {
  const popular = ['تويوتا كامري', 'نيسان باترول', 'هوندا سيفيك', 'BMW 2024', 'قطع غيار'];
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <span className="material-symbols-outlined text-4xl text-primary">search</span>
      </div>
      <h2 className="text-xl font-black text-on-surface mb-2">ابحث عن أي شيء</h2>
      <p className="text-on-surface-variant text-sm mb-8">سيارات، قطع غيار، خدمات، وظائف، باصات...</p>
      <p className="text-xs font-bold text-on-surface-variant mb-3">{ts('popularSearches')}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {popular.map(s => (
          <button key={s} onClick={() => onSearch(s)}
            className="bg-surface-container hover:bg-primary hover:text-on-primary px-4 py-2 rounded-xl text-sm font-bold transition-all">{s}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ───
function SearchSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-2xl overflow-hidden animate-pulse">
          <div className="h-44 bg-surface-container-low" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-surface-container-low rounded-lg w-3/4" />
            <div className="h-3 bg-surface-container-low rounded-lg w-1/2" />
            <div className="h-5 bg-surface-container-low rounded-lg w-1/3 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
