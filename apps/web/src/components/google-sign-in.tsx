'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
          locale: 'ar',
          width: '100%',
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
      onError?.(err instanceof Error ? err.message : 'فشل تسجيل الدخول بواسطة Google');
    } finally {
      setLoading(false);
    }
  }

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex items-center justify-center gap-3 w-full py-3.5 border border-outline-variant rounded-full text-on-surface-variant text-sm font-medium">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          جارٍ التحقق...
        </div>
      ) : (
        <div ref={btnRef} className="flex justify-center [&>div]:!w-full" />
      )}
    </div>
  );
}
