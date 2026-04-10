'use client';

import Link from 'next/link';

const categories = [
  { label: 'سيارات', icon: 'directions_car', href: '/listings', color: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400', desc: 'بيع وإيجار' },
  { label: 'قطع غيار', icon: 'settings', href: '/parts', color: 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400', desc: 'أصلية وبديلة' },
  { label: 'خدمات سيارات', icon: 'build', href: '/services', color: 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400', desc: 'صيانة وفحص' },
  { label: 'نقل وشحن', icon: 'local_shipping', href: '/coming-soon?section=transport', color: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400', desc: 'بضائع وأثاث' },
  { label: 'رحلات', icon: 'departure_board', href: '/coming-soon?section=trips', color: 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400', desc: 'باصات وسياحة' },
  { label: 'وظائف', icon: 'badge', href: '/jobs', color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400', desc: 'سائقين وشركات' },
];

export function CategoriesSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-1 bg-primary" />
        <h2 className="text-2xl font-black">تصفح الأقسام</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            href={cat.href}
            className="group bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 p-5 flex flex-col items-center text-center gap-3 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color} transition-transform group-hover:scale-110`}>
              <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface mb-0.5">{cat.label}</h3>
              <span className="text-[11px] text-on-surface-variant">{cat.desc}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
