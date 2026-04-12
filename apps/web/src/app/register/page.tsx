'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { apiRequest } from '@/lib/auth';
import { useAuth } from '@/providers/auth-provider';
import { GoogleSignInButton } from '@/components/google-sign-in';
import { countryCodes } from '@/lib/country-codes';
import { AuthLayout } from '@/components/auth/auth-layout';
import { InputField } from '@/components/auth/input-field';
import { PasswordStrength } from '@/components/auth/password-strength';
import { CustomSelect } from '@/components/ui/custom-select';
import { getCountries, getGovernorates, getCities } from '@/lib/location-data';

export default function RegisterPage() {
  const router = useRouter();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+968');
  const [showCodes, setShowCodes] = useState(false);
  const [codeSearch, setCodeSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState('');
  const [country, setCountry] = useState('OM');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const countryOptions = getCountries();
  const governorateOptions = getGovernorates(country);
  const cityOptions = getCities(country, governorate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const filteredCodes = countryCodes.filter(
    (c) => c.name.includes(codeSearch) || c.dial.includes(codeSearch) || c.code.toLowerCase().includes(codeSearch.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCodes(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest<{ accessToken: string; refreshToken?: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          username,
          email,
          password,
          phone: phone ? `${countryCode}${phone}` : undefined,
          country,
          governorate,
          city,
        }),
      });
      await authLogin(result.accessToken, result.refreshToken);
      sessionStorage.setItem('new_user', 'true');
      router.push('/verify-email');
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
    <AuthLayout
      heroTitle="انضم إلينا في سوق وان"
      heroSubtitle="ابدأ رحلتك في المعرض الرقمي الأول، وتصفح آلاف السيارات بأفضل جودة وأعلى موثوقية."
      formTitle="إنشاء حساب"
      formSubtitle="أدخل بياناتك للبدء في تصفح المعرض"
    >
      <div className={shake ? 'animate-shake' : ''}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username */}
          <InputField
            label="اسم المستخدم"
            icon="person"
            required
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
            placeholder="اسم المستخدم"
          />

          {/* Email */}
          <InputField
            label="البريد الإلكتروني"
            icon="mail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="البريد الإلكتروني"
          />

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
              رقم الهاتف <span className="text-on-surface-variant/60 normal-case text-[11px]">(اختياري)</span>
            </label>
            <div className="relative flex items-center gap-0" dir="ltr" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => { setShowCodes(!showCodes); setCodeSearch(''); }}
                className="flex items-center justify-center gap-1 bg-white border border-outline/40 border-r-0 rounded-l-xl py-3 sm:py-3.5 px-2 text-sm font-medium text-on-surface hover:bg-surface-container transition-all w-[80px] shrink-0"
              >
                <span className="text-[11px] text-on-surface-variant">{countryCode}</span>
                <span className="material-symbols-outlined text-outline text-[13px]">expand_more</span>
              </button>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="رقم الهاتف"
                className="w-full text-right placeholder:text-right bg-white border border-outline/40 border-l-0 rounded-r-xl py-3 sm:py-3.5 px-4 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm transition-all text-on-surface placeholder:text-outline"
                dir="rtl"
              />
              {showCodes && (
                <div className="absolute top-full left-0 mt-2 w-full max-w-[18rem] bg-white rounded-2xl shadow-lg border border-outline/30 z-50 max-h-64 overflow-hidden flex flex-col" dir="rtl">
                  <div className="p-2 border-b border-outline-variant/20">
                    <input
                      type="text"
                      value={codeSearch}
                      onChange={(e) => setCodeSearch(e.target.value)}
                      placeholder="ابحث عن دولة..."
                      className="w-full bg-surface-container border border-outline/30 rounded-lg py-2 px-3 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-52 pb-1">
                    {filteredCodes.map((c) => (
                      <button
                        key={c.code + c.dial}
                        type="button"
                        onClick={() => { setCountryCode(c.dial); setShowCodes(false); }}
                        className={`w-full flex items-center gap-3 py-2.5 text-sm transition-all duration-300 relative overflow-hidden ${
                          c.dial === countryCode
                            ? 'bg-primary/10 text-primary font-bold pr-5 pl-3 border-r-[4px] border-primary'
                            : 'text-on-surface font-medium pr-3 pl-3 hover:bg-surface-container hover:text-primary hover:pr-5'
                        }`}
                      >
                        <span className="text-base">{c.flag}</span>
                        <span className="flex-1 text-right">{c.name}</span>
                        <span className={`text-xs ${c.dial === countryCode ? 'text-primary font-bold' : 'text-on-surface-variant'}`} dir="ltr">{c.dial}</span>
                      </button>
                    ))}
                    {filteredCodes.length === 0 && (
                      <div className="px-3 py-6 text-center text-sm font-medium text-on-surface-variant">لا توجد نتائج</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest truncate">الدولة</label>
              <div className="bg-white border border-outline/40 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                <CustomSelect
                  value={country}
                  onChange={(val) => { setCountry(val); setGovernorate(''); setCity(''); }}
                  options={countryOptions}
                  placeholder="الدولة"
                  searchable
                  variant="light"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest truncate">الولاية/المحافظة</label>
              <div className="bg-white border border-outline/40 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                <CustomSelect
                  value={governorate}
                  onChange={(val) => { setGovernorate(val); setCity(''); }}
                  options={governorateOptions}
                  placeholder={country ? 'المحافظة' : 'اختر الدولة أولاً'}
                  disabled={!country}
                  searchable
                  variant="light"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest truncate">المنطقة/المدينة</label>
              <div className="bg-white border border-outline/40 rounded-xl py-2.5 sm:py-3 px-3 sm:px-4 focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                <CustomSelect
                  value={city}
                  onChange={setCity}
                  options={cityOptions}
                  placeholder={governorate ? 'المدينة' : 'اختر المحافظة أولاً'}
                  disabled={!governorate}
                  searchable
                  variant="light"
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <InputField
              label="كلمة المرور"
              icon="lock"
              isPassword
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder="••••••••"
              hint="8 أحرف على الأقل"
            />
            <PasswordStrength password={password} />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-outline/40 bg-white text-primary focus:ring-primary/30 focus:ring-2 cursor-pointer"
            />
            <span className="text-xs text-on-surface-variant leading-relaxed group-hover:text-on-surface transition-colors">
              أوافق على{' '}
              <Link href="/terms" className="text-primary hover:underline underline-offset-2">
                الشروط والأحكام
              </Link>{' '}
              و{' '}
              <Link href="/privacy" className="text-primary hover:underline underline-offset-2">
                سياسة الخصوصية
              </Link>
            </span>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !agreedTerms}
            className="btn-editorial w-full h-12 flex items-center justify-center gap-2 font-black text-sm rounded-xl hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                جارٍ الإنشاء...
              </>
            ) : (
              <>
                إنشاء حساب مجاني
                <span className="material-symbols-outlined text-base">how_to_reg</span>
              </>
            )}
          </button>

          {/* Trust signal */}
          <p className="text-center text-on-surface-variant/50 text-[11px] flex items-center justify-center gap-1.5">
            <span className="material-symbols-outlined text-xs">lock</span>
            بياناتك آمنة ومحمية بالكامل
          </p>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="h-px flex-1 bg-outline/20" />
          <span className="text-xs text-on-surface-variant/60 font-medium">أو</span>
          <div className="h-px flex-1 bg-outline/20" />
        </div>

        {/* Google Sign-In */}
        <GoogleSignInButton onError={setError} />

        <p className="text-center text-on-surface-variant text-sm mt-5 font-medium">
          لديك حساب بالفعل؟{' '}
          <Link href="/login" className="text-primary font-bold hover:underline transition-all">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
