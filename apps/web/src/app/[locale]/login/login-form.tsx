'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { apiRequest } from '@/lib/auth';
import { useAuth } from '@/providers/auth-provider';
import { GoogleSignInButton } from '@/components/google-sign-in';
import { InputField } from '@/components/auth/input-field';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  function navigateAfterLogin() {
    if (returnUrl) {
      router.push(returnUrl);
    } else {
      router.back();
    }
  }

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
      navigateAfterLogin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={shake ? 'animate-shake' : ''}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <InputField
          label="البريد الإلكتروني"
          icon="mail"
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="البريد الإلكتروني"
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">كلمة المرور</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/70 transition-colors font-medium">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <InputField
            label=""
            icon="lock"
            isPassword
            required
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-black text-sm rounded-xl hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
              جارٍ الدخول...
            </>
          ) : (
            <>
              تسجيل الدخول
              <span className="material-symbols-outlined text-base">login</span>
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-outline/20" />
        <span className="text-xs text-on-surface-variant/60 font-medium">أو</span>
        <div className="h-px flex-1 bg-outline/20" />
      </div>

      {/* Google Sign-In */}
      <GoogleSignInButton onError={setError} onSuccess={navigateAfterLogin} />

      <p className="text-center text-on-surface-variant text-sm mt-5 font-medium">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-primary font-bold hover:underline transition-all">
          إنشاء حساب جديد
        </Link>
      </p>
    </div>
  );
}
