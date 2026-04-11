'use client';

import Link from 'next/link';

interface QuickLink {
  icon: string;
  title: string;
  desc: string;
  href: string;
  color: string;
}

const quickLinks: QuickLink[] = [
  { icon: 'build', title: 'صيانة وإصلاح', desc: 'ورش معتمدة وفنيين محترفين', href: '/services', color: 'text-blue-500' },
  { icon: 'local_car_wash', title: 'غسيل وتلميع', desc: 'غسيل بخار وتلميع سيراميك', href: '/services', color: 'text-cyan-500' },
  { icon: 'settings', title: 'قطع غيار أصلية', desc: 'مكائن وبودي وكهرباء', href: '/parts', color: 'text-orange-500' },
  { icon: 'local_shipping', title: 'نقل بضائع', desc: 'شاحنات مغلقة ومبردة', href: '/coming-soon?section=transport', color: 'text-red-500' },
  { icon: 'weekend', title: 'نقل أثاث', desc: 'فك وتركيب وتغليف', href: '/coming-soon?section=transport', color: 'text-amber-600' },
  { icon: 'departure_board', title: 'رحلات واشتراكات', desc: 'باصات ورحلات سياحية', href: '/coming-soon?section=trips', color: 'text-teal-500' },
  { icon: 'shield', title: 'تأمين سيارات', desc: 'شامل وضد الغير', href: '/insurance', color: 'text-indigo-500' },
  { icon: 'car_crash', title: 'سطحة ونش', desc: 'خدمة 24 ساعة كل عمان', href: '/services', color: 'text-rose-500' },
];

export function QuickServicesGrid() {
  return (
    <section className="bg-surface-container-low dark:bg-surface-dim py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-primary" />
              <h2 className="text-2xl font-black">خدمات ونقل</h2>
            </div>
            <p className="text-on-surface-variant text-sm">كل ما تحتاجه لسيارتك ونقلك في مكان واحد</p>
          </div>
          <div className="flex gap-2">
            <Link href="/services" className="text-primary font-bold text-xs hover:underline">الخدمات ←</Link>
            <span className="text-outline-variant">|</span>
            <Link href="/coming-soon?section=transport" className="text-primary font-bold text-xs hover:underline">النقل ←</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 p-4 flex items-start gap-3 hover:border-primary/30 hover:shadow-md transition-all duration-300"
            >
              <span className={`material-symbols-outlined text-2xl ${link.color} shrink-0 mt-0.5`}>{link.icon}</span>
              <div className="min-w-0">
                <h3 className="font-bold text-sm text-on-surface mb-0.5 truncate">{link.title}</h3>
                <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
