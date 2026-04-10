import { forwardRef } from 'react';
import Link from 'next/link';
import clsx from 'clsx';

const base =
  'inline-flex items-center justify-center gap-2 font-bold transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none active:scale-95';

const variants: Record<string, string> = {
  primary:
    'btn-editorial hover:shadow-ambient hover:brightness-105',
  accent:
    'btn-editorial hover:shadow-ambient hover:brightness-105',
  secondary:
    'bg-surface-container-high text-on-surface rounded-xl hover:bg-surface-container-highest',
  ghost:
    'bg-surface-container-low text-on-surface rounded-xl hover:bg-surface-container-high',
  outline:
    'ghost-border text-on-surface rounded-xl hover:bg-surface-container bg-transparent',
  outlineGold:
    'ghost-border text-primary rounded-xl hover:bg-primary hover:text-on-primary bg-transparent',
  danger:
    'ghost-border text-error bg-transparent rounded-xl hover:bg-error/10',
  link:
    'text-primary underline decoration-primary/30 underline-offset-8 hover:decoration-primary bg-transparent',
};

const sizes: Record<string, string> = {
  sm: 'px-6 py-2 text-sm',
  md: 'px-8 py-3 text-base',
  lg: 'px-10 py-4 text-lg',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', href, icon, loading, className, children, disabled, ...rest }, ref) => {
    const cls = clsx(base, variants[variant], sizes[size], className);

    if (href) {
      return (
        <Link href={href} className={cls}>
          {icon}
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} className={cls} disabled={disabled || loading} {...rest}>
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
