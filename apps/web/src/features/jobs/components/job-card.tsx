'use client';

import { Link } from '@/i18n/navigation';
import type { JobItem } from '@/lib/api';
import { employmentLabelsT } from '@/lib/constants/jobs';
import { relativeTimeT } from '@/lib/time-utils';
import { useTranslations, useLocale } from 'next-intl';

const TYPE_STYLES = {
  OFFERING: {
    labelKey: 'lookingForWork' as const,
    posterLabelKey: 'individual' as const,
    icon: 'person_search',
    headerBg: 'bg-primary-fixed dark:bg-primary-container/20',
    badgeBg: 'bg-primary/10 dark:bg-primary/20 text-primary',
    avatarBg: 'bg-primary/10 dark:bg-primary/20 text-primary',
  },
  HIRING: {
    labelKey: 'lookingForDriver' as const,
    posterLabelKey: 'company' as const,
    icon: 'local_shipping',
    headerBg: 'bg-tertiary-container dark:bg-tertiary-container/20',
    badgeBg: 'bg-tertiary/10 dark:bg-tertiary/20 text-tertiary',
    avatarBg: 'bg-tertiary/10 dark:bg-tertiary/20 text-tertiary',
  },
} as const;

function isNew(date: string) {
  return Date.now() - new Date(date).getTime() < 7 * 24 * 60 * 60 * 1000;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function JobCard({ job }: { job: JobItem }) {
  const t = useTranslations('jobs');
  const tl = useTranslations('listings');
  const tt = useTranslations('time');
  const locale = useLocale();
  const s = TYPE_STYLES[job.jobType] ?? TYPE_STYLES.OFFERING;
  const empLabels = employmentLabelsT(t);
  const salaryPeriodLabels: Record<string, string> = {
    DAILY: t('perDay'), MONTHLY: t('perMonth'), YEARLY: t('perYear'), NEGOTIABLE: t('salaryNegotiable'),
  };
  const licenseLabels: Record<string, string> = {
    LIGHT: t('licenseLight'), HEAVY: t('licenseHeavy'), TRANSPORT: t('licenseTransport'), BUS: t('licenseBus'), MOTORCYCLE: t('licenseMotorcycle'),
  };
  const posterName = job.user?.displayName || job.user?.username || t('user');
  const city = job.city || job.governorate || '';

  const tags: { icon: string; text: string }[] = [];

  tags.push({ icon: 'work', text: empLabels[job.employmentType] ?? job.employmentType });

  if (job.experienceYears != null) {
    tags.push({ icon: 'schedule', text: t('yearsExperience', { count: job.experienceYears }) });
  }

  if (city) {
    tags.push({ icon: 'location_on', text: city });
  }

  if (job.licenseTypes.length > 0) {
    const first = licenseLabels[job.licenseTypes[0]] ?? job.licenseTypes[0];
    tags.push({ icon: 'badge', text: job.licenseTypes.length > 1 ? `${first} +${job.licenseTypes.length - 1}` : first });
  }

  return (
    <article className="h-full rounded-xl overflow-hidden bg-surface-container-lowest dark:bg-surface-container border-2 border-outline-variant/20 group hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300">
      <Link href={`/jobs/${job.id}`} className="h-full flex flex-col p-2.5 sm:p-3 gap-2 sm:gap-2.5">

        {/* 1. Poster row (top) */}
        <div className="flex items-center gap-2 -mx-2.5 sm:-mx-3 px-2.5 sm:px-3 -mt-2.5 sm:-mt-3 pt-2.5 sm:pt-3 pb-2 sm:pb-2.5 bg-surface-container-low dark:bg-surface-container-high">
          <div className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold select-none ${s.avatarBg}`}>
            {getInitials(posterName)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-on-surface truncate leading-tight">{posterName}</p>
            <p className="text-[9px] sm:text-[10px] text-on-surface-variant leading-tight">
              {t(s.posterLabelKey)}{city ? ` · ${city}` : ''}
            </p>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full ${s.badgeBg}`}>
            <span className="material-symbols-outlined" style={{fontSize:'8px'}}>{s.icon}</span>
            {t(s.labelKey)}
          </span>
        </div>

        <div className="border-t border-outline-variant/20" />

        {/* 2. Title */}
        <div className="flex items-start gap-1.5">
          <h3 className="flex-1 text-xs sm:text-[13px] font-black leading-snug line-clamp-2 text-on-surface">
            {job.title}
          </h3>
          {isNew(job.createdAt) && (
            <span className="shrink-0 text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-brand-green/10 dark:bg-brand-green/20 text-brand-green">
              {tl('new')}
            </span>
          )}
        </div>

        {/* 3. Salary */}
        <div className="flex items-baseline gap-1">
          {job.salary ? (
            <>
              <span className="text-sm sm:text-base font-black text-on-surface">
                {Number(job.salary).toLocaleString('en-US')}
              </span>
              <span className="text-[10px] sm:text-xs text-on-surface-variant">
                {tl('currency')}{job.salaryPeriod ? ` / ${salaryPeriodLabels[job.salaryPeriod]}` : ''}
              </span>
            </>
          ) : (
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-bold">{t('salaryNegotiable')}</span>
          )}
        </div>

        {/* 4. Tags */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium text-on-surface-variant bg-surface-container-low dark:bg-surface-container-high px-1 sm:px-1.5 py-0.5 rounded-md border border-outline-variant/10"
            >
              <span className="material-symbols-outlined" style={{fontSize:'8px'}}>{tag.icon}</span>
              {tag.text}
            </span>
          ))}
        </div>

        {/* 5. Footer */}
        <div className="flex items-center justify-between mt-auto pt-1.5 border-t border-outline-variant/10">
          <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[10px] sm:text-[11px]">schedule</span>
            {relativeTimeT(job.createdAt, tt, locale)}
          </span>
          <span className="material-symbols-outlined icon-flip text-primary text-xs rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1 transition-transform">arrow_back</span>
        </div>
      </Link>
    </article>
  );
}
