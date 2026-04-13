'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { useCreateJob } from '@/lib/api';
import { useToast } from '@/components/toast';
import { getGovernorates } from '@/lib/location-data';
import { employmentOptions } from '@/lib/constants/jobs';


const licenseOptions = [
  { value: 'LIGHT', label: 'رخصة خفيفة' },
  { value: 'HEAVY', label: 'رخصة ثقيلة' },
  { value: 'TRANSPORT', label: 'رخصة نقل' },
  { value: 'BUS', label: 'رخصة حافلات' },
  { value: 'MOTORCYCLE', label: 'رخصة دراجة' },
];

const salaryPeriodOptions = [
  { value: 'MONTHLY', label: 'شهرياً' },
  { value: 'DAILY', label: 'يومياً' },
  { value: 'YEARLY', label: 'سنوياً' },
  { value: 'NEGOTIABLE', label: 'قابل للتفاوض' },
];

const vehicleTypeOptions = [
  'سيدان', 'SUV', 'شاحنة خفيفة', 'شاحنة ثقيلة', 'باص', 'ليموزين', 'فان', 'بيك أب',
];

const languageOptions = ['العربية', 'الإنجليزية', 'الأوردو', 'الهندية', 'البنغالية', 'الفلبينية'];

export default function NewJobPage() {
  return (
    <AuthGuard>
      <NewJobContent />
    </AuthGuard>
  );
}

function NewJobContent() {
  const router = useRouter();
  const { addToast } = useToast();
  const createJob = useCreateJob();
  const govs = getGovernorates('OM');

  const [form, setForm] = useState({
    title: '',
    description: '',
    jobType: 'OFFERING' as 'OFFERING' | 'HIRING',
    employmentType: 'FULL_TIME',
    salary: '',
    salaryPeriod: 'MONTHLY',
    licenseTypes: [] as string[],
    experienceYears: '',
    minAge: '',
    maxAge: '',
    languages: [] as string[],
    nationality: '',
    vehicleTypes: [] as string[],
    hasOwnVehicle: false,
    governorate: '',
    city: '',
    contactPhone: '',
    contactEmail: '',
    whatsapp: '',
  });

  function updateField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem(key: 'licenseTypes' | 'languages' | 'vehicleTypes', value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description || !form.governorate) {
      addToast('error', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const payload: Record<string, any> = {
      title: form.title,
      description: form.description,
      jobType: form.jobType,
      employmentType: form.employmentType,
      governorate: form.governorate,
      licenseTypes: form.licenseTypes,
      languages: form.languages,
      vehicleTypes: form.vehicleTypes,
      hasOwnVehicle: form.hasOwnVehicle,
    };

    if (form.salary) payload.salary = Number(form.salary);
    if (form.salaryPeriod) payload.salaryPeriod = form.salaryPeriod;
    if (form.experienceYears) payload.experienceYears = Number(form.experienceYears);
    if (form.minAge) payload.minAge = Number(form.minAge);
    if (form.maxAge) payload.maxAge = Number(form.maxAge);
    if (form.nationality) payload.nationality = form.nationality;
    if (form.city) payload.city = form.city;
    if (form.contactPhone) payload.contactPhone = form.contactPhone;
    if (form.contactEmail) payload.contactEmail = form.contactEmail;
    if (form.whatsapp) payload.whatsapp = form.whatsapp;

    try {
      const result = await createJob.mutateAsync(payload);
      addToast('success', 'تم نشر إعلان الوظيفة بنجاح!');
      router.push(`/jobs/${result.id}`);
    } catch (err: any) {
      addToast('error', err?.message || 'فشل في إنشاء الإعلان');
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-3xl mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-extrabold mb-2">
          <span className="material-symbols-outlined text-primary align-middle text-3xl ml-2">add_circle</span>
          إعلان وظيفة جديد
        </h1>
        <p className="text-on-surface-variant mb-8">أضف إعلان وظيفة سائق أو اعرض خدماتك</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Type Toggle */}
          <div className="glass-card rounded-xl p-6">
            <label className="block font-bold text-sm mb-3">نوع الإعلان *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => updateField('jobType', 'OFFERING')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all border-2 ${
                  form.jobType === 'OFFERING'
                    ? 'border-brand-green bg-brand-green/10 text-brand-green'
                    : 'border-outline bg-surface text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined">person_search</span>
                أبحث عن عمل (سائق)
              </button>
              <button
                type="button"
                onClick={() => updateField('jobType', 'HIRING')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-sm transition-all border-2 ${
                  form.jobType === 'HIRING'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline bg-surface text-on-surface-variant'
                }`}
              >
                <span className="material-symbols-outlined">person_add</span>
                أبحث عن سائق (توظيف)
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              المعلومات الأساسية
            </h2>
            <div>
              <label className="block text-sm font-bold mb-1">العنوان *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder={form.jobType === 'OFFERING' ? 'مثال: سائق خبرة 5 سنوات يبحث عن عمل في مسقط' : 'مثال: مطلوب سائق خاص لعائلة في بوشر'}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
               
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">الوصف *</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="اكتب وصفاً تفصيلياً..."
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none min-h-[120px] resize-none"
               
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">نوع الدوام *</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => updateField('employmentType', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm"
                >
                  {employmentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">المحافظة *</label>
                <select
                  value={form.governorate}
                  onChange={(e) => updateField('governorate', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm"
                >
                  <option value="">اختر المحافظة</option>
                  {govs.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">المدينة</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="مثال: بوشر"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">الجنسية</label>
                <input
                  type="text"
                  value={form.nationality}
                  onChange={(e) => updateField('nationality', e.target.value)}
                  placeholder="مثال: عماني"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">payments</span>
              الراتب
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">الراتب (ر.ع.)</label>
                <input
                  type="number"
                  value={form.salary}
                  onChange={(e) => updateField('salary', e.target.value)}
                  placeholder="مثال: 300"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">فترة الراتب</label>
                <select
                  value={form.salaryPeriod}
                  onChange={(e) => updateField('salaryPeriod', e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm"
                >
                  {salaryPeriodOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">checklist</span>
              المتطلبات
            </h2>

            {/* License Types */}
            <div>
              <label className="block text-sm font-bold mb-2">نوع الرخصة</label>
              <div className="flex flex-wrap gap-2">
                {licenseOptions.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => toggleArrayItem('licenseTypes', o.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      form.licenseTypes.includes(o.value)
                        ? 'bg-primary text-on-primary shadow-ambient'
                        : 'bg-surface border border-outline text-on-surface hover:border-primary'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">سنوات الخبرة</label>
                <input
                  type="number"
                  value={form.experienceYears}
                  onChange={(e) => updateField('experienceYears', e.target.value)}
                  placeholder="مثال: 3"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                  min={0}
                  max={50}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">العمر الأدنى</label>
                <input
                  type="number"
                  value={form.minAge}
                  onChange={(e) => updateField('minAge', e.target.value)}
                  placeholder="مثال: 25"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                  min={18}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">العمر الأقصى</label>
                <input
                  type="number"
                  value={form.maxAge}
                  onChange={(e) => updateField('maxAge', e.target.value)}
                  placeholder="مثال: 45"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                  max={70}
                />
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-bold mb-2">اللغات</label>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleArrayItem('languages', lang)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      form.languages.includes(lang)
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface border border-outline text-on-surface hover:border-primary'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Types */}
            <div>
              <label className="block text-sm font-bold mb-2">أنواع المركبات</label>
              <div className="flex flex-wrap gap-2">
                {vehicleTypeOptions.map((vt) => (
                  <button
                    key={vt}
                    type="button"
                    onClick={() => toggleArrayItem('vehicleTypes', vt)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      form.vehicleTypes.includes(vt)
                        ? 'bg-primary text-on-primary shadow-ambient'
                        : 'bg-surface border border-outline text-on-surface hover:border-primary'
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>

            {/* Has own vehicle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.hasOwnVehicle}
                onChange={(e) => updateField('hasOwnVehicle', e.target.checked)}
                className="w-5 h-5 rounded accent-primary"
              />
              <span className="text-sm font-bold">لديه/لديك سيارة خاصة</span>
            </label>
          </div>

          {/* Contact */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_phone</span>
              معلومات التواصل
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">رقم الهاتف</label>
                <input
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="مثال: +968 9XXX XXXX"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">واتساب</label>
                <input
                  type="tel"
                  value={form.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  placeholder="مثال: +968 9XXX XXXX"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="example@email.com"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createJob.isPending}
              className="bg-primary text-on-primary hover:brightness-110 rounded-lg shadow-ambient flex-1 py-4 text-base font-bold disabled:opacity-50"
            >
              {createJob.isPending ? 'جاري النشر...' : 'نشر الإعلان'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-surface border border-outline text-on-surface-variant rounded-lg px-8 py-4 font-bold hover:border-primary transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
