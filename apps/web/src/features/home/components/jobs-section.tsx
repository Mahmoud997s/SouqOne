'use client';

import Link from 'next/link';
import { JobCard } from '@/features/jobs/components/job-card';
import { CardSkeleton } from '@/components/loading-skeleton';
import type { JobItem } from '@/lib/api';

interface JobsSectionProps {
  items: JobItem[];
  isLoading: boolean;
}

export function JobsSection({ items, isLoading }: JobsSectionProps) {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-primary" />
              <h2 className="text-xl md:text-3xl font-black">وظائف السائقين</h2>
            </div>
            <p className="text-on-surface-variant text-sm">ابحث عن سائق محترف أو اعرض خدماتك</p>
          </div>
          <Link href="/jobs" className="text-primary font-bold text-sm hover:underline transition-colors shrink-0">
            عرض الكل ←
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container-lowest">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">work_off</span>
            <p className="text-on-surface-variant font-medium mb-4">لا توجد وظائف حالياً</p>
            <Link href="/jobs/new" className="btn-orange px-6 py-3 text-sm font-black inline-block hover:brightness-110 transition-colors">
              أضف إعلان وظيفة
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
