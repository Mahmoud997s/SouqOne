'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthModal } from '@/providers/auth-modal-provider';
import type { AuthView } from '@/providers/auth-modal-provider';
import LoginForm from '@/app/[locale]/login/login-form';
import RegisterForm from '@/app/[locale]/register/register-form';
import ForgotForm from '@/app/[locale]/forgot-password/forgot-form';
import ResetForm from '@/app/[locale]/reset-password/reset-form';
import VerifyEmailContent from '@/components/auth/verify-content';

const VIEW_META: Record<Exclude<AuthView, null>, { titleKey: string; subtitleKey: string }> = {
  login:    { titleKey: 'loginTitle',          subtitleKey: 'loginSubtitle' },
  register: { titleKey: 'registerTitle',       subtitleKey: 'registerSubtitle' },
  forgot:   { titleKey: 'forgotPasswordTitle', subtitleKey: 'forgotPasswordSubtitle' },
  reset:    { titleKey: 'resetPasswordTitle',  subtitleKey: 'resetPasswordSubtitle' },
  verify:   { titleKey: 'verifyEmailTitle',    subtitleKey: 'verifyEmailSubtitle' },
};

export function AuthOverlay() {
  const { view, isOpen, message, close } = useAuthModal();
  const locale = useLocale();
  const t = useTranslations('auth');

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Close on Escape
  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') close();
  }, [close]);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleEscape]);

  if (!isOpen || !view) return null;

  const meta = VIEW_META[view];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center backdrop-blur-xl transition-colors duration-200 bg-brand-navy/45 dark:bg-black/60"
      onClick={close}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col items-center w-full max-w-full"
      >
        {/* Brand — above the card */}
        <div className="mb-4 hidden sm:block">
          {locale === 'ar' ? (
            <Image src="/souq-one-ar-dark.svg" alt="سوق وان" width={180} height={36} className="h-[36px] w-auto" />
          ) : (
            <Image src="/souq-one-en-dark.svg" alt="SouqOne" width={158} height={31} className="h-[31px] w-auto object-contain" />
          )}
        </div>

        {/* Card */}
        <div className="auth-sheet">
          {/* Drag handle — mobile only */}
          <div className="auth-drag-handle" />

          {/* Title */}
          <div className="py-3 text-center border-b border-outline-variant/15 dark:border-outline-variant/25">
            <h2 className="text-on-surface text-base font-bold mb-0.5">
              {message || t(meta.titleKey)}
            </h2>
            <p className="text-on-surface-variant text-[11px]">
              {t(meta.subtitleKey)}
            </p>
          </div>

          {/* Body */}
          <div className="pt-3">
            {view === 'login' && <LoginForm />}
            {view === 'register' && <RegisterForm />}
            {view === 'forgot' && <ForgotForm />}
            {view === 'reset' && <ResetForm />}
            {view === 'verify' && <VerifyEmailContent />}
          </div>
        </div>
      </div>
    </div>
  );
}
