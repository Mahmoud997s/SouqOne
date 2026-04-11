'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { ImageUploader, type UploadedImage } from '@/features/ads/components/image-uploader';
import { useCreateTransport } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { API_BASE } from '@/lib/config';
import { getGovernorates, getCities, getCountries } from '@/lib/location-data';
import { inputCls, labelCls } from '@/lib/constants/form-styles';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const TRANSPORT_TYPES = [
  { value: 'CARGO', label: 'نقل بضائع' },
  { value: 'FURNITURE', label: 'نقل أثاث' },
  { value: 'DELIVERY', label: 'توصيل طرود' },
  { value: 'HEAVY_TRANSPORT', label: 'نقل ثقيل' },
  { value: 'TRUCK_RENTAL', label: 'تأجير شاحنات' },
  { value: 'OTHER_TRANSPORT', label: 'أخرى' },
];

const PRICING_TYPES = [
  { value: 'FIXED', label: 'سعر ثابت' },
  { value: 'PER_KM', label: 'لكل كم' },
  { value: 'PER_TRIP', label: 'لكل رحلة' },
  { value: 'HOURLY', label: 'بالساعة' },
  { value: 'NEGOTIABLE_PRICE', label: 'قابل للتفاوض' },
];

const PROVIDER_TYPES = [
  { value: 'INDIVIDUAL', label: 'فرد' },
  { value: 'COMPANY', label: 'شركة' },
];

export default function AddTransportPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4" dir="rtl"><div className="animate-pulse bg-surface-container-low h-96 rounded-xl" /></main></>}>
      <AddTransportContent />
    </Suspense>
  );
}

function AddTransportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const create = useCreateTransport();
  const { addToast } = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    transportType: initialType,
    vehicleType: '',
    vehicleCapacity: '',
    coverageAreas: [] as string[],
    pricingType: 'NEGOTIABLE_PRICE',
    basePrice: '',
    pricePerKm: '',
    hasInsurance: false,
    hasTracking: false,
    providerName: '',
    providerType: 'INDIVIDUAL',
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
    { label: 'التفاصيل والأسعار' },
    { label: 'الموقع والاتصال' },
  ];

  const canProceed = step === 0 ? !!form.transportType && !!form.title && !!form.providerName : step === 1 ? true : !!form.governorate;

  async function handleSubmit() {
    setErrorMessages([]);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        transportType: form.transportType,
        providerName: form.providerName,
        providerType: form.providerType,
        pricingType: form.pricingType,
        governorate: form.governorate,
        hasInsurance: form.hasInsurance,
        hasTracking: form.hasTracking,
      };
      if (form.vehicleType) payload.vehicleType = form.vehicleType;
      if (form.vehicleCapacity) payload.vehicleCapacity = form.vehicleCapacity;
      if (form.coverageAreas.length) payload.coverageAreas = form.coverageAreas;
      if (form.basePrice) payload.basePrice = parseFloat(form.basePrice);
      if (form.pricePerKm) payload.pricePerKm = parseFloat(form.pricePerKm);
      if (form.city) payload.city = form.city;
      if (form.latitude) payload.latitude = form.latitude;
      if (form.longitude) payload.longitude = form.longitude;
      if (form.contactPhone) payload.contactPhone = form.contactPhone;
      if (form.whatsapp) payload.whatsapp = form.whatsapp;

      const item = await create.mutateAsync(payload);

      if (images.length > 0) {
        const token = getAuthToken();
        for (const img of images) {
          if (img.file) {
            const fd = new FormData();
            fd.append('file', img.file);
            fd.append('isPrimary', String(img.isPrimary));
            await fetch(`${API_BASE}/api/v1/uploads/transport/${item.id}/images`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            });
          }
        }
      }

      addToast('success', 'تم نشر إعلان النقل بنجاح!');
      router.push(`/transport/${item.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      setErrorMessages(msg.split('\n').filter(Boolean));
    }
  }

  const isLoading = create.isPending;

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
          title="إضافة خدمة نقل"
        >
          {step === 0 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">نوع النقل *</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRANSPORT_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('transportType', t.value)}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.transportType === t.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-6">تحميل الصور</h2>
                <ImageUploader images={images} onChange={setImages} disabled={isLoading} />
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">بيانات مقدم الخدمة</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>عنوان الإعلان *</label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: خدمة نقل أثاث في مسقط" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>اسم المزود *</label>
                    <input type="text" value={form.providerName} onChange={e => set('providerName', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>نوع المزود</label>
                    <div className="flex gap-3">
                      {PROVIDER_TYPES.map(p => (
                        <button key={p.value} type="button" onClick={() => set('providerType', p.value)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${form.providerType === p.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                          {p.label}
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
                <h2 className="text-lg font-extrabold mb-4">التفاصيل</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>الوصف</label>
                    <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="صف خدمة النقل..." className={inputCls + ' resize-none'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>نوع المركبة</label>
                      <input type="text" value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)} placeholder="شاحنة، فان، بيك أب..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>سعة الحمولة</label>
                      <input type="text" value={form.vehicleCapacity} onChange={e => set('vehicleCapacity', e.target.value)} placeholder="3 طن" className={inputCls} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">التسعير</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>نوع التسعير</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRICING_TYPES.map(p => (
                        <button key={p.value} type="button" onClick={() => set('pricingType', p.value)}
                          className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.pricingType === p.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>السعر الأساسي (ر.ع.)</label>
                      <input type="number" step="0.01" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>سعر الكيلومتر (ر.ع.)</label>
                      <input type="number" step="0.001" value={form.pricePerKm} onChange={e => set('pricePerKm', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                      <input type="checkbox" checked={form.hasInsurance} onChange={e => set('hasInsurance', e.target.checked)} className="w-5 h-5 accent-primary" />
                      <span className="text-sm font-medium text-on-surface">تأمين على الشحنة</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                      <input type="checkbox" checked={form.hasTracking} onChange={e => set('hasTracking', e.target.checked)} className="w-5 h-5 accent-primary" />
                      <span className="text-sm font-medium text-on-surface">تتبع الشحنة</span>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">الموقع *</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>الدولة</label>
                    <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedGov(''); set('governorate', ''); set('city', ''); }} className={inputCls}>
                      <option value="">اختر</option>
                      {getCountries().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>المحافظة *</label>
                    <select value={selectedGov} onChange={e => { setSelectedGov(e.target.value); const g = governorateOptions.find(x => x.value === e.target.value); set('governorate', g?.label ?? ''); set('city', ''); }} className={inputCls}>
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
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">حدد الموقع على الخريطة</h2>
                <LocationPicker latitude={form.latitude} longitude={form.longitude} onChange={(lat, lng) => { set('latitude', lat); set('longitude', lng); }} />
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">بيانات الاتصال</h2>
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
