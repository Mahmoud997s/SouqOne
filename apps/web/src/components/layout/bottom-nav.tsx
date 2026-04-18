'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { useAuthModal } from '@/providers/auth-modal-provider';
import { useSearch } from '@/providers/search-provider';

export function BottomNav() {
  const t = useTranslations('common');

  const NAV_ITEMS = [
    { href: '/', label: t('home'), icon: 'home' },
    { href: '#search', label: t('search'), icon: 'search', isSearch: true },
    { href: '/add-listing', label: t('addListing'), icon: 'add_circle', accent: true },
    { href: '/messages', label: t('messages'), icon: 'chat', authRequired: true },
    { href: '/profile', label: t('myAccount'), icon: 'person', authRequired: true },
  ];
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { openAuth } = useAuthModal();
  const { searchOpen, toggleSearch } = useSearch();
  const unreadMessages = 0; // TODO: wire up unread messages count

  // Hide on chat detail pages (full-screen experience)
  if (pathname.startsWith('/messages/') && pathname !== '/messages') return null;

  return (
    <>
    {/* Blur gap between bars */}
    <div className="fixed bottom-16 inset-x-0 h-2 z-40 lg:hidden backdrop-blur-3xl" />

    {/* CTA circle — centered between both bars: (64+8+64)/2=68px center, 68-26.5=41.5≈42 */}
    <Link
      href="/add-listing"
      className="fixed z-[51] bottom-[37px] left-1/2 -translate-x-1/2 lg:hidden"
    >
      <div className="relative w-[63px] h-[63px] rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 pulse-ring">
        <span className="material-symbols-outlined text-on-primary text-2xl">add_circle</span>
      </div>
    </Link>

    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-gradient-to-r from-primary/[0.05] via-surface-container-lowest/95 to-brand-amber/[0.05] dark:from-primary/[0.08] dark:via-surface-container/95 dark:to-brand-amber/[0.06] backdrop-blur-xl border-t border-outline-variant/10 dark:border-outline-variant/20 safe-area-bottom rounded-t-2xl"
      style={{ maskImage: 'radial-gradient(circle 36px at 50% -4px, transparent 100%, black 100%)', WebkitMaskImage: 'radial-gradient(circle 36px at 50% -4px, transparent 100%, black 100%)' }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const needsAuth = item.authRequired && !isAuthenticated;
          const href = needsAuth ? '#' : item.href;
          const isActive = (item as any).isSearch ? searchOpen : (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));

          if (item.accent) {
            // Spacer + label — the circle is fixed-positioned above
            return (
              <div key={item.href} className="flex flex-col items-center justify-center min-w-[56px]">
                <div className="w-12 h-12" />
                <span className="text-[10px] font-bold text-primary mt-0.5">{item.label}</span>
              </div>
            );
          }

          // Search button — triggers navbar search dropdown
          if ((item as any).isSearch) {
            return (
              <button
                key="search"
                onClick={toggleSearch}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-on-surface-variant/60 hover:text-on-surface-variant'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'font-variation-settings: "FILL" 1' : ''}`}>
                  {searchOpen ? 'close' : 'search'}
                </span>
                <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          }

          if (needsAuth) {
            return (
              <button
                key={item.href}
                onClick={() => openAuth('login')}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-colors text-on-surface-variant/60 hover:text-on-surface-variant`}
              >
                <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant/60 hover:text-on-surface-variant'
              }`}
            >
              <div className="relative">
                <span className={`material-symbols-outlined text-[22px] ${isActive ? 'font-variation-settings: "FILL" 1' : ''}`}>
                  {item.icon}
                </span>
                {/* Unread badge for messages */}
                {item.href === '/messages' && unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
