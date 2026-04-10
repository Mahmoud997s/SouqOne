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
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-7xl mx-auto px-6"><ListingSkeleton count={6} /></main></>}>
      <JobsContent />
    </Suspense>
  );
}


const licenseOptions = [
  { value: 'LIGHT', label: 'خفيفة' },
  { value: 'HEAVY', label: 'ثقيلة' },
  { value: 'TRANSPORT', label: 'نقل' },
  { value: 'BUS', label: 'حافلات' },
  { value: 'MOTORCYCLE', label: 'دراجة' },
];

const sortOptions = [
  { value: 'createdAt_desc', label: 'الأحدث' },
  { value: 'createdAt_asc', label: 'الأقدم' },
  { value: 'salary_desc', label: 'الراتب: الأعلى' },
  { value: 'salary_asc', label: 'الراتب: الأقل' },
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

  const govs = getGovernorates('OM');

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black mb-1">
              <span className="material-symbols-outlined text-primary align-middle text-3xl ml-2">badge</span>
              وظائف السائقين
            </h1>
            <p className="text-on-surface-variant">ابحث عن سائق أو اعرض خدماتك كسائق محترف</p>
          </div>
          <Link href="/jobs/new" className="btn-orange px-6 py-3 text-sm font-black shrink-0 hover:brightness-110 transition-colors">
            <span className="material-symbols-outlined text-lg align-middle ml-1">add</span>
            أضف إعلان وظيفة
          </Link>
        </div>

        {/* Tabs: OFFERING / HIRING / ALL */}
        <div className="flex gap-2 mb-6">
          {[
            { value: '', label: 'الكل', icon: 'apps' },
            { value: 'OFFERING', label: 'يبحثون عن عمل', icon: 'person_search' },
            { value: 'HIRING', label: 'يبحثون عن سائق', icon: 'person_add' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateParam('jobType', tab.value)}
              className={`flex items-center gap-2 px-5 py-3 font-black text-sm transition-all ${
                jobType === tab.value
                  ? 'bg-on-surface text-surface'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 md:p-6 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg">search</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="ابحث بالعنوان أو الوصف..."
                className="w-full bg-surface-container-lowest border border-outline-variant/30 py-3 pr-10 pl-4 focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-sm"
                dir="rtl"
              />
            </div>
            <select
              value={governorate}
              onChange={(e) => updateParam('governorate', e.target.value)}
              className="bg-surface-container border border-outline-variant/10 py-3 px-4 text-sm min-w-[160px]"
            >
              <option value="">كل المحافظات</option>
              {govs.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="bg-surface-container border border-outline-variant/10 py-3 px-4 text-sm min-w-[140px]"
            >
              <option value="">الترتيب</option>
              {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={handleSearch} className="btn-editorial px-6 py-3 text-sm font-black hover:brightness-110 transition-colors">بحث</button>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-on-surface-variant font-bold self-center ml-2">نوع الدوام:</span>
            {employmentOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => updateParam('employmentType', employmentType === o.value ? '' : o.value)}
                className={`px-3 py-1.5 text-xs font-black transition-all ${
                  employmentType === o.value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-on-surface-variant font-bold self-center ml-2">الرخصة:</span>
            {licenseOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => updateParam('licenseType', licenseType === o.value ? '' : o.value)}
                className={`px-3 py-1.5 text-xs font-black transition-all ${
                  licenseType === o.value
                    ? 'bg-on-surface text-surface'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <ListingSkeleton count={6} />
        ) : isError ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">error</span>
            <p className="text-xl font-bold mb-4">حدث خطأ في تحميل البيانات</p>
            <button onClick={() => refetch()} className="bg-primary text-on-primary px-6 py-3 text-sm font-black hover:brightness-110 transition-colors">إعادة المحاولة</button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">work_off</span>
            <p className="text-xl font-bold text-on-surface mb-2">لا توجد وظائف</p>
            <p className="text-on-surface-variant mb-6">جرب تغيير معايير البحث أو أضف إعلان جديد</p>
            <Link href="/jobs/new" className="btn-orange px-6 py-3 text-sm font-black hover:brightness-110 transition-colors">أضف إعلان وظيفة</Link>
          </div>
        ) : (
          <>
            <p className="text-sm text-on-surface-variant mb-6">{meta?.total ?? 0} وظيفة</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const sp = new URLSearchParams(searchParams);
                      sp.set('page', String(p));
                      router.push(`/jobs?${sp.toString()}`);
                    }}
                    className={`w-10 h-10 text-sm font-black transition-all ${
                      p === Number(page)
                        ? 'bg-on-surface text-surface'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
