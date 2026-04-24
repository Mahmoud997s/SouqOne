/**
 * Homepage Badge Demo - Show all badge variants for selection
 * Use this to preview and choose the badge style for homepage cards
 */

import { HomepageBadge } from './homepage-badge';

export function HomepageBadgeDemo() {
  const types = ['SALE', 'RENTAL', 'WANTED'] as const;
  const variants = ['modern', 'classic', 'minimal', 'bold'] as const;

  return (
    <div className="p-6 space-y-6 bg-surface-container-lowest rounded-2xl">
      <h2 className="text-lg font-bold text-on-surface mb-4">Badge Variants Preview</h2>
      
      {variants.map((variant) => (
        <div key={variant} className="space-y-3">
          <h3 className="text-sm font-semibold text-on-surface-variant capitalize">{variant}</h3>
          <div className="flex gap-3 flex-wrap">
            {types.map((type) => (
              <HomepageBadge key={`${variant}-${type}`} type={type} variant={variant} />
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-6 p-4 bg-surface-container rounded-xl">
        <p className="text-sm text-on-surface-variant">
          Choose a variant and use it like: {'<HomepageBadge type="SALE" variant="modern" />'}
        </p>
      </div>
    </div>
  );
}
