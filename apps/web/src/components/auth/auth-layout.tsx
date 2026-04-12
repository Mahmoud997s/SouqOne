'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <div className="relative min-h-[100dvh] flex flex-col sm:justify-center overflow-x-hidden" dir="rtl">
      {/* ── Background ── */}
      <div className="fixed inset-0 bg-surface" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.06] blur-[120px] pointer-events-none" />

      {/* ── Mobile Top Bar ── */}
      <div className="relative z-20 sm:hidden safe-area-top">
        <div className="relative flex items-center justify-between h-14 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-outline/15 text-on-surface-variant active:scale-95 transition-all shadow-sm"
            aria-label="رجوع"
          >
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>

          <Link href="/" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-0.5">
            <img src="/logo.png" alt="SouqOne" className="h-7 w-auto object-contain" />
            <img src="/name.png" alt="سوق وان" className="h-3.5 w-auto object-contain" />
          </Link>

          <div className="w-10" />
        </div>
      </div>

      {/* ── Centered Column ── */}
      <div className="relative z-10 w-full max-w-md mx-auto px-5 py-4 sm:py-12 flex-1 sm:flex-initial flex flex-col sm:block justify-center">
        {/* Logo + Name — desktop only */}
        <Link href="/" className="hidden sm:flex flex-col items-center gap-2 mb-6">
          <img src="/logo.png" alt="SouqOne" className="h-10 sm:h-12 w-auto object-contain" />
          <img src="/name.png" alt="سوق وان" className="h-7 sm:h-8 w-auto object-contain" />
        </Link>

        {/* Card container */}
        <div className="bg-white border border-outline/20 rounded-2xl p-5 sm:p-7 shadow-sm">
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
