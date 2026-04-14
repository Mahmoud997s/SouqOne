'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { useState, useRef, useEffect } from 'react';
import { apiRequest } from '@/lib/auth';
import { useAuth } from '@/providers/auth-provider';
import { GoogleSignInButton } from '@/components/google-sign-in';
import { getCountryCodes } from '@/lib/country-codes';
import { useTranslations, useLocale } from 'next-intl';
import { CustomSelect } from '@/components/ui/custom-select';
import { getGovernorates, getCities } from '@/lib/location-data';

export default function RegisterForm() {
  const router = useRouter();
  const t = useTranslations('auth');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { login: authLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+968');
  const [showCodes, setShowCodes] = useState(false);
  const [codeSearch, setCodeSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [password, setPassword] = useState('');
  const [country] = useState('OM');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);

  const governorateOptions = getGovernorates(country, locale);
  const cityOptions = getCities(country, governorate, locale);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const codes = getCountryCodes(locale);
  const filteredCodes = codes.filter(
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
      const msg = err instanceof Error ? err.message : t('unexpectedError');
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={shake ? 'animate-shake' : ''}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>

        {/* ── Section 1: المعلومات الأساسية ── */}
        <div className="section-divider"><span>{t('basicInfo')}</span></div>

        {/* Username */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: '#555', display: 'block', marginBottom: 3 }}>
            {t('username')}
          </label>
          <input
            className="auth-input"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t('usernamePlaceholder')}
          />
        </div>

        {/* Email */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: '#555', display: 'block', marginBottom: 3 }}>
            {t('emailLabel')}
          </label>
          <input
            className="auth-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('emailPlaceholder')}
          />
        </div>

        {/* Phone */}
        <div ref={dropdownRef}>
          <label style={{ fontSize: 11, fontWeight: 500, color: '#555', display: 'block', marginBottom: 3 }}>
            {t('phoneLabel')}{' '}
            <span style={{ fontSize: 10, color: '#bbb', fontWeight: 400 }}>{t('phoneOptional')}</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 8, position: 'relative' }} dir="ltr">
            <button
              type="button"
              onClick={() => { setShowCodes(!showCodes); setCodeSearch(''); }}
              className="auth-input"
              style={{ padding: '0 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, cursor: 'pointer' }}
            >
              <span style={{ fontSize: 11 }}>{countryCode}</span>
              <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#999' }}>expand_more</span>
            </button>
            <input
              type="tel"
              className="auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder={t('phonePlaceholder')}
             
            />
            {showCodes && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, width: '100%', maxWidth: 288, background: '#fff', borderRadius: 14, boxShadow: '0 8px 30px rgba(0,0,0,0.12)', border: '0.5px solid #e0e0e0', zIndex: 50, maxHeight: 256, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: 8, borderBottom: '0.5px solid #f0f0f0' }}>
                  <input
                    type="text"
                    value={codeSearch}
                    onChange={(e) => setCodeSearch(e.target.value)}
                    placeholder={t('searchCountry')}
                    className="auth-input"
                    style={{ height: 36, fontSize: 12 }}
                    autoFocus
                  />
                </div>
                <div style={{ overflowY: 'auto', maxHeight: 208, paddingBottom: 4 }}>
                  {filteredCodes.map((c) => (
                    <button
                      key={c.code + c.dial}
                      type="button"
                      onClick={() => { setCountryCode(c.dial); setShowCodes(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 12px', fontSize: 13, border: 'none',
                        background: c.dial === countryCode ? 'rgba(26,58,143,0.08)' : 'transparent',
                        color: c.dial === countryCode ? '#1a3a8f' : '#333',
                        fontWeight: c.dial === countryCode ? 600 : 400,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      <span>{c.flag}</span>
                      <span style={{ flex: 1 }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: c.dial === countryCode ? '#1a3a8f' : '#999' }} dir="ltr">{c.dial}</span>
                    </button>
                  ))}
                  {filteredCodes.length === 0 && (
                    <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: 13, color: '#999' }}>{tc('noResults')}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 2: الموقع ── */}
        <div className="section-divider"><span>{t('location')}</span></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: '#555', display: 'block', marginBottom: 3 }}>
              {t('governorate')}
            </label>
            <div className="auth-input" style={{ display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
              <CustomSelect
                value={governorate}
                onChange={(val) => { setGovernorate(val); setCity(''); }}
                options={governorateOptions}
                placeholder={country ? t('governoratePlaceholder') : t('selectCountryFirst')}
                disabled={!country}
                searchable
                variant="light"
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: '#555', display: 'block', marginBottom: 3 }}>
              {t('area')}
            </label>
            <div className="auth-input" style={{ display: 'flex', alignItems: 'center', padding: 0, overflow: 'hidden' }}>
              <CustomSelect
                value={city}
                onChange={setCity}
                options={cityOptions}
                placeholder={governorate ? t('cityPlaceholder') : t('selectGovFirst')}
                disabled={!governorate}
                searchable
                variant="light"
              />
            </div>
          </div>
        </div>

        {/* ── Section 3: الأمان ── */}
        <div className="section-divider"><span>{t('security')}</span></div>

        {/* Password */}
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: '#555', display: 'block', marginBottom: 3 }}>
            {t('passwordLabel')}{' '}
            <span style={{ fontSize: 10, color: '#bbb', fontWeight: 400 }}>{t('passwordHint')}</span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ paddingInlineStart: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', insetInlineStart: 10, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', alignItems: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#999' }}>
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>

        {/* Terms */}
        <label style={{
          background: '#f8faff', border: '0.5px solid #e8eef8', borderRadius: 8,
          padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={agreedTerms}
            onChange={(e) => setAgreedTerms(e.target.checked)}
            style={{ width: 16, height: 16, borderRadius: 4, accentColor: '#1a3a8f', cursor: 'pointer', flexShrink: 0 }}
          />
          <span style={{ fontSize: 10, color: '#777', lineHeight: 1.5 }}>
            {t('agreeToTerms')}{' '}
            <Link href="/terms" style={{ color: '#1a3a8f', textDecoration: 'none' }}>{t('termsAndConditions')}</Link>
            {' '}{t('and')}{' '}
            <Link href="/privacy" style={{ color: '#1a3a8f', textDecoration: 'none' }}>{t('privacyPolicy')}</Link>
          </span>
        </label>

        {error && (
          <div style={{
            background: '#fef2f2', border: '0.5px solid #fecaca', color: '#dc2626',
            padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 500,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !agreedTerms}
          style={{
            height: 42, background: '#1a3a8f', color: '#fff', borderRadius: 10,
            width: '100%', fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
            opacity: loading || !agreedTerms ? 0.6 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.2s', fontFamily: 'inherit',
          }}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>progress_activity</span>
              {t('creating')}
            </>
          ) : (
            <>
              {t('createFreeAccount')}
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>how_to_reg</span>
            </>
          )}
        </button>

        {/* Trust line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, color: '#bbb' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 12 }}>lock</span>
          {t('dataSecure')}
        </div>
      </form>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '12px 0' }}>
        <div style={{ height: 0.5, flex: 1, background: '#ebebeb' }} />
        <span style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>{t('or')}</span>
        <div style={{ height: 0.5, flex: 1, background: '#ebebeb' }} />
      </div>

      {/* Google Sign-In */}
      <GoogleSignInButton onError={setError} />

      <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 12, fontWeight: 500 }}>
        {t('hasAccount')}{' '}
        <Link href="/login" style={{ color: '#1a3a8f', fontWeight: 700, textDecoration: 'none' }}>
          {t('loginBtn')}
        </Link>
      </p>
    </div>
  );
}
