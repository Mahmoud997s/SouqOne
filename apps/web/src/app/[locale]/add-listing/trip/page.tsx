'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { useCreateTrip } from '@/lib/api';
import { useToast } from '@/components/toast';
import { getGovernorates, getCities, getCountries } from '@/lib/location-data';
import { inputCls, labelCls } from '@/lib/constants/form-styles';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const TRIP_TYPES = [
  { value: 'BUS_SUBSCRIPTION', label: 'اشتراكات باصات' },
  { value: 'SCHOOL_TRANSPORT', label: 'توصيل مدارس' },
  { value: 'TOURISM', label: 'رحلات سياحية' },
  { value: 'CORPORATE', label: 'توصيل موظفين' },
  { value: 'CARPOOLING', label: 'مشاركة رحلات' },
  { value: 'OTHER_TRIP', label: 'أخرى' },
];

const SCHEDULE_TYPES = [
  { value: 'SCHEDULE_DAILY', label: 'يومي' },
  { value: 'SCHEDULE_WEEKLY', label: 'أسبوعي' },
  { value: 'SCHEDULE_MONTHLY', label: 'شهري' },
  { value: 'ONE_TIME', label: 'مرة واحدة' },
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

export default function AddTripPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4"><div className="animate-pulse bg-surface-container-low h-96 rounded-xl" /></main></>}>
      <AddTripContent />
    </Suspense>
  );
}

function AddTripContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const create = useCreateTrip();
  const { addToast } = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    title: '',
    description: '',
    tripType: initialType,
    routeFrom: '',
    routeTo: '',
    routeStops: [] as string[],
    newStop: '',
    scheduleType: 'SCHEDULE_DAILY',
    departureTimes: ['07:00'] as string[],
    operatingDays: ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU'] as string[],
    pricePerTrip: '',
    priceMonthly: '',
    vehicleType: '',
    capacity: '',
    availableSeats: '',
    features: [] as string[],
    providerName: '',
    governorate: '',
    city: '',
    latitude: null as number | null,
    longitude: null as number | null,
    contactPhone: '',
    whatsapp: '',
    startDate: '',
    endDate: '',
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
    { label: 'المسار والجدول' },
    { label: 'الأسعار والاتصال' },
  ];

  const canProceed = step === 0 ? !!form.tripType && !!form.title && !!form.providerName : step === 1 ? !!form.routeFrom && !!form.routeTo : true;

  async function handleSubmit() {
    setErrorMessages([]);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        tripType: form.tripType,
        routeFrom: form.routeFrom,
        routeTo: form.routeTo,
        scheduleType: form.scheduleType,
        providerName: form.providerName,
        governorate: form.governorate,
        operatingDays: form.operatingDays,
        departureTimes: form.departureTimes,
      };
      if (form.routeStops.length) payload.routeStops = form.routeStops;
      if (form.pricePerTrip) payload.pricePerTrip = parseFloat(form.pricePerTrip);
      if (form.priceMonthly) payload.priceMonthly = parseFloat(form.priceMonthly);
      if (form.vehicleType) payload.vehicleType = form.vehicleType;
      if (form.capacity) payload.capacity = parseInt(form.capacity);
      if (form.availableSeats) payload.availableSeats = parseInt(form.availableSeats);
      if (form.features.length) payload.features = form.features;
      if (form.city) payload.city = form.city;
      if (form.latitude) payload.latitude = form.latitude;
      if (form.longitude) payload.longitude = form.longitude;
      if (form.contactPhone) payload.contactPhone = form.contactPhone;
      if (form.whatsapp) payload.whatsapp = form.whatsapp;
      if (form.startDate) payload.startDate = form.startDate;
      if (form.endDate) payload.endDate = form.endDate;

      const item = await create.mutateAsync(payload);
      addToast('success', 'تم نشر إعلان الرحلة بنجاح!');
      router.push(`/trips/${item.id}`);
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
          title="إضافة رحلة / اشتراك"
        >
          {step === 0 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">نوع الرحلة *</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRIP_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('tripType', t.value)}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.tripType === t.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">بيانات مقدم الخدمة</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>عنوان الإعلان *</label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="مثال: رحلة يومية مسقط - صلالة" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>اسم المزود *</label>
                    <input type="text" value={form.providerName} onChange={e => set('providerName', e.target.value)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>نوع المركبة</label>
                      <input type="text" value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)} placeholder="باص، ميني باص..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>السعة (مقعد)</label>
                      <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="30" className={inputCls} />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">المسار *</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>من *</label>
                      <input type="text" value={form.routeFrom} onChange={e => set('routeFrom', e.target.value)} placeholder="مسقط" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>إلى *</label>
                      <input type="text" value={form.routeTo} onChange={e => set('routeTo', e.target.value)} placeholder="صلالة" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>محطات التوقف</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.newStop} onChange={e => set('newStop', e.target.value)} placeholder="أضف محطة" className={inputCls}
                        onKeyDown={e => { if (e.key === 'Enter' && form.newStop.trim()) { e.preventDefault(); set('routeStops', [...form.routeStops, form.newStop.trim()]); set('newStop', ''); } }} />
                      <button type="button" onClick={() => { if (form.newStop.trim()) { set('routeStops', [...form.routeStops, form.newStop.trim()]); set('newStop', ''); } }}
                        className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shrink-0">+</button>
                    </div>
                    {form.routeStops.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {form.routeStops.map((s, i) => (
                          <span key={i} className="bg-surface-container-low px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                            {s}
                            <button type="button" onClick={() => set('routeStops', form.routeStops.filter((_, idx) => idx !== i))} className="text-on-surface-variant hover:text-error">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">الجدول الزمني</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>نوع الجدول</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SCHEDULE_TYPES.map(s => (
                        <button key={s.value} type="button" onClick={() => set('scheduleType', s.value)}
                          className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.scheduleType === s.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>أيام التشغيل</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(d => (
                        <button key={d.value} type="button" onClick={() => set('operatingDays', form.operatingDays.includes(d.value) ? form.operatingDays.filter(x => x !== d.value) : [...form.operatingDays, d.value])}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${form.operatingDays.includes(d.value) ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant hover:border-primary'}`}>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>تاريخ البداية</label>
                      <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>تاريخ النهاية</label>
                      <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>الوصف</label>
                    <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="تفاصيل إضافية عن الرحلة..." className={inputCls + ' resize-none'} />
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">الأسعار</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>سعر الرحلة (ر.ع.)</label>
                    <input type="number" step="0.01" value={form.pricePerTrip} onChange={e => set('pricePerTrip', e.target.value)} placeholder="5.000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>الاشتراك الشهري (ر.ع.)</label>
                    <input type="number" step="0.01" value={form.priceMonthly} onChange={e => set('priceMonthly', e.target.value)} placeholder="50.000" className={inputCls} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelCls}>المقاعد المتاحة</label>
                  <input type="number" value={form.availableSeats} onChange={e => set('availableSeats', e.target.value)} placeholder="20" className={inputCls} />
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
