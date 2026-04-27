'use client';

import { useTranslations, useLocale } from 'next-intl';
import LogoArIcon from '@/components/icons/logo-ar';

export default function Loading() {
  const tp = useTranslations('pages');
  const locale = useLocale();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient gradient blobs */}
      <div className="absolute top-[-30%] right-[-20%] w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-20%] left-[-15%] w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="flex flex-col items-center gap-7 relative z-10">
        {/* Logo */}
        {locale === 'ar' && (
          <div className="animate-fade-in">
            <LogoArIcon className="w-36 h-7" />
          </div>
        )}

        {/* Animated icon */}
        <div className="relative">
          {/* Outer ring pulse */}
          <div className="absolute inset-0 rounded-3xl bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
          {/* Middle ring */}
          <div className="absolute -inset-2 rounded-[22px] border border-primary/10 animate-pulse" style={{ animationDuration: '2.5s' }} />
          {/* Icon container */}
          <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 backdrop-blur-sm border border-primary/10 flex items-center justify-center shadow-lg shadow-primary/5">
            <span className="material-symbols-outlined text-primary text-[28px] animate-bounce" style={{ animationDuration: '2s', animationTimingFunction: 'ease-in-out' }}>
              directions_car
            </span>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="flex flex-col items-center gap-3">
          {/* Custom spinner */}
          <div className="relative w-8 h-8">
            <div
              className="absolute inset-0 rounded-full border-2 border-primary/10"
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"
              style={{ animationDuration: '0.8s' }}
            />
          </div>
          {/* Text */}
          <span className="text-sm font-medium text-on-surface-variant/60 tracking-wide">
            {tp('loadingText')}
          </span>
        </div>

        {/* Subtle progress dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/30 animate-pulse"
              style={{ animationDelay: `${i * 0.3}s`, animationDuration: '1.2s' }}
            />
          ))}
        </div>
      </div>

      {/* Inline keyframes for fade-in */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}
