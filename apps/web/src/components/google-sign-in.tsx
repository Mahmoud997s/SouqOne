'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import Script from 'next/script';
import { useTranslations, useLocale } from 'next-intl';
import { apiRequest } from '@/lib/auth';
import { useAuth } from '@/providers/auth-provider';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, config: Record<string, unknown>) => void;
        };
      };
    };
  }
}

interface GoogleSignInProps {
  onError?: (msg: string) => void;
  /** Called after successful login (used by LoginModal to execute deferred action) */
  onSuccess?: () => void;
}

export function GoogleSignInButton({ onError, onSuccess }: GoogleSignInProps) {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const t = useTranslations('auth');
  const locale = useLocale();
  const btnRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const interval = setInterval(() => {
      if (window.google && btnRef.current) {
        clearInterval(interval);

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          ux_mode: 'popup',
        });

        window.google.accounts.id.renderButton(btnRef.current, {
          type: 'standard',
          shape: 'rectangular',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          locale,
          width: btnRef.current.offsetWidth || 400,
        });
      }
    }, 100);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCredentialResponse(response: { credential: string }) {
    setLoading(true);
    try {
      const result = await apiRequest<{ accessToken: string; refreshToken?: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: response.credential }),
      });
      await authLogin(result.accessToken, result.refreshToken);
      if (onSuccess) {
        onSuccess();
      } else {
        const returnUrl = typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('returnUrl') || '/'
          : '/';
        router.push(returnUrl);
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : t('googleLoginFailed'));
    } finally {
      setLoading(false);
    }
  }

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="w-full flex items-center justify-center gap-3 py-3 border border-outline/30 rounded-xl bg-white text-on-surface text-sm font-medium opacity-90 cursor-default transition-all hover:bg-surface-container"
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 010-9.18l-7.98-6.19a24.003 24.003 0 000 21.56l7.98-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {t('continueWithGoogle')}
      </button>
    );
  }

  return (
    <div className="w-full">
      <Script src="https://accounts.google.com/gsi/client" strategy="lazyOnload" />
      {loading ? (
        <div className="flex items-center justify-center gap-3 w-full py-3 border border-outline/30 rounded-xl text-on-surface-variant text-sm font-medium">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {t('googleVerifying')}
        </div>
      ) : (
        <div ref={btnRef} className="flex justify-center [&>div]:!w-full" />
      )}
    </div>
  );
}
