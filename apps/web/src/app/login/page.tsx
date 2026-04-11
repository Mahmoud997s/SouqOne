'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiRequest } from '@/lib/auth';
import { useAuth } from '@/providers/auth-provider';
import { GoogleSignInButton } from '@/components/google-sign-in';
import { AuthLayout } from '@/components/layout/auth-layout';

export default function LoginPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Read returnUrl from query params
  const returnUrl = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('returnUrl') || '/'
    : '/';

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
      router.push(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heroTitle="مرحباً بعودتك إلى المعرض"
      heroSubtitle="المعرض الرقمي الأول للسيارات في سلطنة عمان. استمتع بتجربة بريميوم لبيع وشراء السيارات بكل سهولة وثقة."
      formTitle="تسجيل الدخول"
      formSubtitle="ادخل إلى لوحة تحكم المعرض الخاص بك."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-white/90 uppercase tracking-widest">البريد الإلكتروني</label>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full text-right placeholder:text-right bg-white/60 border border-white/80 rounded-xl py-3 sm:py-3.5 pr-11 pl-4 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:outline-none text-sm transition-all shadow-sm"
              dir="rtl"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-white/90">
            <label className="text-xs font-bold uppercase tracking-widest">كلمة المرور</label>
            <Link href="/forgot-password" className="text-xs text-primary hover:text-white transition-colors font-medium">
              نسيت كلمة المرور؟
            </Link>
          </div>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">lock</span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-right placeholder:text-right bg-white/60 border border-white/80 rounded-xl py-3 sm:py-3.5 pr-11 pl-11 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:outline-none text-sm transition-all shadow-sm"
              dir="rtl"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg cursor-pointer hover:text-primary transition-colors"
            >
              {showPassword ? 'visibility_off' : 'visibility'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-editorial w-full h-[40px] flex items-center justify-center gap-2 font-black text-sm hover:brightness-105 hover:shadow-ambient disabled:opacity-60"
        >
          {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
          {!loading && <span className="material-symbols-outlined text-base">login</span>}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-white/20" />
        <span className="text-xs text-white/60 font-medium">أو</span>
        <div className="h-px flex-1 bg-white/20" />
      </div>

      {/* Google Sign-In */}
      <GoogleSignInButton onError={setError} onSuccess={() => router.push(returnUrl)} />

      <p className="text-center text-white/70 text-sm mt-8 font-medium">
        ليس لديك حساب؟{' '}
        <Link href="/register" className="text-primary font-bold hover:text-white transition-all">
          إنشاء حساب جديد
        </Link>
      </p>
    </AuthLayout>
  );
}
