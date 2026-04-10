import { forwardRef } from 'react';
import clsx from 'clsx';

const variants: Record<string, string> = {
  glass:
    'glass-card rounded-xl',
  elevated:
    'bg-surface-container-lowest rounded-xl',
  flat:
    'bg-surface-container-low rounded-xl',
  deep:
    'bg-surface-container-lowest rounded-xl',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variants;
  hover?: boolean;
  borderTop?: 'gold' | 'green';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'glass', hover = false, borderTop, className, children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          variants[variant],
          hover && 'hover:-translate-y-1 hover:shadow-ambient',
          borderTop === 'gold' && 'border-t-4 border-t-brand-amber',
          borderTop === 'green' && 'border-t-4 border-t-brand-green',
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';
