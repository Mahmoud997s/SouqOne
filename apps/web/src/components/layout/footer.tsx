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
  { label: 'نقل وشحن', href: '/coming-soon?section=transport' },
  { label: 'رحلات واشتراكات', href: '/coming-soon?section=trips' },
  { label: 'تأمين وتمويل', href: '/insurance' },
  { label: 'أضف إعلانك', href: '/add-listing' },
];

const contactItems = [
  { icon: 'location_on', text: 'سلطنة عمان، مسقط، الغبرة الشمالية' },
  { icon: 'call', text: '+968 9999 0000', dir: 'ltr' as const },
  { icon: 'mail', text: 'info@souqone.com' },
];

const socialLinks = [
  { icon: 'smart_display', label: 'YouTube', href: '#' },
  { icon: 'photo_camera', label: 'Instagram', href: '#' },
  { icon: 'public', label: 'Facebook', href: '#' },
];

/* ── Subcomponents ── */

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-white/50 hover:text-tertiary transition-colors text-xs"
      >
        {children}
      </Link>
    </li>
  );
}

/* ── Main ── */

export function Footer() {
  return (
    <footer className="bg-brand-navy dark:bg-black w-full border-t border-white/10 mt-20" dir="rtl">

      {/* ══ Desktop: compact 280px footer ══ */}
      <div className="hidden md:block" style={{ height: 280 }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex flex-col justify-between py-8">

          {/* Top row */}
          <div className="flex items-start justify-between gap-8">
            {/* Brand */}
            <div className="shrink-0 max-w-[260px]">
              <Link href="/" className="flex items-center gap-2.5 mb-3">
                <img src="/logo.png" alt="SouqOne" className="h-8 w-auto object-contain" />
                <img src="/name.png" alt="سوق وان" className="h-5 w-auto object-contain brightness-0 invert" />
              </Link>
              <p className="text-white/40 text-xs leading-relaxed">
                المنصة الأولى في سلطنة عمان لبيع وشراء السيارات بكل ثقة وأمان.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-black text-xs mb-3">روابط سريعة</h4>
              <ul className="space-y-1.5">
                {quickLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-black text-xs mb-3">خدمات ونقل</h4>
              <ul className="space-y-1.5">
                {servicesLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-black text-xs mb-3">تواصل معنا</h4>
              <ul className="space-y-2">
                {contactItems.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-sm shrink-0">{item.icon}</span>
                    <span dir={item.dir} className="text-white/50 text-xs">{item.text}</span>
                  </li>
                ))}
              </ul>
              {/* Social icons */}
              <div className="flex items-center gap-2 mt-3">
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.href} aria-label={s.label}
                    className="w-7 h-7 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-tertiary hover:text-tertiary transition-all">
                    <span className="material-symbols-outlined text-[14px]">{s.icon}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <p className="text-white/30 text-[10px]">
              © {new Date().getFullYear()}{' '}
              <span className="text-tertiary font-bold">سوق وان</span>
              {' '}. جميع الحقوق محفوظة.
            </p>
            <p className="text-white/30 text-[10px]" dir="ltr">SouqOne</p>
          </div>
        </div>
      </div>

      {/* ══ Mobile: minimal footer ══ */}
      <div className="md:hidden px-6 py-6 flex flex-col items-center gap-4">
        {/* Logo + name */}
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="SouqOne" className="h-7 w-auto object-contain" />
          <img src="/name.png" alt="سوق وان" className="h-4 w-auto object-contain brightness-0 invert" />
        </Link>

        {/* Social icons */}
        <div className="flex items-center gap-3">
          {socialLinks.map((s) => (
            <a key={s.label} href={s.href} aria-label={s.label}
              className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/40 hover:border-tertiary hover:text-tertiary transition-all">
              <span className="material-symbols-outlined text-[15px]">{s.icon}</span>
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-white/30 text-[10px] text-center">
          © {new Date().getFullYear()}{' '}
          <span className="text-tertiary font-bold">سوق وان</span>
          {' '}. جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
