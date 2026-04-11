import { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, hint, className, id, ...props }, ref) => {
    const inputId = id || `input-${label?.replace(/\s/g, '-')}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-on-surface-variant mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-lg pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-surface-container-low dark:bg-surface-container-high border rounded-xl py-2.5 px-3 text-sm outline-none transition-all',
              'focus:border-primary focus:ring-2 focus:ring-primary/15',
              icon && 'pr-10',
              error
                ? 'border-error focus:border-error focus:ring-error/15'
                : 'border-outline-variant/20 dark:border-outline-variant/30',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-error mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">error</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-on-surface-variant/60 mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
