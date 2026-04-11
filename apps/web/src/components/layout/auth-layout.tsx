import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  heroTitle: React.ReactNode;
  heroSubtitle: React.ReactNode;
  formTitle: string;
  formSubtitle: string;
}

export function AuthLayout({ children, heroTitle, heroSubtitle, formTitle, formSubtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col lg:flex-row overflow-hidden">
      {/* ── Fullscreen Background ── */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy/90 via-black/50 to-brand-navy/90" />
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)' }} />

      {/* ── Desktop: Left Hero Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col items-center justify-center p-12 bg-black/30 text-white backdrop-blur-md text-center">
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logo.png" alt="SouqOne" className="h-[120px] w-auto object-contain drop-shadow-2xl" />
          <img src="/name.png" alt="سوق وان" className="h-[48px] w-auto object-contain brightness-0 invert drop-shadow-md" />
        </div>
        <h2 className="text-3xl font-black mb-4 leading-tight">{heroTitle}</h2>
        <p className="text-white/80 text-base font-medium leading-relaxed max-w-sm">{heroSubtitle}</p>
      </div>

      {/* ── Form Panel — full-screen scroll on mobile, right half on desktop ── */}
      <div className="relative z-10 flex-1 lg:w-1/2 overflow-y-auto">
        <div className="min-h-[100dvh] lg:min-h-0 lg:h-full flex flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-16">
          {/* Mobile-only brand row */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-6">
            <Link href="/">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="SouqOne" className="h-[36px] w-auto object-contain" />
                <img src="/name.png" alt="سوق وان" className="h-[20px] w-auto object-contain brightness-0 invert" />
              </div>
            </Link>
          </div>

          {/* Card wrapper — glass on desktop, transparent on mobile */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 text-center">{formTitle}</h1>
            <p className="text-white/70 text-sm mb-6 sm:mb-8 font-medium text-center">{formSubtitle}</p>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
