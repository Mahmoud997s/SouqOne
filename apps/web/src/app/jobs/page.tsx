'use client';

import { Suspense, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { JobCard } from '@/features/jobs/components/job-card';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { useJobs } from '@/lib/api';
import { getGovernorates } from '@/lib/location-data';
import { employmentOptions } from '@/lib/constants/jobs';

export default function JobsPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-24 pb-16"><div className="max-w-7xl mx-auto px-4 md:px-8"><ListingSkeleton count={8} /></div></main></>}>
      <JobsContent />
    </Suspense>
  );
}

const licenseOptions = [
  { value: 'LIGHT', label: 'خفيفة', icon: 'directions_car' },
  { value: 'HEAVY', label: 'ثقيلة', icon: 'local_shipping' },
  { value: 'TRANSPORT', label: 'نقل', icon: 'fire_truck' },
  { value: 'BUS', label: 'حافلات', icon: 'directions_bus' },
  { value: 'MOTORCYCLE', label: 'دراجة', icon: 'two_wheeler' },
];

const sortOptions = [
  { value: 'createdAt_desc', label: 'الأحدث' },
  { value: 'createdAt_asc', label: 'الأقدم' },
  { value: 'salary_desc', label: 'الراتب: الأعلى' },
  { value: 'salary_asc', label: 'الراتب: الأقل' },
];

const TABS = [
  { value: '', label: 'الكل', icon: 'grid_view' },
  { value: 'OFFERING', label: 'يبحثون عن عمل', icon: 'person_search' },
  { value: 'HIRING', label: 'يبحثون عن سائق', icon: 'person_add' },
];

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const jobType = searchParams.get('jobType') || '';
  const employmentType = searchParams.get('employmentType') || '';
  const governorate = searchParams.get('governorate') || '';
  const licenseType = searchParams.get('licenseType') || '';
  const sortBy = searchParams.get('sortBy') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [employmentType, licenseType, governorate, sortBy].filter(Boolean).length;

  const params = useMemo(() => {
    const p: Record<string, string> = { page, limit: '12' };
    if (search) p.search = search;
    if (jobType) p.jobType = jobType;
    if (employmentType) p.employmentType = employmentType;
    if (governorate) p.governorate = governorate;
    if (licenseType) p.licenseType = licenseType;
    if (sortBy) {
      const [field, order] = sortBy.split('_');
      if (field) p.sortBy = field;
      if (order) p.sortOrder = order;
    }
    return p;
  }, [page, search, jobType, employmentType, governorate, licenseType, sortBy]);

  const { data, isLoading, isError, refetch } = useJobs(params);
  const items = data?.items ?? [];
  const meta = data?.meta;

  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams);
    if (value) sp.set(key, value); else sp.delete(key);
    sp.delete('page');
    router.push(`/jobs?${sp.toString()}`);
  }

  function handleSearch() {
    const sp = new URLSearchParams(searchParams);
    if (searchInput) sp.set('search', searchInput); else sp.delete('search');
    sp.delete('page');
    router.push(`/jobs?${sp.toString()}`);
  }

  function clearFilters() {
    router.push('/jobs');
  }

  const govs = getGovernorates('OM');

  return (
    <>
      <Navbar />
      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none} .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}`}</style>
      <main className="pt-24 pb-16" dir="rtl">
        {/* ── Hero Section ── */}
        <div className="bg-gradient-to-b from-amber-50/80 via-amber-50/30 to-transparent dark:from-amber-950/20 dark:via-amber-950/5 dark:to-transparent pb-6">
          <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-3xl">badge</span>
                  وظائف السائقين
                </h1>
                <p className="text-on-surface-variant text-sm mt-1">ابحث عن سائق محترف أو اعرض خدماتك</p>
              </div>
              <Link href="/jobs/new" className="btn-orange px-5 py-2.5 rounded-xl text-sm font-black hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg">
                <span className="material-symbols-outlined text-base">add</span>
                أضف إعلان وظيفة
              </Link>
            </div>

            {/* Stats bar */}
            {meta && (
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 bg-white/70 dark:bg-surface-container backdrop-blur-sm border border-outline-variant/10 rounded-xl px-3 py-1.5">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-sm">work</span>
                  <span className="text-xs font-black text-on-surface">{meta.total}</span>
                  <span className="text-xs text-on-surface-variant">وظيفة متاحة</span>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => updateParam('jobType', tab.value)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                    jobType === tab.value
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500'
                      : 'bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 text-on-surface-variant hover:border-amber-500/30 hover:text-amber-700 dark:hover:text-amber-400'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search bar */}
            <div className="mt-4 flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/60 text-lg">search</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="ابحث بالعنوان أو الوصف..."
                  className="w-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl py-2.5 pr-10 pl-4 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm transition-all"
                  dir="rtl"
                />
              </div>
              <button onClick={handleSearch} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-md shadow-amber-600/20 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">search</span>
                بحث
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-1 border relative ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                    : 'bg-surface-container-lowest dark:bg-surface-container border-outline-variant/10 text-on-surface-variant hover:border-amber-500/30'
                }`}
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span className="hidden sm:inline">فلاتر</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-amber-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Expandable filters panel */}
            {showFilters && (
              <div className="mt-3 bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-2xl p-4 md:p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Row 1: Selects */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={governorate}
                    onChange={(e) => updateParam('governorate', e.target.value)}
                    className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500/40 min-w-[150px]"
                  >
                    <option value="">كل المحافظات</option>
                    {govs.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => updateParam('sortBy', e.target.value)}
                    className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 rounded-xl px-3 py-2 text-xs outline-none focus:border-amber-500/40 min-w-[130px]"
                  >
                    <option value="">الترتيب</option>
                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                      مسح الكل
                    </button>
                  )}
                </div>

                {/* Row 2: Employment Type */}
                <div>
                  <p className="text-[11px] text-on-surface-variant font-bold mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">work</span>
                    نوع الدوام
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {employmentOptions.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => updateParam('employmentType', employmentType === o.value ? '' : o.value)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                          employmentType === o.value
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-400'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 3: License Type */}
                <div>
                  <p className="text-[11px] text-on-surface-variant font-bold mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">card_membership</span>
                    نوع الرخصة
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {licenseOptions.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => updateParam('licenseType', licenseType === o.value ? '' : o.value)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                          licenseType === o.value
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 dark:hover:text-amber-400'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">{o.icon}</span>
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Results ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-surface-container-low dark:bg-surface-container rounded-2xl h-56" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-red-400">error</span>
              </div>
              <p className="text-lg font-black text-on-surface mb-2">حدث خطأ في تحميل البيانات</p>
              <p className="text-sm text-on-surface-variant mb-6">يرجى المحاولة مرة أخرى</p>
              <button onClick={() => refetch()} className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-sm font-black hover:brightness-110 transition-all">إعادة المحاولة</button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-amber-400">work_off</span>
              </div>
              <p className="text-xl font-black text-on-surface mb-2">لا توجد وظائف</p>
              <p className="text-on-surface-variant text-sm mb-6">جرّب تغيير معايير البحث أو كن أول من ينشر إعلان</p>
              <Link href="/jobs/new" className="inline-flex items-center gap-1.5 btn-orange px-6 py-3 rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-lg">
                <span className="material-symbols-outlined text-base">add</span>
                أضف إعلان وظيفة
              </Link>
            </div>
          ) : (
            <>
              {/* Results count + active filters */}
              <div className="flex items-center justify-between mb-5">
                <p className="text-sm text-on-surface-variant font-bold">
                  <span className="text-on-surface font-black">{meta?.total ?? 0}</span> وظيفة
                </p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                    مسح الفلاتر
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {items.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Number(page) > 1 && (
                    <button
                      onClick={() => {
                        const sp = new URLSearchParams(searchParams);
                        sp.set('page', String(Number(page) - 1));
                        router.push(`/jobs?${sp.toString()}`);
                      }}
                      className="w-9 h-9 rounded-lg text-xs font-black bg-surface-container-low text-on-surface-variant hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  )}
                  {Array.from({ length: meta.totalPages }, (_, i) => i + 1).slice(0, 10).map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        const sp = new URLSearchParams(searchParams);
                        sp.set('page', String(p));
                        router.push(`/jobs?${sp.toString()}`);
                      }}
                      className={`w-9 h-9 rounded-lg text-xs font-black transition-all ${
                        p === Number(page)
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {Number(page) < meta.totalPages && (
                    <button
                      onClick={() => {
                        const sp = new URLSearchParams(searchParams);
                        sp.set('page', String(Number(page) + 1));
                        router.push(`/jobs?${sp.toString()}`);
                      }}
                      className="w-9 h-9 rounded-lg text-xs font-black bg-surface-container-low text-on-surface-variant hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-950/30 transition-all flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
