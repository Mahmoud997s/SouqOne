'use client';

export function NewsletterCta() {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-10 sm:py-12 md:py-16">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 flex flex-col items-center text-center lg:text-right lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8 lg:gap-10">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 mb-3 sm:mb-4">
            <span className="material-symbols-outlined text-primary text-sm">notifications_active</span>
            <span className="text-white/70 text-[11px] sm:text-xs font-bold">تنبيهات فورية</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-4xl font-black mb-2 sm:mb-4 text-white leading-snug">
            لا تفوّت أي إعلان جديد.
          </h2>
          <p className="text-white/50 text-xs sm:text-sm md:text-lg leading-relaxed max-w-md mx-auto lg:mx-0">
            انضم لآلاف المستخدمين واحصل على إشعارات بأحدث إعلانات السيارات والخدمات والوظائف في سلطنة عمان.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <div className="flex flex-row w-full lg:w-[420px] rounded-full overflow-hidden shadow-lg">
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              className="bg-white/5 border border-white/10 border-l-0 px-5 py-3 sm:py-4 w-3/4 rounded-r-full focus:outline-none focus:border-primary text-white placeholder:text-white/40 text-sm sm:text-base transition-all"
            />
            <button className="btn-warning w-1/4 py-3 sm:py-4 font-black whitespace-nowrap hover:brightness-110 transition-all text-xs sm:text-sm rounded-l-full">
              اشترك الآن
            </button>
          </div>
          <p className="text-white/30 text-[10px] sm:text-xs mt-2 sm:mt-3">مجاني تماماً · بدون سبام · إلغاء الاشتراك في أي وقت</p>
        </div>
      </div>
    </section>
  );
}
