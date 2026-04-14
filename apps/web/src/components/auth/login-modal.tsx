'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { apiRequest } from '@/lib/auth';
import { useAuth } from '@/providers/auth-provider';
import { useAuthModal } from '@/providers/auth-modal-provider';
import { GoogleSignInButton } from '@/components/google-sign-in';

export function LoginModal() {
  const { isOpen, message, close, executePending } = useAuthModal();
  const { login: authLogin } = useAuth();
  const t = useTranslations('auth');
  const tc = useTranslations('common');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ accessToken: string; refreshToken?: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await authLogin(result.accessToken, result.refreshToken);
      executePending();
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleError(msg: string) {
    setError(msg);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_24px_80px_rgba(0,0,0,0.25)] overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="relative bg-primary px-6 py-5">
          <button
            onClick={close}
            className="absolute top-4 start-4 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-on-primary hover:bg-white/20 transition-colors"
            aria-label={tc('close')}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <div>
              <h2 className="text-on-primary font-black text-lg">{t('loginTitle')}</h2>
              {message && (
                <p className="text-on-primary/80 text-sm mt-0.5">{message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant">{t('emailLabel')}</label>
              <div className="relative">
                <span className="absolute end-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-lg">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 pe-10 ps-4 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm"
                 
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-on-surface-variant">{t('passwordLabel')}</label>
                <Link href="/forgot-password" onClick={close} className="text-xs text-primary hover:underline font-medium">
                  {t('forgotPassword')}
                </Link>
              </div>
              <div className="relative">
                <span className="absolute end-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-lg">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg py-3 pe-10 ps-10 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none text-sm"
                 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant/50 text-lg cursor-pointer hover:text-primary transition-colors"
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-on-primary w-full py-3 text-sm font-black hover:brightness-110 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('loggingIn')}
                </>
              ) : (
                <>
                  {t('loginBtn')}
                  <span className="material-symbols-outlined text-base">login</span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="h-px flex-1 bg-outline-variant/20" />
            <span className="text-xs text-on-surface-variant/60 font-medium">{t('or')}</span>
            <div className="h-px flex-1 bg-outline-variant/20" />
          </div>

          {/* Google */}
          <GoogleSignInButton onError={handleGoogleError} onSuccess={() => { executePending(); close(); }} />

          {/* Register link */}
          <p className="text-center text-on-surface-variant text-sm mt-5">
            {t('noAccount')}{' '}
            <Link href="/register" onClick={close} className="text-primary font-bold hover:underline">
              {t('createNewAccount')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
