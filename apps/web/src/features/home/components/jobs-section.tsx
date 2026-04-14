'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { JobCard } from '@/features/jobs/components/job-card';
import { CardSkeleton } from '@/components/loading-skeleton';
import type { JobItem } from '@/lib/api';

interface JobsSectionProps {
  items: JobItem[];
  isLoading: boolean;
}

export function JobsSection({ items, isLoading }: JobsSectionProps) {
  const t = useTranslations('home');
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-primary" />
              <h2 className="text-xl md:text-3xl font-black">{t('driverJobs')}</h2>
            </div>
            <p className="text-on-surface-variant text-sm">{t('driverJobsDesc')}</p>
          </div>
          <Link href="/jobs" className="text-primary font-bold text-sm hover:underline transition-colors shrink-0">
            {t('viewAll')}
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
            <p className="text-on-surface-variant font-medium mb-4">{t('noJobsNow')}</p>
            <Link href="/jobs/new" className="btn-warning px-6 py-2.5 text-sm font-black inline-block hover:brightness-110 transition-colors">
              {t('addJobListing')}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
