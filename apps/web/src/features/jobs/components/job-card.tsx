'use client';

import Link from 'next/link';
import type { JobItem } from '@/lib/api';
import { employmentLabels } from '@/lib/constants/jobs';
import { PILL_COLORS } from '@/lib/constants/mappings';
import { relativeTime } from '@/lib/time-utils';

const jobTypeLabels: Record<string, { label: string; icon: string; pill: string; stripe: string }> = {
  OFFERING: { label: 'يبحث عن عمل', icon: 'badge', pill: PILL_COLORS.green, stripe: 'bg-brand-green' },
  HIRING:   { label: 'يبحث عن سائق', icon: 'person_search', pill: PILL_COLORS.primary, stripe: 'bg-primary' },
};

const salaryPeriodLabels: Record<string, string> = {
  DAILY: '/يوم',
  MONTHLY: '/شهر',
  YEARLY: '/سنة',
  NEGOTIABLE: 'قابل للتفاوض',
};

const licenseLabels: Record<string, string> = {
  LIGHT: 'خفيفة',
  HEAVY: 'ثقيلة',
  TRANSPORT: 'نقل',
  BUS: 'حافلات',
  MOTORCYCLE: 'دراجة',
};

export function JobCard({ job }: { job: JobItem }) {
  const typeInfo = jobTypeLabels[job.jobType] ?? { label: job.jobType, icon: 'work', pill: 'bg-surface-container text-on-surface-variant', stripe: 'bg-outline' };

  return (
    <Link href={`/jobs/${job.id}`} className="block group h-full">
      <article className="h-full rounded-xl overflow-hidden bg-surface-container-lowest border-t-[3px] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]" style={{ borderTopColor: typeInfo.stripe === 'bg-brand-green' ? 'var(--color-brand-green)' : 'var(--color-primary)' }}>

        <div className="p-4 flex flex-col h-full gap-2.5">

          {/* Row 1: Type badge */}
          <div className="flex items-center">
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded ${typeInfo.pill}`}>
              <span className="material-symbols-outlined text-[12px]">{typeInfo.icon}</span>
              {typeInfo.label}
            </span>
          </div>

          {/* Row 2: Title */}
          <h3 className="font-black text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {job.title}
          </h3>

          {/* Row 3: Salary */}
          <div>
            {job.salary ? (
              <span className="text-lg font-black text-primary">
                {Number(job.salary).toLocaleString('en-US')}{' '}
                <span className="text-xs font-bold text-on-surface-variant">
                  ر.ع{job.salaryPeriod ? salaryPeriodLabels[job.salaryPeriod] : ''}
                </span>
              </span>
            ) : (
              <span className="text-sm text-on-surface-variant font-bold">الراتب قابل للتفاوض</span>
            )}
          </div>

          {/* Row 4: Meta pills — employment · location · experience */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[12px]">work</span>
              {employmentLabels[job.employmentType] ?? job.employmentType}
            </span>
            <span className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[12px]">location_on</span>
              {job.governorate}
            </span>
            {job.experienceYears != null && (
              <span className="inline-flex items-center gap-1 bg-surface-container-low text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[12px]">history</span>
                {job.experienceYears} سنة
              </span>
            )}
          </div>

          {/* Row 5: License types */}
          {job.licenseTypes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {job.licenseTypes.map((lt) => (
                <span key={lt} className="inline-flex items-center gap-1 bg-primary/5 text-primary text-[10px] font-black px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[12px]">card_membership</span>
                  {licenseLabels[lt] ?? lt}
                </span>
              ))}
            </div>
          )}

          {/* Footer: time · applications · poster · arrow */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-outline-variant/10">
            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">schedule</span>
                {relativeTime(job.createdAt)}
              </span>
              {job._count?.applications != null && job._count.applications > 0 && (
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">group</span>
                  {job._count.applications}
                </span>
              )}
            </div>
            <span className="material-symbols-outlined text-primary text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
