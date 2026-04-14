'use client';

import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('common');
  const tf = useTranslations('footer');

  const quickLinks = [
    { label: t('home'), href: '/' },
    { label: t('carsForSale'), href: '/listings' },
    { label: t('carsForRent'), href: '/listings?listingType=RENTAL' },
    { label: t('spareParts'), href: '/parts' },
    { label: tf('driverJobs'), href: '/jobs' },
  ];

  const servicesLinks = [
    { label: t('carServices'), href: '/services' },
    { label: t('transportAndShipping'), href: '/coming-soon?section=transport' },
    { label: t('tripsAndSubscriptions'), href: '/coming-soon?section=trips' },
    { label: t('insuranceAndFinance'), href: '/insurance' },
    { label: t('addListing'), href: '/add-listing' },
  ];

  const contactItems = [
    { icon: 'location_on', text: tf('address') },
    { icon: 'call', text: tf('phone'), dir: 'ltr' as const },
    { icon: 'mail', text: tf('email') },
  ];

  return (
    <footer className="hidden lg:block bg-brand-navy dark:bg-black w-full border-t border-white/10 mt-20">

      {/* ══ Desktop-only footer ══ */}
      <div style={{ height: 280 }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-full flex flex-col justify-between py-8">

          {/* Top row */}
          <div className="flex items-start justify-between gap-8">
            {/* Brand */}
            <div className="shrink-0 max-w-[260px]">
              <Link href="/" className="flex items-center gap-2.5 mb-3">
                <Image src="/logo.png" alt="SouqOne" width={32} height={32} className="h-8 w-auto object-contain" />
                <Image src="/name.png" alt={t('siteName')} width={80} height={20} className="h-5 w-auto object-contain brightness-0 invert" />
              </Link>
              <p className="text-white/40 text-xs leading-relaxed">
                {t('platformTagline')}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-black text-xs mb-3">{tf('quickLinks')}</h4>
              <ul className="space-y-1.5">
                {quickLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-black text-xs mb-3">{tf('servicesLinks')}</h4>
              <ul className="space-y-1.5">
                {servicesLinks.map((link) => (
                  <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-black text-xs mb-3">{tf('contactUs')}</h4>
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
              <span className="text-tertiary font-bold">SouqOne</span>
              {' '}. {tf('allRightsReserved')}.
            </p>
            <p className="text-white/30 text-[10px]" dir="ltr">SouqOne</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
