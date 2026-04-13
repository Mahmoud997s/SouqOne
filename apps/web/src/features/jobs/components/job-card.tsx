'use client';

import { Link } from '@/i18n/navigation';
import type { JobItem } from '@/lib/api';
import { employmentLabels } from '@/lib/constants/jobs';
import { relativeTime } from '@/lib/time-utils';

const TYPE_STYLES = {
  OFFERING: { label: 'يبحث عن عمل', posterLabel: 'فرد', bg: '#EAF3DE', color: '#27500A' },
  HIRING:   { label: 'يبحث عن سائق', posterLabel: 'شركة', bg: '#E6F1FB', color: '#0C447C' },
} as const;

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

function isNew(date: string) {
  return Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function JobCard({ job }: { job: JobItem }) {
  const style = TYPE_STYLES[job.jobType] ?? TYPE_STYLES.OFFERING;
  const posterName = job.user?.displayName || job.user?.username || 'مستخدم';
  const city = job.city || job.governorate || '';

  const tags: { icon: React.ReactNode; text: string }[] = [];

  tags.push({
    icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
    text: employmentLabels[job.employmentType] ?? job.employmentType,
  });

  if (job.experienceYears != null) {
    tags.push({
      icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      text: `${job.experienceYears} سنة خبرة`,
    });
  }

  if (city) {
    tags.push({
      icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      text: city,
    });
  }

  if (job.licenseTypes.length > 0) {
    const first = licenseLabels[job.licenseTypes[0]] ?? job.licenseTypes[0];
    tags.push({
      icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10"/><path d="M7 12h6"/></svg>,
      text: job.licenseTypes.length > 1 ? `${first} +${job.licenseTypes.length - 1}` : first,
    });
  }

  return (
    <Link href={`/jobs/${job.id}`} className="block group h-full">
      <article
       
        className="h-full bg-surface-container-lowest dark:bg-surface-container flex flex-col gap-2.5 transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
        style={{ border: '0.5px solid var(--color-outline-variant, #e0e0e0)', borderRadius: 12, padding: '14px 14px 12px' }}
      >
        {/* Row 1: Avatar + Poster info + Type badge */}
        <div className="flex items-center gap-2.5">
          {/* Avatar */}
          <div
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold select-none"
            style={{ background: style.bg, color: style.color, border: '0.5px solid var(--color-outline-variant, #e0e0e0)' }}
          >
            {getInitials(posterName)}
          </div>

          {/* Poster info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-on-surface truncate leading-tight">{posterName}</p>
            <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
              {style.posterLabel}{city ? ` · ${city}` : ''}
            </p>
          </div>

          {/* Type badge */}
          <span
            className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{ background: style.bg, color: style.color }}
          >
            {style.label}
          </span>
        </div>

        {/* Divider */}
        <div style={{ height: 0.5, background: 'var(--color-outline-variant, #e0e0e0)' }} />

        {/* Title */}
        <h3 className="text-[15px] font-medium text-on-surface leading-snug line-clamp-2">
          {job.title}
        </h3>

        {/* Salary */}
        <div className="flex items-baseline gap-1">
          {job.salary ? (
            <>
              <span className="text-lg font-medium text-on-surface">
                {Number(job.salary).toLocaleString('en-US')}
              </span>
              <span className="text-xs text-on-surface-variant">
                ر.ع{job.salaryPeriod ? salaryPeriodLabels[job.salaryPeriod] : ''}
              </span>
            </>
          ) : (
            <span className="text-xs text-on-surface-variant font-medium">قابل للتفاوض</span>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 text-[10px] font-medium text-on-surface-variant bg-surface-container-low dark:bg-surface-container-high px-2 py-1 rounded-md"
              style={{ border: '0.5px solid var(--color-outline-variant, #e0e0e0)' }}
            >
              {tag.icon}
              {tag.text}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-2">
          {/* Time — right side in RTL */}
          <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {relativeTime(job.createdAt)}
          </span>

          {/* NEW badge — left side in RTL */}
          {isNew(job.createdAt) && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EAF3DE', color: '#27500A' }}>
              جديد
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
