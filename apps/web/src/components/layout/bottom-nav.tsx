'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
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
  const { searchOpen, toggleSearch } = useSearch();
  const unreadMessages = 0; // TODO: wire up unread messages count

  // Hide on auth pages & chat detail pages (full-screen experience)
  const authPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/signup'];
  if (authPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) return null;
  if (pathname.startsWith('/messages/') && pathname !== '/messages') return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-surface-container-lowest/95 dark:bg-surface-container/95 backdrop-blur-xl border-t border-outline-variant/10 dark:border-outline-variant/20 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          // Redirect to login if auth required and not authenticated
          const href = item.authRequired && !isAuthenticated ? `/login?returnUrl=${encodeURIComponent(item.href)}` : item.href;
          const isActive = (item as any).isSearch ? searchOpen : (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));

          if (item.accent) {
            return (
              <Link
                key={item.href}
                href={href}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="relative w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 pulse-ring">
                  <span className="material-symbols-outlined text-on-primary text-2xl">
                    {item.icon}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-primary mt-0.5">{item.label}</span>
              </Link>
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
  );
}
