'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar, NavbarSpacer } from '@/components/layout/navbar';
import { Construction, ArrowRight } from 'lucide-react';

const SECTION_NAMES: Record<string, string> = {
  services: 'خدمات سيارات',
  insurance: 'تأمين وتمويل',
  transport: 'نقل وشحن',
  trips: 'رحلات واشتراكات',
  buses: 'سوق الحافلات',
  equipment: 'سوق المعدات والخدمات',
};

function ComingSoonContent() {
  const params = useSearchParams();
  const section = params.get('section') || '';
  const sectionName = SECTION_NAMES[section] || 'هذا القسم';

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-3xl bg-primary/[0.04] rotate-6" />
          <div className="absolute inset-0 rounded-3xl bg-primary/[0.06] -rotate-3" />
          <div className="relative w-full h-full rounded-3xl bg-primary/[0.08] flex items-center justify-center">
            <Construction size={44} className="text-primary/50" strokeWidth={1.5} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-on-surface mb-3">
          {sectionName}
        </h1>

        <p className="text-base font-bold text-primary/80 mb-2">
          سوف يتوفر قريبًا
        </p>

        <p className="text-sm text-on-surface-variant/60 leading-relaxed mb-8 max-w-[320px] mx-auto">
          نعمل حاليًا على تجهيز هذا القسم ليكون جاهزًا لك بأفضل تجربة. ترقبوا التحديثات!
        </p>

        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-bold text-sm hover:brightness-105 hover:shadow-lg transition-all"
        >
          <ArrowRight size={16} />
          العودة للرئيسية
        </Link>
      </div>
    </main>
  );
}

export default function ComingSoonPage() {
  return (
    <>
      <Navbar />
      <NavbarSpacer />
      <Suspense fallback={<div className="min-h-[70vh]" />}>
        <ComingSoonContent />
      </Suspense>
    </>
  );
}
