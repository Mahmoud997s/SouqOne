'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { apiRequest } from '@/lib/auth';
import { useAuth } from '@/providers/auth-provider';
import { GoogleSignInButton } from '@/components/google-sign-in';
import { countryCodes } from '@/lib/country-codes';
import { AuthLayout } from '@/components/layout/auth-layout';
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
  const [showPassword, setShowPassword] = useState(false);
  const [country, setCountry] = useState('OM');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');

  const countryOptions = getCountries();
  const governorateOptions = getGovernorates(country);
  const cityOptions = getCities(country, governorate);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          city
        }),
      });
      await authLogin(result.accessToken, result.refreshToken);
      sessionStorage.setItem('new_user', 'true');
      router.push('/verify-email');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-white/90 uppercase tracking-widest">اسم المستخدم</label>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">person</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="اسم المستخدم"
              className="w-full text-right placeholder:text-right bg-white/60 border border-white/80 rounded-xl py-3.5 pr-12 pl-4 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:outline-none text-sm transition-all shadow-sm"
              dir="rtl"
            />
          </div>
        </div>

        {/* Email */}
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

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-white/90 uppercase tracking-widest">رقم الهاتف <span className="text-gray-400 normal-case text-[11px]">(اختياري)</span></label>
          <div className="relative flex items-center gap-0" dir="ltr" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => { setShowCodes(!showCodes); setCodeSearch(''); }}
              className="flex items-center justify-center gap-1 bg-white/60 border border-white/80 border-r-0 rounded-l-xl py-3.5 px-2 text-sm font-medium text-brand-navy hover:bg-white transition-all w-[27%] shrink-0 shadow-sm"
            >
              <span className="text-[11px] text-gray-500">{countryCode}</span>
              <span className="material-symbols-outlined text-gray-400 text-[13px]">expand_more</span>
            </button>

            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="رقم الهاتف"
              className="w-full text-right placeholder:text-right bg-white/60 border border-white/80 border-l-0 rounded-r-xl py-3.5 px-4 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:outline-none text-sm transition-all shadow-sm"
              dir="rtl"
            />

            {showCodes && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white/80 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] border border-white/40 z-50 max-h-64 overflow-hidden flex flex-col" dir="rtl">
                <div className="p-2 border-b border-white/30">
                  <input
                    type="text"
                    value={codeSearch}
                    onChange={(e) => setCodeSearch(e.target.value)}
                    placeholder="ابحث عن دولة..."
                    className="w-full bg-white/50 border border-white/60 rounded-lg py-2 px-3 text-sm text-brand-navy placeholder-brand-navy/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white transition-all shadow-sm"
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto max-h-52 premium-scrollbar pb-1">
                  {filteredCodes.map((c) => (
                    <button
                      key={c.code + c.dial}
                      type="button"
                      onClick={() => { setCountryCode(c.dial); setShowCodes(false); }}
                      className={`w-full flex items-center gap-3 py-2.5 text-sm transition-all duration-300 relative overflow-hidden ${
                        c.dial === countryCode 
                          ? 'bg-primary/15 text-primary font-bold pr-5 pl-3 border-r-[4px] border-primary' 
                          : 'text-brand-navy font-medium pr-3 pl-3 hover:bg-white/60 hover:text-primary hover:pr-5'
                      }`}
                    >
                      <span className="text-base">{c.flag}</span>
                      <span className="flex-1 text-right">{c.name}</span>
                      <span className={`text-xs ${c.dial === countryCode ? 'text-primary font-bold' : 'text-gray-500'}`} dir="ltr">{c.dial}</span>
                    </button>
                  ))}
                  {filteredCodes.length === 0 && (
                    <div className="px-3 py-6 text-center text-sm font-medium text-gray-500">لا توجد نتائج</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Grid: Country, Governorate, City */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/90 uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap">الدولة</label>
            <div className="bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all shadow-sm">
              <CustomSelect
                value={country}
                onChange={(val) => { setCountry(val); setGovernorate(''); setCity(''); }}
                options={countryOptions}
                placeholder="الدولة"
                searchable
              />
            </div>
          </div>

          {/* Governorate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/90 uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap">الولاية/المحافظة</label>
            <div className="bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all shadow-sm">
              <CustomSelect
                value={governorate}
                onChange={(val) => { setGovernorate(val); setCity(''); }}
                options={governorateOptions}
                placeholder={country ? 'المحافظة' : 'اختر الدولة أولاً'}
                disabled={!country}
                searchable
              />
            </div>
          </div>

          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/90 uppercase tracking-widest overflow-hidden text-ellipsis whitespace-nowrap">المنطقة/المدينة</label>
            <div className="bg-white/60 border border-white/80 rounded-xl py-3 px-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all shadow-sm">
              <CustomSelect
                value={city}
                onChange={setCity}
                options={cityOptions}
                placeholder={governorate ? 'المدينة' : 'اختر المحافظة أولاً'}
                disabled={!governorate}
                searchable
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-white/90">
            <label className="text-xs font-bold uppercase tracking-widest">كلمة المرور</label>
            <span className="text-xs text-white/60">8 أحرف على الأقل</span>
          </div>
          <div className="relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 text-lg">lock</span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full text-right placeholder:text-right bg-white/60 border border-white/80 rounded-xl py-3.5 pr-12 pl-12 focus:bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary/50 focus:outline-none text-sm transition-all shadow-sm"
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
          {loading ? 'جارٍ الإنشاء...' : 'إنشاء حساب مجاني'}
          {!loading && <span className="material-symbols-outlined text-base">how_to_reg</span>}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="h-px flex-1 bg-white/20" />
        <span className="text-xs text-white/60 font-medium">أو</span>
        <div className="h-px flex-1 bg-white/20" />
      </div>

      {/* Google Sign-In */}
      <GoogleSignInButton onError={setError} />

      <p className="text-center text-white/70 text-sm mt-8 font-medium">
        لديك حساب بالفعل؟{' '}
        <Link href="/login" className="text-primary font-bold hover:text-white transition-all">
          تسجيل الدخول
        </Link>
      </p>
    </AuthLayout>
  );
}
