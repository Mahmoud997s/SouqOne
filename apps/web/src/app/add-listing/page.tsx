'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MAIN_CATEGORIES, type MainCategory, type SubCategory } from '@/lib/constants/categories';

export default function AddListingPage() {
  const router = useRouter();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const available = MAIN_CATEGORIES.filter(c => c.subcategories.some(s => s.available));
  const comingSoon = MAIN_CATEGORIES.filter(c => !c.subcategories.some(s => s.available));

  function handleCategoryClick(cat: MainCategory) {
    setExpandedCat(expandedCat === cat.value ? null : cat.value);
  }

  function handleSubcategoryClick(sub: SubCategory) {
    if (!sub.available) return;
    router.push(sub.route);
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8" dir="rtl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-2">انشر إعلانك</h1>
          <p className="text-on-surface-variant font-medium">اختر الفئة المناسبة لإعلانك</p>
        </div>

        {/* ── Available categories ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {available.map((cat) => {
            const isExpanded = expandedCat === cat.value;
            return (
              <div key={cat.value} className={`bg-surface-container-lowest dark:bg-surface-container border transition-all overflow-hidden ${isExpanded ? 'border-primary/30 shadow-lg sm:col-span-2 lg:col-span-3' : 'border-outline-variant/10 hover:border-primary/20 hover:shadow-md'}`}>
                <button
                  onClick={() => handleCategoryClick(cat)}
                  className="w-full flex items-center gap-4 px-5 py-5 hover:bg-surface-container-low/50 transition-colors"
                >
                  <span className={`w-12 h-12 flex items-center justify-center text-xl shrink-0 ${cat.color}`}>
                    {cat.icon}
                  </span>
                  <div className="text-right flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm">{cat.label}</p>
                    <p className="text-[11px] text-on-surface-variant">{cat.subcategories.filter(s => s.available).length} نوع متاح</p>
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`}>chevron_left</span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 border-t border-outline-variant/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-3">
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub.value}
                          onClick={() => handleSubcategoryClick(sub)}
                          disabled={!sub.available}
                          className={`flex items-center justify-between px-4 py-3 text-sm transition-all ${
                            sub.available
                              ? 'hover:bg-surface-container-low text-on-surface cursor-pointer'
                              : 'text-on-surface-variant/40 cursor-not-allowed'
                          }`}
                        >
                          <span className="font-medium">{sub.label}</span>
                          {sub.available ? (
                            <span className="material-symbols-outlined text-sm text-primary">arrow_back</span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px]">
                              <span className="material-symbols-outlined text-xs">schedule</span>
                              قريباً
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Coming soon ── */}
        {comingSoon.length > 0 && (
          <div>
            <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest mb-3">أقسام قادمة</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 opacity-50">
              {comingSoon.map((cat) => (
                <div key={cat.value} className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 px-4 py-4 flex items-center gap-3">
                  <span className={`w-10 h-10 flex items-center justify-center text-lg shrink-0 ${cat.color}`}>
                    {cat.icon}
                  </span>
                  <div>
                    <p className="font-bold text-on-surface-variant text-sm">{cat.label}</p>
                    <p className="text-[11px] text-on-surface-variant/60">قريباً</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </AuthGuard>
  );
}
