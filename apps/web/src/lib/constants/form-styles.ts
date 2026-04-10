/** Shared Tailwind class strings for form inputs and labels across add-listing pages */

export const inputCls =
  'w-full bg-surface-container-low dark:bg-surface-container-high/50 border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl py-3 px-4 focus:bg-surface-container-lowest dark:focus:bg-surface-container focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all placeholder:text-on-surface-variant/40';

export const labelCls =
  'text-xs font-bold text-on-surface-variant block mb-2';

export const sectionCls =
  'bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl p-6 md:p-8 shadow-sm';

export const sectionTitleCls =
  'text-base font-black text-on-surface mb-4 flex items-center gap-2';

export const chipCls = (active: boolean) =>
  `py-2.5 rounded-xl text-sm font-bold transition-all border ${
    active
      ? 'bg-primary text-on-primary border-primary shadow-md'
      : 'bg-surface-container-low dark:bg-surface-container-high/50 border-outline-variant/10 dark:border-outline-variant/20 text-on-surface hover:border-primary/30 hover:bg-primary/5'
  }`;
