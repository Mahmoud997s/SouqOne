'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon = 'search_off', title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-surface-container-low border border-dashed border-outline rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-4xl">{icon}</span>
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-on-surface">{title}</h3>
        {description && (
          <p className="text-sm text-on-surface-variant max-w-sm">{description}</p>
        )}
      </div>
      {action && (
        action.href ? (
          <a href={action.href} className="text-primary font-bold text-sm hover:underline">
            {action.label}
          </a>
        ) : (
          <button onClick={action.onClick} className="text-primary font-bold text-sm hover:underline">
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
