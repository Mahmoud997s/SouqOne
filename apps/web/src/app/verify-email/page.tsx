'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/toast';
import { apiRequest } from '@/lib/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-on-surface-variant">جارٍ التحويل...</p>
      </div>
    );
  }

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
      addToast('warning', 'أدخل الرمز المكون من 6 أرقام');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ code: fullCode }),
      });
      addToast('success', 'تم توثيق البريد الإلكتروني بنجاح!');
      router.push('/');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'رمز التحقق غير صحيح');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await apiRequest('/auth/resend-verification', { method: 'POST' });
      addToast('success', 'تم إرسال رمز تحقق جديد إلى بريدك');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إعادة الإرسال');
    } finally {
      setResending(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
          </div>

          <h1 className="text-2xl font-extrabold mb-2">تأكيد البريد الإلكتروني</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            أرسلنا رمز تحقق مكون من 6 أرقام إلى<br />
            <strong className="text-on-surface">{user?.email}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-8" dir="ltr" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold bg-surface-container-low rounded-xl border-2 border-transparent focus:border-primary focus:ring-0 focus:outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || code.join('').length !== 6}
              className="bg-primary text-on-primary hover:brightness-110 rounded-lg shadow-ambient w-full py-3.5 text-sm font-bold disabled:opacity-50"
            >
              {loading ? 'جارٍ التحقق...' : 'تأكيد'}
            </button>
          </form>

          <div className="mt-6 text-sm text-on-surface-variant">
            لم تستلم الرمز؟{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary font-bold hover:underline disabled:opacity-50"
            >
              {resending ? 'جارٍ الإرسال...' : 'إعادة إرسال'}
            </button>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-4 text-sm text-on-surface-variant hover:text-on-surface transition-colors"
          >
            تخطي الآن
          </button>
        </div>
      </main>
    </>
  );
}
