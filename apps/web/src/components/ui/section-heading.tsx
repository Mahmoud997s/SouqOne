import { Link } from '@/i18n/navigation';
import clsx from 'clsx';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: { label: string; icon?: string; color?: string };
  action?: { label: string; href: string; icon?: string };
  className?: string;
}

export function SectionHeading({ title, subtitle, badge, action, className }: SectionHeadingProps) {
  return (
    <div className={clsx('flex items-end justify-between', className)}>
      <div>
        {badge && (
          <span
            className={clsx(
              'inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded mb-3 border border-primary/20',
              badge.color ?? 'bg-primary/10 text-primary',
            )}
          >
            {badge.icon && (
              <span className="material-symbols-outlined text-sm">{badge.icon}</span>
            )}
            {badge.label}
          </span>
        )}
        <h2 className="text-3xl lg:text-4xl font-extrabold">{title}</h2>
        {subtitle && (
          <p className="text-on-surface-variant mt-2">{subtitle}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all shrink-0"
        >
          {action.label}
          <span className="material-symbols-outlined text-lg">
            {action.icon ?? 'arrow_back'}
          </span>
        </Link>
      )}
    </div>
  );
}
