'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MAIN_CATEGORIES } from '@/lib/constants/categories';

const ICON_MAP: Record<string, string> = {
  'vehicles-parts': 'directions_car',
  'jobs': 'work',
  'car-services': 'build',
  'transport': 'local_shipping',
  'trips': 'departure_board',
  'motorcycles': 'two_wheeler',
  'marine': 'sailing',
  'heavy-equipment': 'construction',
  'insurance': 'shield',
};

const GRADIENT_MAP: Record<string, string> = {
  'vehicles-parts': 'from-blue-500 to-blue-600',
  'jobs': 'from-amber-500 to-amber-600',
  'car-services': 'from-orange-500 to-orange-600',
  'transport': 'from-green-500 to-green-600',
  'trips': 'from-purple-500 to-purple-600',
  'motorcycles': 'from-yellow-500 to-yellow-600',
  'marine': 'from-cyan-500 to-cyan-600',
  'heavy-equipment': 'from-stone-500 to-stone-600',
  'insurance': 'from-indigo-500 to-indigo-600',
};

export default function AddListingPage() {
  const router = useRouter();

  const available = MAIN_CATEGORIES.filter(c => c.subcategories.some(s => s.available));
  const comingSoon = MAIN_CATEGORIES.filter(c => !c.subcategories.some(s => s.available));

  return (
    <AuthGuard>
      <Navbar />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-brand-navy" />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'.4\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />
        <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-white/[0.05] blur-3xl" />

        <div className="relative z-10 pt-24 pb-12 md:pt-28 md:pb-16">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/80 px-4 py-1.5 rounded-full text-xs font-bold mb-5">
              <span className="material-symbols-outlined text-sm">campaign</span>
              مجاني بالكامل — بدون رسوم
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3 drop-shadow-sm">
              انشر إعلانك في ثواني
            </h1>
            <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">
              اختر القسم المناسب وابدأ بنشر إعلانك. يصل إعلانك لآلاف المستخدمين في سلطنة عمان.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ AVAILABLE CATEGORIES ═══════════ */}
      <main className="max-w-5xl mx-auto px-6 -mt-6 relative z-20 pb-16" dir="rtl">
        <div className="space-y-4">
          {available.map((cat) => {
            const icon = ICON_MAP[cat.value] || 'category';
            const gradient = GRADIENT_MAP[cat.value] || 'from-primary to-primary-container';
            const availableSubs = cat.subcategories.filter(s => s.available);

            return (
              <div
                key={cat.value}
                className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 p-5 md:p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                    <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-black text-on-surface text-base md:text-lg">{cat.label}</h2>
                    <p className="text-xs text-on-surface-variant mt-0.5">{availableSubs.length} نوع متاح — اختر واحد وابدأ</p>
                  </div>
                </div>

                {/* Subcategory Links */}
                <div className="px-5 md:px-6 pb-5 md:pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {availableSubs.map((sub) => (
                      <button
                        key={sub.value}
                        onClick={() => router.push(sub.route)}
                        className="group flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-surface-container-low/50 dark:bg-surface-container-high/30 border border-transparent hover:border-primary/20 hover:bg-primary/5 dark:hover:bg-primary/10 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="material-symbols-outlined text-lg text-on-surface-variant group-hover:text-primary transition-colors">add_circle</span>
                          <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate">{sub.label}</span>
                        </div>
                        <span className="material-symbols-outlined text-sm text-on-surface-variant/30 group-hover:text-primary transition-all group-hover:-translate-x-1 shrink-0">arrow_back</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ═══════════ COMING SOON ═══════════ */}
        {comingSoon.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-6 w-1 bg-on-surface-variant/20 rounded-full" />
              <h3 className="text-sm font-black text-on-surface-variant/50 uppercase tracking-wider">أقسام قادمة قريباً</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {comingSoon.map((cat) => {
                const icon = ICON_MAP[cat.value] || 'category';
                return (
                  <div
                    key={cat.value}
                    className="bg-surface-container-lowest/60 dark:bg-surface-container/40 border border-outline-variant/5 rounded-2xl p-4 flex flex-col items-center text-center gap-2.5 opacity-50"
                  >
                    <div className="w-11 h-11 rounded-xl bg-surface-container-low dark:bg-surface-container-high flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant/50 text-xl">{icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface-variant text-xs">{cat.label}</p>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-on-surface-variant/40 mt-1">
                        <span className="material-symbols-outlined text-[10px]">schedule</span>
                        قريباً
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ HELP SECTION ═══════════ */}
        <div className="mt-12 bg-surface-container-low/50 dark:bg-surface-container/30 border border-outline-variant/10 rounded-2xl p-6 md:p-8 text-center">
          <span className="material-symbols-outlined text-primary text-3xl mb-3 block">help</span>
          <h3 className="font-black text-on-surface mb-1">محتاج مساعدة؟</h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-4">
            لو مش متأكد من القسم المناسب لإعلانك أو عندك أي استفسار، تواصل معنا وهنساعدك.
          </p>
          <Link
            href="/messages"
            className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-5 py-2.5 rounded-xl text-sm font-bold hover:brightness-110 transition-all"
          >
            <span className="material-symbols-outlined text-sm">chat</span>
            تواصل معنا
          </Link>
        </div>
      </main>

      <Footer />
    </AuthGuard>
  );
}
