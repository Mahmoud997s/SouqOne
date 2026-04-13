'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    icon: 'emoji_transportation',
    color: 'bg-primary/10 text-primary',
    title: 'مرحباً بك في سوق وان',
    desc: 'سوق عُمان الأول للسيارات والخدمات — بيع، شراء، إيجار، قطع غيار، خدمات، نقل ووظائف في مكان واحد.',
  },
  {
    icon: 'search',
    color: 'bg-brand-green/10 text-brand-green',
    title: 'ابحث بسهولة',
    desc: 'استخدم محرك البحث للعثور على ما تريد بسرعة — اختر الفئة واكتب ما تبحث عنه.',
  },
  {
    icon: 'category',
    color: 'bg-secondary/10 text-secondary',
    title: 'تصفح الأقسام',
    desc: 'سيارات، قطع غيار، خدمات سيارات، نقل وشحن، رحلات واشتراكات، ووظائف سائقين.',
  },
  {
    icon: 'add_circle',
    color: 'bg-primary/10 text-primary',
    title: 'أضف إعلانك مجاناً',
    desc: 'انشر إعلانك في ثوانٍ وتواصل مع آلاف المهتمين في سلطنة عُمان.',
  },
];

export function WelcomeModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const isNew = sessionStorage.getItem('new_user');
    if (isNew === 'true') {
      setShow(true);
    }
  }, []);

  function dismiss() {
    setShow(false);
    sessionStorage.removeItem('new_user');
  }

  function next() {
    if (step < slides.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  }

  if (!show) return null;

  const slide = slides[step];
  const isLast = step === slides.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={dismiss} />

      {/* Modal */}
      <div className="relative bg-surface-container-lowest dark:bg-surface-container w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Skip */}
        {!isLast && (
          <button
            onClick={dismiss}
            className="absolute top-4 left-4 text-on-surface-variant/50 hover:text-on-surface text-xs font-bold z-10 transition-colors"
          >
            تخطي
          </button>
        )}

        {/* Content */}
        <div className="px-8 pt-12 pb-8 text-center">
          {/* Icon */}
          <div className={`w-20 h-20 mx-auto mb-6 flex items-center justify-center ${slide.color}`}>
            <span className="material-symbols-outlined text-4xl">{slide.icon}</span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-black text-on-surface mb-3">{slide.title}</h2>

          {/* Description */}
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs mx-auto">
            {slide.desc}
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex flex-col items-center gap-4">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-primary' : 'w-2 bg-outline-variant/30 hover:bg-outline-variant/50'
                }`}
              />
            ))}
          </div>

          {/* Action button */}
          <button
            onClick={next}
            className="btn-primary w-full py-3.5 text-sm font-black flex items-center justify-center gap-2 hover:brightness-105 hover:shadow-ambient active:scale-[0.98] transition-all"
          >
            {isLast ? (
              <>
                <span className="material-symbols-outlined text-base">rocket_launch</span>
                ابدأ الآن
              </>
            ) : (
              <>
                التالي
                <span className="material-symbols-outlined text-base">arrow_back</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
