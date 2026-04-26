/** Shared Tailwind class strings for form inputs and labels across add-listing pages */

export const inputCls =
  'w-full bg-surface-container-low dark:bg-surface-container-high/50 border border-outline-variant/10 dark:border-outline-variant/20 rounded-xl py-3 px-4 focus:bg-surface-container-lowest dark:focus:bg-surface-container focus:border-primary/40 focus:ring-2 focus:ring-primary/10 outline-none text-sm transition-all placeholder:text-on-surface-variant/40';

export const labelCls =
  'text-[13px] font-bold text-on-surface-variant block mb-2.5';

export const sectionCls =
  'bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm';

export const sectionTitleCls =
  'text-[15px] sm:text-base font-black text-on-surface mb-5 flex items-center gap-2.5 pb-3 border-b border-outline-variant/10';

export const chipCls = (active: boolean) =>
  `px-4 py-2 rounded-full text-[13px] font-semibold transition-all border cursor-pointer select-none ${
    active
      ? 'bg-primary text-on-primary border-primary shadow-[0_2px_8px_rgba(0,74,198,0.25)]'
      : 'bg-surface-container-low dark:bg-surface-container-high/50 border-outline-variant/15 dark:border-outline-variant/25 text-on-surface-variant hover:border-primary/40 hover:bg-primary/5 hover:text-on-surface'
  }`;

export const checkboxLabelCls =
  'flex items-center gap-2.5 cursor-pointer select-none';

export const checkboxCls =
  'w-[18px] h-[18px] rounded accent-primary cursor-pointer';

export const checkboxTextCls =
  'text-[13px] font-semibold text-on-surface';
