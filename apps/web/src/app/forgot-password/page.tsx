'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/auth-layout';
import { apiRequest } from '@/lib/auth';

export default function ForgotPasswordPage() {
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
    <AuthLayout
      heroTitle="لا تقلق، نحن هنا للمساعدة"
      heroSubtitle="نسيان كلمة المرور أمر وارد. أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيينها فوراً لتتمكن من العودة للمعرض."
      formTitle="استعادة كلمة المرور"
      formSubtitle="أدخل بريدك الإلكتروني المرتبط بحسابك."
    >
      {!success ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                className="w-full text-right placeholder:text-right bg-white/60 border border-white/80 rounded-xl py-3.5 pr-12 pl-4 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:outline-none text-sm transition-all shadow-sm"
                dir="rtl"
              />
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
            className="btn-editorial w-full h-[40px] flex items-center justify-center gap-2 font-black text-sm hover:brightness-105 hover:shadow-ambient disabled:opacity-60 mt-4"
          >
            {loading ? 'جارٍ الإرسال...' : 'إرسال رابط الاستعادة'}
            {!loading && <span className="material-symbols-outlined text-base">send</span>}
          </button>
        </form>
      ) : (
        <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 text-center text-white mb-2 shadow-inner">
          <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-primary text-2xl">mark_email_read</span>
          </div>
          <h3 className="font-bold text-lg mb-2">تم الإرسال بنجاح!</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            لقد أرسلنا رابط الاستعادة إلى <strong className="text-white">{email}</strong>، يرجى مراجعة صندوق الوارد الخاص بك، مجلد الرسائل غير المرغوب فيها (Spam) إذا لزم الأمر.
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 mt-8 mb-6">
        <div className="h-px flex-1 bg-white/20" />
      </div>

      <p className="text-center text-white/70 text-sm font-medium">
        تذكرت كلمة المرور؟{' '}
        <Link href="/login" className="text-primary font-bold hover:text-white transition-all">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </AuthLayout>
  );
}
