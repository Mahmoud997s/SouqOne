'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/auth';
import { AuthLayout } from '@/components/auth/auth-layout';
import { InputField } from '@/components/auth/input-field';
import { OtpInput } from '@/components/auth/otp-input';
import { PasswordStrength } from '@/components/auth/password-strength';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('أدخل الرمز المكون من 6 أرقام');
      return;
    }
    if (newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code: fullCode, newPassword }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      heroTitle="تعيين كلمة مرور جديدة"
      heroSubtitle="أدخل الرمز الذي وصلك على بريدك الإلكتروني وقم بتعيين كلمة مرور جديدة وآمنة."
      formTitle="إعادة تعيين كلمة المرور"
      formSubtitle="أدخل الرمز وكلمة المرور الجديدة."
    >
      <div>
        {done ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-green-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <h2 className="font-bold text-xl text-on-surface mb-2">تم تغيير كلمة المرور!</h2>
            <p className="text-on-surface-variant text-sm mb-8">
              يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="btn-editorial w-full h-12 flex items-center justify-center gap-2 font-black text-sm rounded-xl hover:brightness-110 hover:shadow-lg transition-all"
            >
              تسجيل الدخول
              <span className="material-symbols-outlined text-base">login</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email (if not in query) */}
            {!emailFromQuery && (
              <InputField
                label="البريد الإلكتروني"
                icon="mail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                placeholder="name@example.com"
              />
            )}

            {/* OTP */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                رمز التحقق
              </label>
              <OtpInput value={code} onChange={setCode} />
            </div>

            {/* New Password */}
            <div>
              <InputField
                label="كلمة المرور الجديدة"
                icon="lock"
                isPassword
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.currentTarget.value)}
                placeholder="••••••••"
              />
              <PasswordStrength password={newPassword} />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="btn-editorial w-full h-12 flex items-center justify-center gap-2 font-black text-sm rounded-xl hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  جارٍ التغيير...
                </>
              ) : (
                'تغيير كلمة المرور'
              )}
            </button>
          </form>
        )}

        <p className="text-center text-on-surface-variant text-sm mt-5 font-medium">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline transition-all group">
            <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">arrow_back</span>
            العودة لتسجيل الدخول
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
