'use client';

export function NewsletterCta() {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-10">
        <div className="max-w-xl">
          <h2 className="text-4xl font-black mb-4 text-white">لا تفوّت أي إعلان جديد.</h2>
          <p className="text-white/60 text-lg leading-relaxed">
            انضم لآلاف المستخدمين واحصل على إشعارات بأحدث إعلانات السيارات والخدمات والوظائف في سلطنة عمان.
          </p>
        </div>
        <div className="flex w-full lg:w-auto gap-0">
          <input
            type="email"
            placeholder="بريدك الإلكتروني"
            className="bg-white/5 border border-white/10 px-6 py-4 w-full lg:w-80 focus:outline-none focus:border-primary text-white placeholder:text-white/40 transition-all"
          />
          <button className="btn-orange px-8 py-4 font-black whitespace-nowrap hover:brightness-110 transition-all">
            اشترك الآن
          </button>
        </div>
      </div>
    </section>
  );
}
