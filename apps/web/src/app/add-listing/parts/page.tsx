'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { ImageUploader, type UploadedImage } from '@/features/ads/components/image-uploader';
import { useCreatePart, useBrands } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { API_BASE } from '@/lib/config';
import { getGovernorates, getCities, getCountries } from '@/lib/location-data';
import { inputCls, labelCls } from '@/lib/constants/form-styles';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const PART_CATEGORIES = [
  { value: 'ENGINE', label: 'محرك' },
  { value: 'BODY', label: 'هيكل' },
  { value: 'ELECTRICAL', label: 'كهرباء' },
  { value: 'SUSPENSION', label: 'تعليق' },
  { value: 'BRAKES', label: 'فرامل' },
  { value: 'INTERIOR', label: 'داخلية' },
  { value: 'TIRES', label: 'إطارات' },
  { value: 'BATTERIES', label: 'بطاريات' },
  { value: 'OILS', label: 'زيوت' },
  { value: 'ACCESSORIES', label: 'إكسسوارات' },
  { value: 'OTHER', label: 'أخرى' },
];

const PART_CONDITIONS = [
  { value: 'NEW', label: 'جديد' },
  { value: 'USED', label: 'مستعمل' },
  { value: 'REFURBISHED', label: 'مجدد' },
];

export default function AddPartPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4" dir="rtl"><div className="animate-pulse bg-surface-container-low h-96 rounded-3xl" /></main></>}>
      <AddPartContent />
    </Suspense>
  );
}

function AddPartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || '';
  const createPart = useCreatePart();
  const { addToast } = useToast();
  const { data: brands = [] } = useBrands();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    partCategory: initialCat,
    condition: 'USED',
    partNumber: '',
    compatibleMakes: [] as string[],
    compatibleModels: [] as string[],
    yearFrom: '',
    yearTo: '',
    isOriginal: false,
    price: '',
    isPriceNegotiable: false,
    governorate: '',
    city: '',
    latitude: null as number | null,
    longitude: null as number | null,
    contactPhone: '',
    whatsapp: '',
  });

  const [selectedCountry, setSelectedCountry] = useState('OM');
  const [selectedGov, setSelectedGov] = useState('');
  const governorateOptions = getGovernorates(selectedCountry);
  const cityOptions = getCities(selectedCountry, selectedGov);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const steps = [
    { label: 'البيانات الأساسية' },
    { label: 'تفاصيل القطعة' },
    { label: 'السعر والموقع' },
  ];

  const canProceed = step === 0
    ? !!form.partCategory && !!form.title
    : step === 1
      ? true
      : !!form.price;

  async function handleSubmit() {
    setErrorMessages([]);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        partCategory: form.partCategory,
        condition: form.condition,
        price: parseFloat(form.price),
        isPriceNegotiable: form.isPriceNegotiable,
      };
      if (form.partNumber) payload.partNumber = form.partNumber;
      if (form.compatibleMakes.length) payload.compatibleMakes = form.compatibleMakes;
      if (form.compatibleModels.length) payload.compatibleModels = form.compatibleModels;
      if (form.yearFrom) payload.yearFrom = parseInt(form.yearFrom);
      if (form.yearTo) payload.yearTo = parseInt(form.yearTo);
      if (form.isOriginal) payload.isOriginal = true;
      if (form.governorate) payload.governorate = form.governorate;
      if (form.city) payload.city = form.city;
      if (form.latitude) payload.latitude = form.latitude;
      if (form.longitude) payload.longitude = form.longitude;
      if (form.contactPhone) payload.contactPhone = form.contactPhone;
      if (form.whatsapp) payload.whatsapp = form.whatsapp;

      const part = await createPart.mutateAsync(payload);

      if (images.length > 0) {
        const token = getAuthToken();
        for (const img of images) {
          if (img.file) {
            const fd = new FormData();
            fd.append('file', img.file);
            fd.append('isPrimary', String(img.isPrimary));
            await fetch(`${API_BASE}/api/uploads/parts/${part.id}/images`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            });
          }
        }
      }

      addToast('success', 'تم نشر إعلان القطعة بنجاح!');
      router.push(`/parts/${part.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      setErrorMessages(msg.split('\n').filter(Boolean));
    }
  }

  const isLoading = createPart.isPending;

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8" dir="rtl">
        <MultiStepForm
          steps={steps}
          currentStep={step}
          onNext={() => setStep(s => Math.min(s + 1, 2))}
          onBack={() => setStep(s => Math.max(s - 1, 0))}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="نشر الإعلان"
          canProceed={canProceed}
          title="إضافة قطعة غيار"
        >
          {step === 0 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">القسم</h2>
                <div className="flex items-center gap-3 bg-surface-container-lowest rounded-lg px-4 py-3 mb-4 border border-outline-variant/10">
                  <span className="text-primary text-lg">🔩</span>
                  <span className="text-sm text-on-surface-variant">عربيات وقطع غيار</span>
                  <span className="text-on-surface-variant/40 mx-1">›</span>
                  <span className="text-sm font-bold text-on-surface">قطع غيار</span>
                </div>
                <label className={labelCls}>نوع القطعة *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PART_CATEGORIES.map(c => (
                    <button key={c.value} type="button" onClick={() => set('partCategory', c.value)}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.partCategory === c.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-6">تحميل الصور</h2>
                <ImageUploader images={images} onChange={setImages} disabled={isLoading} />
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">البيانات الأساسية</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>عنوان الإعلان *</label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: فلتر هواء تويوتا كامري" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>الحالة *</label>
                    <div className="flex gap-3">
                      {PART_CONDITIONS.map(c => (
                        <button key={c.value} type="button" onClick={() => set('condition', c.value)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${form.condition === c.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">تفاصيل القطعة</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>رقم القطعة OEM</label>
                    <input type="text" value={form.partNumber} onChange={e => set('partNumber', e.target.value)} placeholder="اختياري" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>الماركات المتوافقة</label>
                    <select multiple value={form.compatibleMakes} onChange={e => set('compatibleMakes', Array.from(e.target.selectedOptions, o => o.value))} className={inputCls + ' h-28'}>
                      {brands.map(b => <option key={b.id} value={b.name}>{b.nameAr || b.name}</option>)}
                    </select>
                    <p className="text-[11px] text-on-surface-variant mt-1">اضغط Ctrl للاختيار المتعدد</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>من سنة</label>
                      <input type="number" value={form.yearFrom} onChange={e => set('yearFrom', e.target.value)} placeholder="2015" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>إلى سنة</label>
                      <input type="number" value={form.yearTo} onChange={e => set('yearTo', e.target.value)} placeholder="2023" className={inputCls} />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.isOriginal} onChange={e => set('isOriginal', e.target.checked)} className="w-5 h-5 accent-primary" />
                    <span className="text-sm font-medium text-on-surface">قطعة أصلية (OEM)</span>
                  </label>
                  <div>
                    <label className={labelCls}>الوصف</label>
                    <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="صف القطعة بالتفصيل..." className={inputCls + ' resize-none'} />
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">السعر</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>السعر (ر.ع.) *</label>
                    <input type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.000" className={inputCls} />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.isPriceNegotiable} onChange={e => set('isPriceNegotiable', e.target.checked)} className="w-5 h-5 accent-primary" />
                    <span className="text-sm font-medium text-on-surface">السعر قابل للتفاوض</span>
                  </label>
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">الموقع والاتصال</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>الدولة</label>
                      <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedGov(''); set('governorate', ''); set('city', ''); }} className={inputCls}>
                        <option value="">اختر</option>
                        {getCountries().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>المحافظة</label>
                      <select value={selectedGov} onChange={e => { setSelectedGov(e.target.value); const g = governorateOptions.find(x => x.value === e.target.value); set('governorate', g?.label ?? ''); set('city', ''); }} className={inputCls} disabled={!selectedCountry}>
                        <option value="">اختر</option>
                        {governorateOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>المدينة</label>
                      <select value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} disabled={!selectedGov}>
                        <option value="">اختر</option>
                        {cityOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>حدد الموقع على الخريطة (اختياري)</label>
                    <LocationPicker latitude={form.latitude} longitude={form.longitude} onChange={(lat, lng) => { set('latitude', lat); set('longitude', lng); }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>رقم الهاتف</label>
                      <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+968..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>واتساب</label>
                      <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+968..." className={inputCls} />
                    </div>
                  </div>
                </div>
              </section>

              {errorMessages.length > 0 && <FormErrorOverlay messages={errorMessages} onClose={() => setErrorMessages([])} />}
            </div>
          )}
        </MultiStepForm>
      </main>
      <Footer />
    </AuthGuard>
  );
}
