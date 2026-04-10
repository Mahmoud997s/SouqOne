'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { usePathname } from 'next/navigation';
import { useUnreadCount, useNotifications, useMarkNotificationRead } from '@/lib/api';
import { NotificationDropdown } from './navbar/notification-dropdown';
import { ProfileDropdown } from './navbar/profile-dropdown';
import { MobileDrawer } from './navbar/mobile-drawer';
import { NavSearchBar } from './navbar/search-bar';
import { ThemeToggle } from '@/components/theme-toggle';

/* ─────────── Corify heights ─────────── */
const TOP_H  = 56;
const NAV_H  = 46;
const TOTAL  = TOP_H + NAV_H;

export interface NavChild { href: string; label: string; icon: string; desc: string }
export interface NavLinkItem { href: string; label: string; children?: NavChild[] }

const navLinks: NavLinkItem[] = [
  { href: '/', label: 'الرئيسية' },
  {
    href: '/listings', label: 'سيارات',
    children: [
      { href: '/listings', label: 'سيارات للبيع', icon: 'directions_car', desc: 'تصفح سيارات جديدة ومستعملة' },
      { href: '/listings?listingType=RENTAL', label: 'سيارات للإيجار', icon: 'car_rental', desc: 'إيجار يومي وشهري' },
      { href: '/parts', label: 'قطع غيار', icon: 'settings', desc: 'قطع أصلية وبديلة' },
    ],
  },
  {
    href: '/coming-soon?section=services', label: 'خدمات',
    children: [
      { href: '/coming-soon?section=services', label: 'خدمات سيارات', icon: 'build', desc: 'صيانة، فحص، سمكرة' },
      { href: '/coming-soon?section=insurance', label: 'تأمين وتمويل', icon: 'shield', desc: 'تأمين شامل وتمويل' },
    ],
  },
  {
    href: '/coming-soon?section=transport', label: 'نقل ورحلات',
    children: [
      { href: '/coming-soon?section=transport', label: 'نقل وشحن', icon: 'local_shipping', desc: 'بضائع، أثاث، شاحنات' },
      { href: '/coming-soon?section=trips', label: 'رحلات واشتراكات', icon: 'departure_board', desc: 'باصات، مدارس، سياحة' },
    ],
  },
  { href: '/jobs', label: 'وظائف' },
];

/** Flat version for mobile + search bar */
const flatNavLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/listings', label: 'سيارات' },
  { href: '/parts', label: 'قطع غيار' },
  { href: '/coming-soon?section=services', label: 'خدمات' },
  { href: '/coming-soon?section=transport', label: 'نقل' },
  { href: '/coming-soon?section=trips', label: 'رحلات' },
  { href: '/coming-soon?section=insurance', label: 'تأمين' },
  { href: '/jobs', label: 'وظائف' },
];

/** Spacer — pushes page content below the fixed navbar */
export function NavbarSpacer() {
  return <div style={{ height: TOTAL }} aria-hidden />;
}

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef   = useRef<HTMLDivElement>(null);

  const { data: unreadData } = useUnreadCount();
  const { data: notifData } = useNotifications(1);
  const markNotifRead = useMarkNotificationRead();
  const unreadCount = isAuthenticated ? (unreadData?.count ?? 0) : 0;
  const recentNotifs = notifData?.items?.slice(0, 5) ?? [];

  /* click-outside for dropdowns */
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  /* body lock */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* close mobile + search on route */
  useEffect(() => { setMobileOpen(false); setSearchOpen(false); }, [pathname]);

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname === href.split('?')[0]),
    [pathname],
  );

  return (
    <>
      <div style={{ height: searchOpen ? TOTAL : TOP_H }} className="transition-all duration-300" aria-hidden />

      {/* Fixed wrapper */}
      <div className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">

        {/* ━━━ TOP BAR: Logo + Links + Actions ━━━ */}
        <div className="glass-nav transition-all duration-300" style={{ height: TOP_H, opacity: 1 }}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between relative" style={{ height: TOP_H }}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <img src="/logo.png" alt="SouqOne" className="h-[42px] w-auto object-contain" />
              <img src="/name.png" alt="سوق وان" className="hidden sm:inline h-[28px] w-auto object-contain" />
            </Link>

            {/* Desktop nav links — center */}
            <div className="hidden lg:flex absolute inset-0 pointer-events-none items-center justify-center">
              <nav className="flex items-center gap-0.5 pointer-events-auto">
                {navLinks.map(link => {
                  const active = isActive(link.href) || link.children?.some(c => isActive(c.href));
                  const hasChildren = link.children && link.children.length > 0;
                  return (
                    <div key={link.href} className="relative group/nav">
                      <Link href={link.href} className={`relative flex items-center gap-1 px-3.5 py-1.5 text-sm font-semibold transition-colors duration-300 ${active ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
                        {link.label}
                        {hasChildren && <span className="material-symbols-outlined text-[11px] opacity-50 transition-transform duration-200 group-hover/nav:rotate-180">expand_more</span>}
                        <span className={`absolute bottom-0 inset-x-2 h-[2px] rounded-full transition-all duration-300 origin-center ${active ? 'bg-primary scale-x-100' : 'bg-primary/60 scale-x-0 group-hover/nav:scale-x-100'}`} />
                      </Link>
                      {hasChildren && (
                        <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50">
                          <div className="bg-surface-container-lowest dark:bg-surface-container-high border border-outline-variant/15 dark:border-outline-variant/30 shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] min-w-[260px] py-2 overflow-hidden">
                            {link.children!.map(child => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low dark:hover:bg-surface-container-highest transition-colors"
                              >
                                <span className="material-symbols-outlined text-lg text-primary mt-0.5 shrink-0">{child.icon}</span>
                                <div>
                                  <p className="text-sm font-bold text-on-surface">{child.label}</p>
                                  <p className="text-[11px] text-on-surface-variant">{child.desc}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 lg:gap-2.5">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(p => !p)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  searchOpen ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{searchOpen ? 'close' : 'search'}</span>
              </button>

              {/* Favorites */}
              <Link href="/favorites" className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all">
                <span className="material-symbols-outlined text-lg">favorite</span>
              </Link>

              <ThemeToggle />

              {isAuthenticated && user ? (
                <>
                  <NotificationDropdown
                    ref={notifRef}
                    open={notifOpen}
                    toggle={() => { setNotifOpen(p => !p); setProfileOpen(false); }}
                    close={() => setNotifOpen(false)}
                    unreadCount={unreadCount}
                    items={recentNotifs}
                    onMarkRead={(id) => markNotifRead.mutate(id)}
                  />
                  <ProfileDropdown
                    ref={profileRef}
                    open={profileOpen}
                    toggle={() => setProfileOpen(p => !p)}
                    close={() => setProfileOpen(false)}
                    user={user}
                    onLogout={logout}
                  />
                </>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link href="/login" className="ghost-border text-primary hover:bg-primary hover:text-on-primary px-3.5 py-1.5 text-[13px] font-bold rounded-xl transition-all flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">person</span> دخول
                  </Link>
                  <Link href="/register" className="btn-editorial px-4 py-1.5 text-[13px] font-bold hover:brightness-105 hover:shadow-ambient">
                    إنشاء حساب
                  </Link>
                </div>
              )}

              <button onClick={() => setMobileOpen(true)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low">
                <span className="material-symbols-outlined text-lg">menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* ━━━ SEARCH BAR (bottom row — toggle) ━━━ */}
        <div className={`transition-all duration-300 ${searchOpen ? 'max-h-[60px] opacity-100 overflow-visible' : 'max-h-0 opacity-0 overflow-hidden'}`} style={{ paddingTop: searchOpen ? 2 : 0, paddingBottom: searchOpen ? 2 : 0 }}>
          <NavSearchBar
            searchOpen={searchOpen}
            onSearchOpenChange={setSearchOpen}
            onCloseMobile={() => setMobileOpen(false)}
            height={NAV_H}
            navLinks={flatNavLinks}
            isActive={isActive}
          />
        </div>
      </div>

      <MobileDrawer
        open={mobileOpen}
        close={() => setMobileOpen(false)}
        navLinks={navLinks}
        flatNavLinks={flatNavLinks}
        isActive={isActive}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={logout}
      />
    </>
  );
}
