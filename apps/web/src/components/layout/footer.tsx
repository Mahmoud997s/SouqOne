'use client';

import Link from 'next/link';

/* ── Data ── */

const quickLinks = [
  { label: 'الرئيسية', href: '/' },
  { label: 'سيارات للبيع', href: '/listings' },
  { label: 'سيارات للإيجار', href: '/listings?listingType=RENTAL' },
  { label: 'قطع غيار', href: '/parts' },
  { label: 'وظائف سائقين', href: '/jobs' },
];

const servicesLinks = [
  { label: 'خدمات سيارات', href: '/services' },
  { label: 'نقل وشحن', href: '/transport' },
  { label: 'رحلات واشتراكات', href: '/trips' },
  { label: 'تأمين وتمويل', href: '/insurance' },
  { label: 'أضف إعلانك', href: '/add-listing' },
];

const contactItems = [
  { icon: 'location_on', text: 'سلطنة عمان، مسقط، الغبرة الشمالية' },
  { icon: 'call', text: '+968 9999 0000', dir: 'ltr' as const },
  { icon: 'call', text: '+968 9111 0000', dir: 'ltr' as const },
  { icon: 'mail', text: 'info@souqone.com' },
];

const socialLinks = [
  { icon: 'smart_display', label: 'YouTube', href: '#' },
  { icon: 'photo_camera', label: 'Instagram', href: '#' },
  { icon: 'public', label: 'Facebook', href: '#' },
];

/* ── Subcomponents ── */

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-white font-black text-base mb-2">{children}</h4>
      <div className="w-8 h-0.5 bg-tertiary rounded-full" />
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2 text-white/60 hover:text-tertiary transition-colors text-sm"
      >
        <span className="text-tertiary text-[8px]">●</span>
        {children}
      </Link>
    </li>
  );
}

/* ── Main ── */

export function Footer() {
  return (
    <footer className="bg-brand-navy dark:bg-black w-full border-t border-white/10 mt-20" dir="rtl">
      {/* ── Main Grid ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-10">

          {/* ── Brand Column ── */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-5">
              <img src="/logo.png" alt="SouqOne" className="h-10 w-auto object-contain" />
              <img src="/name.png" alt="سوق وان" className="h-[24px] w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              المنصة الأولى والوحيدة في سلطنة عمان لبيع وشراء السيارات الفاخرة بكل ثقة وأمان.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:border-tertiary hover:text-tertiary transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <FooterHeading>روابط سريعة</FooterHeading>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Services Links ── */}
          <div>
            <FooterHeading>خدمات ونقل</FooterHeading>
            <ul className="space-y-3">
              {servicesLinks.map((link) => (
                <FooterLink key={link.label} href={link.href}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* ── Contact ── */}
          <div>
            <FooterHeading>تواصل معنا</FooterHeading>
            <ul className="space-y-4">
              {contactItems.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-tertiary text-lg mt-0.5 shrink-0">
                    {item.icon}
                  </span>
                  <span
                    dir={item.dir}
                    className="text-white/60 text-sm leading-relaxed"
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs order-2 sm:order-1" dir="ltr">
            SouqOne
          </p>
          <p className="text-white/40 text-xs order-1 sm:order-2">
            © {new Date().getFullYear()}{' '}
            <span className="text-tertiary font-bold">سوق وان</span>
            . جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}
