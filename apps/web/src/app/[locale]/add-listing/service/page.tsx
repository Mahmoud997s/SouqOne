'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { ImageUploader, type UploadedImage } from '@/features/ads/components/image-uploader';
import { useCreateCarService } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { API_BASE } from '@/lib/config';
import { getGovernorates, getCities, getCountries } from '@/lib/location-data';
import { inputCls, labelCls, sectionCls, sectionTitleCls, chipCls } from '@/lib/constants/form-styles';
import { FormErrorOverlay } from '@/components/form-error-overlay';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const SERVICE_TYPES = [
  { value: 'MAINTENANCE', label: 'صيانة وإصلاح' },
  { value: 'CLEANING', label: 'تلميع وتنظيف' },
  { value: 'MODIFICATION', label: 'تعديل وتيونينج' },
  { value: 'INSPECTION', label: 'فحص سيارات' },
  { value: 'BODYWORK', label: 'سمكرة ودهان' },
  { value: 'ACCESSORIES_INSTALL', label: 'تركيب إكسسوارات' },
  { value: 'KEYS_LOCKS', label: 'مفاتيح وأقفال' },
  { value: 'TOWING', label: 'سطحة ونجدة' },
  { value: 'OTHER_SERVICE', label: 'أخرى' },
];

const PROVIDER_TYPES = [
  { value: 'WORKSHOP', label: 'ورشة' },
  { value: 'INDIVIDUAL', label: 'فرد' },
  { value: 'MOBILE', label: 'خدمة متنقلة' },
  { value: 'COMPANY', label: 'شركة' },
];

const DAYS = [
  { value: 'SAT', label: 'السبت' },
  { value: 'SUN', label: 'الأحد' },
  { value: 'MON', label: 'الإثنين' },
  { value: 'TUE', label: 'الثلاثاء' },
  { value: 'WED', label: 'الأربعاء' },
  { value: 'THU', label: 'الخميس' },
  { value: 'FRI', label: 'الجمعة' },
];

export default function AddServicePage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4"><div className="animate-pulse bg-surface-container-low h-96 rounded-3xl" /></main></>}>
      <AddServiceContent />
    </Suspense>
  );
}

function AddServiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const create = useCreateCarService();
  const { addToast } = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    serviceType: initialType,
    providerType: 'WORKSHOP',
    providerName: '',
    specializations: [] as string[],
    priceFrom: '',
    priceTo: '',
    isHomeService: false,
    workingHoursOpen: '08:00',
    workingHoursClose: '20:00',
    workingDays: ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU'] as string[],
    governorate: '',
    city: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    contactPhone: '',
    whatsapp: '',
    website: '',
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
    { label: 'التفاصيل والمواعيد' },
    { label: 'الموقع والاتصال' },
  ];

  const canProceed = step === 0 ? !!form.serviceType && !!form.title && !!form.providerName : step === 1 ? true : !!form.governorate;

  async function handleSubmit() {
    setErrorMessages([]);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        serviceType: form.serviceType,
        providerType: form.providerType,
        providerName: form.providerName,
        governorate: form.governorate,
        isHomeService: form.isHomeService,
        workingDays: form.workingDays,
      };
      if (form.specializations.length) payload.specializations = form.specializations;
      if (form.priceFrom) payload.priceFrom = parseFloat(form.priceFrom);
      if (form.priceTo) payload.priceTo = parseFloat(form.priceTo);
      if (form.workingHoursOpen) payload.workingHoursOpen = form.workingHoursOpen;
      if (form.workingHoursClose) payload.workingHoursClose = form.workingHoursClose;
      if (form.city) payload.city = form.city;
      if (form.address) payload.address = form.address;
      if (form.latitude) payload.latitude = form.latitude;
      if (form.longitude) payload.longitude = form.longitude;
      if (form.contactPhone) payload.contactPhone = form.contactPhone;
      if (form.whatsapp) payload.whatsapp = form.whatsapp;
      if (form.website) payload.website = form.website;

      const svc = await create.mutateAsync(payload);

      if (images.length > 0) {
        const token = getAuthToken();
        for (const img of images) {
          if (img.file) {
            const fd = new FormData();
            fd.append('file', img.file);
            fd.append('isPrimary', String(img.isPrimary));
            await fetch(`${API_BASE}/api/v1/uploads/services/${svc.id}/images`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            });
          }
        }
      }

      addToast('success', 'تم نشر إعلان الخدمة بنجاح!');
      router.push(`/services/${svc.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      setErrorMessages(msg.split('\n').filter(Boolean));
    }
  }

  const isLoading = create.isPending;

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8">
        <MultiStepForm
          steps={steps}
          currentStep={step}
          onNext={() => setStep(s => Math.min(s + 1, 2))}
          onBack={() => setStep(s => Math.max(s - 1, 0))}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="نشر الإعلان"
          canProceed={canProceed}
          title="إضافة خدمة سيارات"
        >
          {step === 0 && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">handyman</span>نوع الخدمة *</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SERVICE_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('serviceType', t.value)}
                      className={chipCls(form.serviceType === t.value)}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">add_photo_alternate</span>تحميل الصور</h2>
                <ImageUploader images={images} onChange={setImages} disabled={isLoading} />
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">storefront</span>بيانات مقدم الخدمة</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>عنوان الإعلان *</label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: ورشة الخليج لصيانة السيارات" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>اسم المزود *</label>
                    <input type="text" value={form.providerName} onChange={e => set('providerName', e.target.value)} placeholder="اسم الورشة أو الفني" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>نوع المزود *</label>
                    <div className="flex gap-3 flex-wrap">
                      {PROVIDER_TYPES.map(p => (
                        <button key={p.value} type="button" onClick={() => set('providerType', p.value)}
                          className={chipCls(form.providerType === p.value) + ' px-4'}>
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
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">description</span>التفاصيل</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>الوصف</label>
                    <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="صف الخدمة بالتفصيل..." className={inputCls + ' resize-none'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>السعر من (ر.ع.)</label>
                      <input type="number" step="0.01" value={form.priceFrom} onChange={e => set('priceFrom', e.target.value)} placeholder="5.000" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>السعر إلى (ر.ع.)</label>
                      <input type="number" step="0.01" value={form.priceTo} onChange={e => set('priceTo', e.target.value)} placeholder="50.000" className={inputCls} />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={form.isHomeService} onChange={e => set('isHomeService', e.target.checked)} className="w-5 h-5 accent-primary" />
                    <span className="text-sm font-medium text-on-surface">خدمة متنقلة (يجي لعندك)</span>
                  </label>
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">schedule</span>أوقات العمل</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>من الساعة</label>
                      <input type="time" value={form.workingHoursOpen} onChange={e => set('workingHoursOpen', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>إلى الساعة</label>
                      <input type="time" value={form.workingHoursClose} onChange={e => set('workingHoursClose', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>أيام العمل</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(d => (
                        <button key={d.value} type="button" onClick={() => set('workingDays', form.workingDays.includes(d.value) ? form.workingDays.filter(x => x !== d.value) : [...form.workingDays, d.value])}
                          className={chipCls(form.workingDays.includes(d.value)) + ' px-3 text-xs'}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">location_on</span>الموقع *</h2>
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
                  <div>
                    <label className={labelCls}>العنوان التفصيلي</label>
                    <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="الشارع، المبنى..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>حدد الموقع على الخريطة</label>
                    <LocationPicker latitude={form.latitude} longitude={form.longitude} onChange={(lat, lng) => { set('latitude', lat); set('longitude', lng); }} />
                  </div>
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">contact_phone</span>بيانات الاتصال</h2>
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
                <div className="mt-4">
                  <label className={labelCls}>الموقع الإلكتروني</label>
                  <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." className={inputCls} />
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
