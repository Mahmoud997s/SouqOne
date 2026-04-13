'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { InputField } from '@/components/auth/input-field';
import { apiRequest } from '@/lib/auth';

export default function ForgotForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!success ? (
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
            error={error || undefined}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 font-black text-sm rounded-xl hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                جارٍ الإرسال...
              </>
            ) : (
              <>
                إرسال رمز الاستعادة
                <span className="material-symbols-outlined text-base">send</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-green-500 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              mark_email_read
            </span>
          </div>
          <h3 className="font-bold text-lg text-on-surface mb-2">تم الإرسال بنجاح!</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed max-w-xs">
            لقد أرسلنا رمز الاستعادة إلى <strong className="text-on-surface">{email}</strong>، يرجى مراجعة صندوق الوارد.
          </p>
          <Link
            href={`/reset-password?email=${encodeURIComponent(email)}`}
            className="btn-primary mt-6 w-full py-3 flex items-center justify-center gap-2 font-black text-sm rounded-xl hover:brightness-110 hover:shadow-lg transition-all"
          >
            إدخال الرمز
            <span className="material-symbols-outlined text-base">arrow_back</span>
          </Link>
        </div>
      )}

      <p className="text-center text-on-surface-variant text-sm mt-5 font-medium">
        تذكرت كلمة المرور؟{' '}
        <Link href="/login" className="text-primary font-bold hover:underline transition-all">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
