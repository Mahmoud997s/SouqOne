'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/toast';
import { apiRequest } from '@/lib/auth';
import AuthPage from '@/components/auth/auth-page';
import { OtpInput } from '@/components/auth/otp-input';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = useCallback(async () => {
    setResending(true);
    try {
      await apiRequest('/auth/resend-verification', { method: 'POST' });
      addToast('success', 'تم إرسال رمز تحقق جديد إلى بريدك');
      setCountdown(60);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'حدث خطأ أثناء إعادة الإرسال');
    } finally {
      setResending(false);
    }
  }, [addToast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <p className="text-sm text-on-surface-variant">جارٍ التحويل...</p>
      </div>
    );
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

  return (
    <AuthPage
      title="تأكيد البريد الإلكتروني"
      subtitle="أدخل الرمز المرسل إلى بريدك لتفعيل حسابك"
    >
      <div>
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">mark_email_read</span>
          </div>
          <p className="text-on-surface-variant text-sm">
            أرسلنا رمز تحقق مكون من 6 أرقام إلى
          </p>
          <p className="text-on-surface font-bold text-sm mt-1">{user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <OtpInput value={code} onChange={setCode} disabled={loading} />

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-black text-sm rounded-xl hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                جارٍ التحقق...
              </>
            ) : (
              'تأكيد'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-on-surface-variant">
          لم تستلم الرمز؟{' '}
          {countdown > 0 ? (
            <span className="text-on-surface-variant/60 font-medium">
              إعادة إرسال بعد {countdown} ثانية
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-primary font-bold hover:underline transition-colors disabled:opacity-50"
            >
              {resending ? 'جارٍ الإرسال...' : 'إعادة إرسال'}
            </button>
          )}
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-3 w-full text-center text-sm text-on-surface-variant/60 hover:text-on-surface transition-colors"
        >
          تخطي الآن
        </button>
      </div>
    </AuthPage>
  );
}
