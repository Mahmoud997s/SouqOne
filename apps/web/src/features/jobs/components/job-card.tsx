'use client';

import Link from 'next/link';
import type { JobItem } from '@/lib/api';
import { employmentLabels } from '@/lib/constants/jobs';
import { relativeTime } from '@/lib/time-utils';

const jobTypeConfig: Record<string, { label: string; icon: string; bg: string; text: string; accent: string }> = {
  OFFERING: {
    label: 'يبحث عن عمل',
    icon: 'badge',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    accent: 'border-emerald-500',
  },
  HIRING: {
    label: 'يبحث عن سائق',
    icon: 'person_search',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    accent: 'border-blue-500',
  },
};

const salaryPeriodLabels: Record<string, string> = {
  DAILY: '/يوم',
  MONTHLY: '/شهر',
  YEARLY: '/سنة',
  NEGOTIABLE: 'قابل للتفاوض',
};

const licenseLabels: Record<string, { label: string; icon: string }> = {
  LIGHT: { label: 'خفيفة', icon: 'directions_car' },
  HEAVY: { label: 'ثقيلة', icon: 'local_shipping' },
  TRANSPORT: { label: 'نقل', icon: 'fire_truck' },
  BUS: { label: 'حافلات', icon: 'directions_bus' },
  MOTORCYCLE: { label: 'دراجة', icon: 'two_wheeler' },
};

export function JobCard({ job }: { job: JobItem }) {
  const cfg = jobTypeConfig[job.jobType] ?? {
    label: job.jobType, icon: 'work',
    bg: 'bg-surface-container-low', text: 'text-on-surface-variant', accent: 'border-outline-variant',
  };

  return (
    <Link href={`/jobs/${job.id}`} className="block group h-full">
      <article className={`h-full rounded-2xl overflow-hidden bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 border-r-[3px] ${cfg.accent} transition-all duration-300 hover:border-outline-variant/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)]`}>
        <div className="p-4 flex flex-col h-full gap-3">

          {/* Header: type badge + time */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-lg ${cfg.bg} ${cfg.text}`}>
              <span className="material-symbols-outlined text-xs">{cfg.icon}</span>
              {cfg.label}
            </span>
            <span className="text-[10px] text-on-surface-variant/60 flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[10px]">schedule</span>
              {relativeTime(job.createdAt)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-black text-sm leading-snug line-clamp-2 text-on-surface group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
            {job.title}
          </h3>

          {/* Salary */}
          <div className="flex items-baseline gap-1">
            {job.salary ? (
              <>
                <span className="text-lg font-black text-amber-700 dark:text-amber-400">
                  {Number(job.salary).toLocaleString('en-US')}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant">
                  ر.ع{job.salaryPeriod ? salaryPeriodLabels[job.salaryPeriod] : ''}
                </span>
              </>
            ) : (
              <span className="text-xs text-on-surface-variant/80 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">handshake</span>
                قابل للتفاوض
              </span>
            )}
          </div>

          {/* Meta row: employment + location + experience */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-[10px]">work</span>
              {employmentLabels[job.employmentType] ?? job.employmentType}
            </span>
            {job.governorate && (
              <span className="inline-flex items-center gap-1 bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[10px]">location_on</span>
                {job.governorate}
              </span>
            )}
            {job.experienceYears != null && (
              <span className="inline-flex items-center gap-1 bg-surface-container-low dark:bg-surface-container-high text-on-surface-variant text-[10px] font-bold px-2 py-1 rounded-lg">
                <span className="material-symbols-outlined text-[10px]">history</span>
                {job.experienceYears} سنة
              </span>
            )}
          </div>

          {/* License types */}
          {job.licenseTypes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {job.licenseTypes.slice(0, 3).map((lt) => {
                const info = licenseLabels[lt] ?? { label: lt, icon: 'card_membership' };
                return (
                  <span key={lt} className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md">
                    <span className="material-symbols-outlined text-[10px]">{info.icon}</span>
                    {info.label}
                  </span>
                );
              })}
              {job.licenseTypes.length > 3 && (
                <span className="text-[10px] text-on-surface-variant font-bold">+{job.licenseTypes.length - 3}</span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-outline-variant/5">
            {job._count?.applications != null && job._count.applications > 0 ? (
              <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">group</span>
                {job._count.applications} متقدم
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[10px]">fiber_new</span>
                جديد
              </span>
            )}
            <span className="flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
              التفاصيل
              <span className="material-symbols-outlined text-xs group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
