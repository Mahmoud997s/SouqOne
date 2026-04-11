'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { ImageUploader, type UploadedImage } from '@/features/ads/components/image-uploader';
import { useCreateBusListing } from '@/lib/api/buses';
import { getAuthToken } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { API_BASE } from '@/lib/config';
import { getGovernorates, getCities, getCountries } from '@/lib/location-data';
import { inputCls, labelCls, sectionCls, sectionTitleCls, chipCls } from '@/lib/constants/form-styles';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const BUS_LISTING_TYPES = [
  { value: 'BUS_SALE', label: 'بيع حافلة', icon: 'sell', desc: 'بيع بدون عقد' },
  { value: 'BUS_SALE_WITH_CONTRACT', label: 'بيع مع عقد', icon: 'assignment', desc: 'حافلة مع عقد جاهز' },
  { value: 'BUS_RENT', label: 'تأجير حافلة', icon: 'car_rental', desc: 'تأجير يومي أو شهري' },
  { value: 'BUS_CONTRACT', label: 'طلب عقد نقل', icon: 'request_quote', desc: 'شركة تطلب خدمة نقل' },
];

const BUS_TYPES = [
  { value: 'MINI_BUS', label: 'ميني باص', desc: '7-15 راكب' },
  { value: 'MEDIUM_BUS', label: 'باص متوسط', desc: '16-30 راكب' },
  { value: 'LARGE_BUS', label: 'باص كبير', desc: '31-50+ راكب' },
  { value: 'COASTER', label: 'كوستر', desc: '20-30 راكب' },
  { value: 'SCHOOL_BUS', label: 'باص مدرسة', desc: 'نقل طلاب' },
];

const CONTRACT_TYPES = [
  { value: 'SCHOOL', label: 'مدرسة' },
  { value: 'COMPANY', label: 'شركة' },
  { value: 'GOVERNMENT', label: 'حكومي' },
  { value: 'TOURISM', label: 'سياحة' },
  { value: 'OTHER_CONTRACT', label: 'أخرى' },
];

const FUEL_TYPES = [
  { value: 'DIESEL', label: 'ديزل' },
  { value: 'PETROL', label: 'بنزين' },
  { value: 'HYBRID', label: 'هايبرد' },
  { value: 'ELECTRIC', label: 'كهربائي' },
];

const CONDITIONS = [
  { value: 'NEW', label: 'جديد' },
  { value: 'LIKE_NEW', label: 'شبه جديد' },
  { value: 'USED', label: 'مستعمل' },
  { value: 'GOOD', label: 'جيد' },
  { value: 'FAIR', label: 'مقبول' },
];

const BUS_FEATURES = [
  'تكييف', 'واي فاي', 'شاشات', 'USB شحن', 'مقاعد جلد', 'حزام أمان',
  'كاميرا مراقبة', 'GPS', 'رف أمتعة', 'باب هيدروليك', 'ثلاجة', 'ميكروفون',
];

export default function AddBusPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4" dir="rtl"><div className="animate-pulse bg-surface-container-low h-96 rounded-3xl" /></main></>}>
      <AddBusContent />
    </Suspense>
  );
}

function AddBusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const createBus = useCreateBusListing();
  const { addToast } = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    busListingType: initialType,
    busType: '',
    title: '',
    description: '',
    make: '',
    model: '',
    year: '',
    capacity: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    condition: 'USED',
    features: [] as string[],
    plateNumber: '',
    // sale
    price: '',
    isPriceNegotiable: false,
    // contract
    contractType: '',
    contractClient: '',
    contractMonthly: '',
    contractDuration: '',
    contractExpiry: '',
    // rental
    dailyPrice: '',
    monthlyPrice: '',
    minRentalDays: '',
    withDriver: false,
    deliveryAvailable: false,
    // contract request
    requestPassengers: '',
    requestRoute: '',
    requestSchedule: '',
    // location
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

  const isContract = form.busListingType === 'BUS_CONTRACT';
  const isSale = form.busListingType === 'BUS_SALE' || form.busListingType === 'BUS_SALE_WITH_CONTRACT';
  const isRent = form.busListingType === 'BUS_RENT';
  const hasContract = form.busListingType === 'BUS_SALE_WITH_CONTRACT';

  const steps = isContract
    ? [{ label: 'نوع الطلب' }, { label: 'تفاصيل الطلب' }, { label: 'الموقع والتواصل' }]
    : [{ label: 'نوع الإعلان' }, { label: 'بيانات الحافلة' }, { label: 'السعر والتفاصيل' }, { label: 'الموقع والصور' }];

  const maxStep = steps.length - 1;

  const canProceed =
    step === 0 ? !!form.busListingType && (isContract || !!form.busType) :
    step === 1 ? (isContract ? !!form.title && !!form.requestPassengers : !!form.title && !!form.make && !!form.year && !!form.capacity) :
    step === 2 ? (isContract ? true : (isSale ? !!form.price : isRent ? (!!form.dailyPrice || !!form.monthlyPrice) : true)) :
    true;

  async function handleSubmit() {
    setErrorMessages([]);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description || form.title,
        busListingType: form.busListingType,
        busType: form.busType || 'MEDIUM_BUS',
        make: form.make || 'غير محدد',
        model: form.model || 'غير محدد',
        year: parseInt(form.year) || new Date().getFullYear(),
        capacity: parseInt(form.capacity) || 30,
      };

      if (form.mileage) payload.mileage = parseInt(form.mileage);
      if (form.fuelType) payload.fuelType = form.fuelType;
      if (form.transmission) payload.transmission = form.transmission;
      if (form.condition) payload.condition = form.condition;
      if (form.features.length) payload.features = form.features;
      if (form.plateNumber) payload.plateNumber = form.plateNumber;

      // Sale fields
      if (form.price) payload.price = parseFloat(form.price);
      payload.isPriceNegotiable = form.isPriceNegotiable;

      // Contract fields
      if (form.contractType) payload.contractType = form.contractType;
      if (form.contractClient) payload.contractClient = form.contractClient;
      if (form.contractMonthly) payload.contractMonthly = parseFloat(form.contractMonthly);
      if (form.contractDuration) payload.contractDuration = parseInt(form.contractDuration);
      if (form.contractExpiry) payload.contractExpiry = form.contractExpiry;

      // Rental fields
      if (form.dailyPrice) payload.dailyPrice = parseFloat(form.dailyPrice);
      if (form.monthlyPrice) payload.monthlyPrice = parseFloat(form.monthlyPrice);
      if (form.minRentalDays) payload.minRentalDays = parseInt(form.minRentalDays);
      payload.withDriver = form.withDriver;
      payload.deliveryAvailable = form.deliveryAvailable;

      // Contract request
      if (form.requestPassengers) payload.requestPassengers = parseInt(form.requestPassengers);
      if (form.requestRoute) payload.requestRoute = form.requestRoute;
      if (form.requestSchedule) payload.requestSchedule = form.requestSchedule;

      // Location
      if (form.governorate) payload.governorate = form.governorate;
      if (form.city) payload.city = form.city;
      if (form.latitude) payload.latitude = form.latitude;
      if (form.longitude) payload.longitude = form.longitude;
      if (form.contactPhone) payload.contactPhone = form.contactPhone;
      if (form.whatsapp) payload.whatsapp = form.whatsapp;

      const bus = await createBus.mutateAsync(payload);

      // Upload images
      if (images.length > 0) {
        const token = getAuthToken();
        for (const img of images) {
          if (img.file) {
            const fd = new FormData();
            fd.append('file', img.file);
            fd.append('isPrimary', String(img.isPrimary));
            await fetch(`${API_BASE}/api/v1/uploads/buses/${bus.id}/images`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            });
          }
        }
      }

      addToast('success', 'تم نشر إعلان الحافلة بنجاح!');
      router.push(`/buses/${bus.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ';
      setErrorMessages(msg.split('\n').filter(Boolean));
    }
  }

  const isLoading = createBus.isPending;

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8" dir="rtl">
        <MultiStepForm
          steps={steps}
          currentStep={step}
          onNext={() => { setStep(s => Math.min(s + 1, maxStep)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onBack={() => { setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel="نشر الإعلان"
          canProceed={canProceed}
          title="إضافة إعلان حافلة"
        >
          {/* ── Step 0: Listing Type ── */}
          {step === 0 && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">category</span>نوع الإعلان *</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BUS_LISTING_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('busListingType', t.value)}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-right ${form.busListingType === t.value ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-outline-variant/20 hover:border-outline-variant/40'}`}>
                      <span className={`material-symbols-outlined text-2xl mt-0.5 ${form.busListingType === t.value ? 'text-primary' : 'text-on-surface-variant'}`}>{t.icon}</span>
                      <div>
                        <p className="font-black text-on-surface text-sm">{t.label}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {!isContract && form.busListingType && (
                <section className={sectionCls}>
                  <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">directions_bus</span>نوع الحافلة *</h2>
                  <div className="flex flex-wrap gap-2">
                    {BUS_TYPES.map(b => (
                      <button key={b.value} type="button" onClick={() => set('busType', b.value)}
                        className={chipCls(form.busType === b.value)}>
                        {b.label} <span className="text-[10px] opacity-60">({b.desc})</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ── Step 1: Bus Details / Contract Request Details ── */}
          {step === 1 && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">edit</span>البيانات الأساسية</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>عنوان الإعلان *</label>
                    <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder={isContract ? 'مثال: مطلوب نقل موظفين يومياً' : 'مثال: باص هينو 50 راكب 2020'} />
                  </div>
                  <div>
                    <label className={labelCls}>الوصف</label>
                    <textarea className={inputCls + ' min-h-[100px]'} rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="وصف تفصيلي..." />
                  </div>
                </div>
              </section>

              {isContract ? (
                <section className={sectionCls}>
                  <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">request_quote</span>تفاصيل الطلب</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>عدد الركاب *</label>
                      <input type="number" className={inputCls} value={form.requestPassengers} onChange={e => set('requestPassengers', e.target.value)} placeholder="30" />
                    </div>
                    <div>
                      <label className={labelCls}>الجدول</label>
                      <select className={inputCls} value={form.requestSchedule} onChange={e => set('requestSchedule', e.target.value)}>
                        <option value="">اختر</option>
                        <option value="يومي">يومي</option>
                        <option value="أسبوعي">أسبوعي</option>
                        <option value="شهري">شهري</option>
                        <option value="رحلة واحدة">رحلة واحدة</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>المسار</label>
                      <input className={inputCls} value={form.requestRoute} onChange={e => set('requestRoute', e.target.value)} placeholder="مثال: مسقط - صحار يومياً" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>نوع العقد</label>
                      <div className="flex flex-wrap gap-2">
                        {CONTRACT_TYPES.map(c => (
                          <button key={c.value} type="button" onClick={() => set('contractType', c.value)}
                            className={chipCls(form.contractType === c.value)}>{c.label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>الميزانية الشهرية (ر.ع.)</label>
                      <input type="number" className={inputCls} value={form.price} onChange={e => set('price', e.target.value)} placeholder="اختياري" />
                    </div>
                  </div>
                </section>
              ) : (
                <>
                  <section className={sectionCls}>
                    <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">directions_bus</span>بيانات الحافلة</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>الماركة *</label>
                        <input className={inputCls} value={form.make} onChange={e => set('make', e.target.value)} placeholder="مثال: هينو، ميتسوبيشي، تويوتا" />
                      </div>
                      <div>
                        <label className={labelCls}>الموديل</label>
                        <input className={inputCls} value={form.model} onChange={e => set('model', e.target.value)} placeholder="مثال: Rosa, Coaster" />
                      </div>
                      <div>
                        <label className={labelCls}>سنة الصنع *</label>
                        <input type="number" className={inputCls} value={form.year} onChange={e => set('year', e.target.value)} placeholder="2020" />
                      </div>
                      <div>
                        <label className={labelCls}>عدد الركاب *</label>
                        <input type="number" className={inputCls} value={form.capacity} onChange={e => set('capacity', e.target.value)} placeholder="30" />
                      </div>
                      <div>
                        <label className={labelCls}>المسافة المقطوعة (كم)</label>
                        <input type="number" className={inputCls} value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="100000" />
                      </div>
                      <div>
                        <label className={labelCls}>رقم اللوحة</label>
                        <input className={inputCls} value={form.plateNumber} onChange={e => set('plateNumber', e.target.value)} />
                      </div>
                    </div>
                  </section>

                  <section className={sectionCls}>
                    <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">tune</span>المواصفات</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>الوقود</label>
                        <div className="flex flex-wrap gap-2">
                          {FUEL_TYPES.map(f => (
                            <button key={f.value} type="button" onClick={() => set('fuelType', f.value)}
                              className={chipCls(form.fuelType === f.value)}>{f.label}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>ناقل الحركة</label>
                        <div className="flex gap-2">
                          {[{ value: 'AUTOMATIC', label: 'أوتوماتيك' }, { value: 'MANUAL', label: 'عادي' }].map(t => (
                            <button key={t.value} type="button" onClick={() => set('transmission', t.value)}
                              className={chipCls(form.transmission === t.value)}>{t.label}</button>
                          ))}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>الحالة</label>
                        <div className="flex flex-wrap gap-2">
                          {CONDITIONS.map(c => (
                            <button key={c.value} type="button" onClick={() => set('condition', c.value)}
                              className={chipCls(form.condition === c.value)}>{c.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className={sectionCls}>
                    <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">star</span>المميزات</h2>
                    <div className="flex flex-wrap gap-2">
                      {BUS_FEATURES.map(f => (
                        <button key={f} type="button"
                          onClick={() => set('features', form.features.includes(f) ? form.features.filter(x => x !== f) : [...form.features, f])}
                          className={chipCls(form.features.includes(f))}>{f}</button>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}

          {/* ── Step 2: Price / Contract / Rental ── */}
          {step === 2 && !isContract && (
            <div className="space-y-8">
              {isSale && (
                <section className={sectionCls}>
                  <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">payments</span>السعر</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>سعر البيع (ر.ع.) *</label>
                      <input type="number" className={inputCls} value={form.price} onChange={e => set('price', e.target.value)} placeholder="8000" />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isPriceNegotiable} onChange={e => set('isPriceNegotiable', e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                        <span className="text-sm text-on-surface">قابل للتفاوض</span>
                      </label>
                    </div>
                  </div>
                </section>
              )}

              {hasContract && (
                <section className={sectionCls}>
                  <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">assignment</span>تفاصيل العقد المرفق</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>نوع العقد</label>
                      <div className="flex flex-wrap gap-2">
                        {CONTRACT_TYPES.map(c => (
                          <button key={c.value} type="button" onClick={() => set('contractType', c.value)}
                            className={chipCls(form.contractType === c.value)}>{c.label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>اسم العميل</label>
                      <input className={inputCls} value={form.contractClient} onChange={e => set('contractClient', e.target.value)} placeholder="مثال: مدرسة النور" />
                    </div>
                    <div>
                      <label className={labelCls}>الراتب الشهري (ر.ع.)</label>
                      <input type="number" className={inputCls} value={form.contractMonthly} onChange={e => set('contractMonthly', e.target.value)} placeholder="400" />
                    </div>
                    <div>
                      <label className={labelCls}>مدة العقد (شهور)</label>
                      <input type="number" className={inputCls} value={form.contractDuration} onChange={e => set('contractDuration', e.target.value)} placeholder="12" />
                    </div>
                    <div>
                      <label className={labelCls}>تاريخ انتهاء العقد</label>
                      <input type="date" className={inputCls} value={form.contractExpiry} onChange={e => set('contractExpiry', e.target.value)} />
                    </div>
                  </div>
                </section>
              )}

              {isRent && (
                <section className={sectionCls}>
                  <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">car_rental</span>أسعار الإيجار</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>السعر اليومي (ر.ع.)</label>
                      <input type="number" className={inputCls} value={form.dailyPrice} onChange={e => set('dailyPrice', e.target.value)} placeholder="70" />
                    </div>
                    <div>
                      <label className={labelCls}>السعر الشهري (ر.ع.)</label>
                      <input type="number" className={inputCls} value={form.monthlyPrice} onChange={e => set('monthlyPrice', e.target.value)} placeholder="1500" />
                    </div>
                    <div>
                      <label className={labelCls}>أقل مدة إيجار (أيام)</label>
                      <input type="number" className={inputCls} value={form.minRentalDays} onChange={e => set('minRentalDays', e.target.value)} placeholder="1" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.withDriver} onChange={e => set('withDriver', e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                      <span className="text-sm text-on-surface">مع سائق</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.deliveryAvailable} onChange={e => set('deliveryAvailable', e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                      <span className="text-sm text-on-surface">توصيل متاح</span>
                    </label>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ── Last Step: Location + Images ── */}
          {step === maxStep && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">location_on</span>الموقع</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>الدولة</label>
                    <select className={inputCls} value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedGov(''); set('governorate', ''); set('city', ''); }}>
                      {getCountries().map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>المحافظة</label>
                    <select className={inputCls} value={selectedGov} onChange={e => { setSelectedGov(e.target.value); set('governorate', e.target.value); set('city', ''); }}>
                      <option value="">اختر المحافظة</option>
                      {governorateOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>المدينة</label>
                    <select className={inputCls} value={form.city} onChange={e => set('city', e.target.value)}>
                      <option value="">اختر المدينة</option>
                      {cityOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-4 rounded-xl overflow-hidden border border-outline-variant/10">
                  <LocationPicker
                    latitude={form.latitude}
                    longitude={form.longitude}
                    onChange={(lat: number, lng: number) => { set('latitude', lat); set('longitude', lng); }}
                  />
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">call</span>التواصل</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>رقم الهاتف</label>
                    <input className={inputCls} value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+968" />
                  </div>
                  <div>
                    <label className={labelCls}>واتساب</label>
                    <input className={inputCls} value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+968" />
                  </div>
                </div>
              </section>

              {!isContract && (
                <section className={sectionCls}>
                  <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">photo_camera</span>الصور</h2>
                  <ImageUploader images={images} onChange={setImages} maxImages={10} />
                </section>
              )}
            </div>
          )}
        </MultiStepForm>

        <FormErrorOverlay messages={errorMessages} onClose={() => setErrorMessages([])} />
      </main>
      <Footer />
    </AuthGuard>
  );
}
