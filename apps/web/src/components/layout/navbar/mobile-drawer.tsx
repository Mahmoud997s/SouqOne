'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { NavLinkItem } from '../navbar';

interface MobileDrawerProps {
  open: boolean;
  close: () => void;
  navLinks: NavLinkItem[];
  flatNavLinks: { href: string; label: string }[];
  isActive: (href: string) => boolean;
  isAuthenticated: boolean;
  user?: { username: string; displayName?: string | null; email: string; avatarUrl?: string | null } | null;
  onLogout: () => void;
}

const accountLinks = [
  { href: '/profile', icon: 'person', label: 'الملف الشخصي' },
  { href: '/my-listings', icon: 'directions_car', label: 'إعلاناتي' },
  { href: '/messages', icon: 'chat', label: 'الرسائل' },
  { href: '/favorites', icon: 'favorite', label: 'المفضلة' },
  { href: '/profile?tab=settings', icon: 'settings', label: 'الإعدادات' },
];

export function MobileDrawer({ open, close, navLinks, flatNavLinks: _flatNavLinks, isActive, isAuthenticated, user, onLogout }: MobileDrawerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={close}
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 z-[70] h-full w-[300px] sm:w-[340px] bg-surface-container-lowest shadow-2xl flex flex-col transition-transform duration-300 ease-out lg:hidden
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="SouqOne" className="h-9 w-auto object-contain" />
            <img src="/name.png" alt="سوق وان" className="h-[20px] w-auto object-contain" />
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* User card */}
        {isAuthenticated && user && (
          <div className="px-5 py-4 bg-surface-container-low border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName || user.username} className="w-10 h-10 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-black text-sm shrink-0">
                  {user.username[0]?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-on-surface text-sm truncate">{user.displayName || user.username}</p>
                <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto py-3">
          <p className="px-5 pt-2 pb-1 text-[11px] font-bold text-outline uppercase tracking-widest">التصفح</p>
          {navLinks.map(link => {
            const active = isActive(link.href) || link.children?.some(c => isActive(c.href));
            const hasChildren = link.children && link.children.length > 0;
            const isExpanded = expanded === link.href;

            return (
              <div key={link.href}>
                {hasChildren ? (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : link.href)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-sm font-semibold transition-colors
                      ${active ? 'text-primary bg-primary/5' : 'text-on-surface hover:bg-surface-container-low'}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-primary' : 'bg-outline/30'}`} />
                      {link.label}
                    </span>
                    <span className={`material-symbols-outlined text-sm text-on-surface-variant transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>chevron_left</span>
                  </button>
                ) : (
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-5 py-3 text-sm font-semibold transition-colors
                      ${active ? 'text-primary bg-primary/5' : 'text-on-surface hover:bg-surface-container-low'}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? 'bg-primary' : 'bg-outline/30'}`} />
                    {link.label}
                  </Link>
                )}
                {hasChildren && isExpanded && (
                  <div className="bg-surface-container-low/50 border-y border-outline-variant/10">
                    {link.children!.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`flex items-center gap-3 pr-12 pl-5 py-2.5 text-sm transition-colors
                          ${isActive(child.href) ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}
                      >
                        <span className="material-symbols-outlined text-base shrink-0">{child.icon}</span>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {isAuthenticated && user ? (
            <>
              <div className="mt-2 pt-3 border-t border-outline-variant/20">
                <p className="px-5 pb-1 text-[11px] font-bold text-outline uppercase tracking-widest">حسابي</p>
                {accountLinks.map(({ href, icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 px-5 py-3 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-base shrink-0 text-outline">{icon}</span> {label}
                  </Link>
                ))}
              </div>
              <div className="px-5 mt-4">
                <Link href="/add-listing" className="btn-green hover:brightness-110 w-full py-3 flex items-center justify-center gap-2 text-sm font-bold shadow-ambient">
                  <span className="material-symbols-outlined text-sm">add</span> أضف إعلانك مجاناً
                </Link>
              </div>
              <div className="px-5 mt-3">
                <button
                  onClick={() => { onLogout(); close(); }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-error border border-error/20 rounded-lg hover:bg-error-container/15 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">logout</span> تسجيل الخروج
                </button>
              </div>
            </>
          ) : (
            <div className="px-5 mt-4 space-y-3">
              <Link href="/register" className="bg-primary text-on-primary hover:brightness-110 w-full py-3 flex items-center justify-center text-sm font-bold rounded-lg shadow-ambient">
                إنشاء حساب مجاني
              </Link>
              <Link
                href="/login"
                className="w-full flex items-center justify-center py-3 text-sm font-bold text-primary border border-primary/25 rounded-lg hover:bg-primary/5 transition-colors"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-outline-variant/20">
          <p className="text-[11px] text-outline text-center">ســــوق وان · منصة السيارات الأولى</p>
        </div>
      </aside>
    </>
  );
}
