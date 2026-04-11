'use client';

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiRequest } from '@/lib/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleCodeChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  }

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
    <div className="min-h-[100dvh] bg-surface flex flex-col items-center justify-center px-4 py-6 sm:p-6">
      <div className="fixed top-0 right-0 -z-10 w-1/2 h-screen overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] right-0 w-[60vw] sm:w-[600px] h-[60vw] sm:h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-container-low mb-6">
            <span className="material-symbols-outlined text-primary text-4xl">key</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-4xl tracking-tight text-on-surface mb-3">
            تعيين كلمة مرور جديدة
          </h1>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs mx-auto">
            أدخل الرمز الذي وصلك على بريدك وكلمة المرور الجديدة.
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-5 sm:p-8 shadow-sm">
          {done ? (
            <div className="flex flex-col items-center text-center py-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              </div>
              <h2 className="font-bold text-xl text-on-surface mb-2">تم تغيير كلمة المرور!</h2>
              <p className="text-on-surface-variant text-sm mb-8">
                يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="bg-primary text-on-primary hover:brightness-110 rounded-lg shadow-ambient w-full py-3.5 text-sm font-bold"
              >
                تسجيل الدخول
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email (إذا لم يكن موجوداً في query) */}
              {!emailFromQuery && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">mail</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              )}

              {/* رمز التحقق */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  رمز التحقق
                </label>
                <div className="flex gap-2 justify-center" dir="ltr" onPaste={handlePaste}>
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-surface-container-low rounded-xl border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* كلمة المرور الجديدة */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg">lock</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-surface-container-low border-none rounded-xl py-3.5 pr-12 pl-12 focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-lg"
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
                disabled={loading || code.join('').length !== 6}
                className="bg-primary text-on-primary hover:brightness-110 rounded-lg shadow-ambient w-full py-4 text-sm font-bold disabled:opacity-60"
              >
                {loading ? 'جارٍ التغيير...' : 'تغيير كلمة المرور'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-outline-variant/20 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline group"
            >
              <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
