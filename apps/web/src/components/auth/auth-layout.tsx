'use client';

import React from 'react';
import { Link, useRouter } from '@/i18n/navigation';

interface AuthLayoutProps {
  children: React.ReactNode;
  heroTitle?: React.ReactNode;
  heroSubtitle?: React.ReactNode;
  formTitle: string;
  formSubtitle: string;
}

export function AuthLayout({ children, formTitle, formSubtitle }: AuthLayoutProps) {
  const router = useRouter();

  return (
    <div className="relative min-h-[100dvh] flex flex-col sm:justify-center overflow-x-hidden">
      {/* ── Background ── */}
      <div className="fixed inset-0 bg-surface animate-auth-bg" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />

      {/* ── Mobile: Back Button (absolute) ── */}
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-30 w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm border border-outline/15 text-on-surface-variant active:scale-95 transition-all shadow-sm sm:hidden safe-area-top"
        aria-label="رجوع"
      >
        <span className="material-symbols-outlined text-xl">arrow_forward</span>
      </button>

      {/* ── Mobile: Logo Area ── */}
      <div className="relative z-20 sm:hidden pt-9 pb-5 flex flex-col items-center gap-1 safe-area-top animate-auth-logo">
        <Link href="/" className="flex flex-col items-center gap-1">
          <img src="/logo.png" alt="SouqOne" className="h-14 w-auto object-contain" />
          <img src="/name.png" alt="سوق وان" className="h-4 w-auto object-contain" />
        </Link>
      </div>

      {/* ── Centered Column ── */}
      <div className="relative z-10 w-full max-w-md mx-auto sm:px-5 py-0 sm:py-12 flex-1 sm:flex-initial flex flex-col sm:block">
        {/* Logo + Name — desktop only */}
        <Link href="/" className="hidden sm:flex flex-col items-center gap-2 mb-6 animate-auth-logo">
          <img src="/logo.png" alt="SouqOne" className="h-10 sm:h-12 w-auto object-contain" />
          <img src="/name.png" alt="سوق وان" className="h-7 sm:h-8 w-auto object-contain" />
        </Link>

        {/* Card container — rounded top on mobile for layered feel */}
        <div className="bg-white border border-outline/20 rounded-t-3xl sm:rounded-2xl p-5 sm:p-7 shadow-sm flex-1 sm:flex-initial animate-auth-card">
          {/* Title + Subtitle */}
          <div className="text-center mb-5">
            <h1 className="text-lg sm:text-xl font-extrabold text-on-surface mb-1">
              {formTitle}
            </h1>
            <p className="text-on-surface-variant text-sm font-medium">
              {formSubtitle}
            </p>
          </div>

          {/* Form content + footer */}
          {children}
        </div>
      </div>
    </div>
  );
}
