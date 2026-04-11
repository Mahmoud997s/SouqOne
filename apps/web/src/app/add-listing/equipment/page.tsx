'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { ImageUploader, type UploadedImage } from '@/features/ads/components/image-uploader';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import { useCreateEquipmentListing } from '@/lib/api/equipment';
import { useToast } from '@/components/toast';
import { getGovernorates, type LocationOption } from '@/lib/location-data';
import { getAuthToken } from '@/lib/auth';
import { API_BASE } from '@/lib/config';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const EQUIP_TYPES = [
  { value: 'EXCAVATOR', label: 'حفار', icon: 'precision_manufacturing' },
  { value: 'CRANE', label: 'رافعة', icon: 'crane' },
  { value: 'LOADER', label: 'لودر', icon: 'front_loader' },
  { value: 'BULLDOZER', label: 'بلدوزر', icon: 'agriculture' },
  { value: 'FORKLIFT', label: 'رافعة شوكية', icon: 'forklift' },
  { value: 'CONCRETE_MIXER', label: 'خلاطة خرسانة', icon: 'concrete' },
  { value: 'GENERATOR', label: 'مولد كهربائي', icon: 'bolt' },
  { value: 'COMPRESSOR', label: 'ضاغط هواء', icon: 'air' },
  { value: 'SCAFFOLDING', label: 'سقالات', icon: 'construction' },
  { value: 'WELDING_MACHINE', label: 'ماكينة لحام', icon: 'hardware' },
  { value: 'TRUCK', label: 'شاحنة', icon: 'local_shipping' },
  { value: 'DUMP_TRUCK', label: 'قلاب', icon: 'local_shipping' },
  { value: 'WATER_TANKER', label: 'صهريج مياه', icon: 'water_drop' },
  { value: 'LIGHT_EQUIPMENT', label: 'معدات خفيفة', icon: 'build' },
  { value: 'OTHER_EQUIPMENT', label: 'أخرى', icon: 'category' },
];

const CONDITIONS = [
  { value: 'NEW', label: 'جديد' }, { value: 'LIKE_NEW', label: 'كالجديد' },
  { value: 'GOOD', label: 'جيد' }, { value: 'USED', label: 'مستعمل' },
  { value: 'FAIR', label: 'مقبول' },
];

const sectionCls = 'bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10';
const labelCls = 'block text-sm font-bold text-on-surface mb-1.5';
const inputCls = 'w-full bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

export default function AddEquipmentPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const createEquip = useCreateEquipmentListing();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Form state
  const [listingType, setListingType] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [condition, setCondition] = useState('USED');
  const [capacity, setCapacity] = useState('');
  const [power, setPower] = useState('');
  const [weight, setWeight] = useState('');
  const [hoursUsed, setHoursUsed] = useState('');
  const [price, setPrice] = useState('');
  const [dailyPrice, setDailyPrice] = useState('');
  const [weeklyPrice, setWeeklyPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [isPriceNegotiable, setIsPriceNegotiable] = useState(false);
  const [withOperator, setWithOperator] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [minRentalDays, setMinRentalDays] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const governorateOptions = getGovernorates('OM');

  const steps = [
    { label: 'نوع الإعلان', icon: 'category' },
    { label: 'المواصفات', icon: 'settings' },
    { label: 'السعر والموقع', icon: 'payments' },
    { label: 'الصور', icon: 'photo_camera' },
  ];
  const maxStep = steps.length - 1;

  const canProceed =
    step === 0 ? !!(listingType && equipmentType) :
    step === 1 ? !!(title && description) :
    step === 2 ? (listingType === 'EQUIPMENT_SALE' ? !!price : !!(dailyPrice || monthlyPrice)) :
    true;

  async function handleSubmit() {
    const errs: string[] = [];
    if (!title) errs.push('العنوان مطلوب');
    if (!description) errs.push('الوصف مطلوب');
    if (errs.length) { setErrors(errs); return; }

    try {
      const data: Record<string, unknown> = {
        title, description, equipmentType, listingType, condition,
        make: make || undefined, model: model || undefined,
        year: year ? Number(year) : undefined,
        capacity: capacity || undefined, power: power || undefined,
        weight: weight || undefined, hoursUsed: hoursUsed ? Number(hoursUsed) : undefined,
        price: price ? Number(price) : undefined,
        dailyPrice: dailyPrice ? Number(dailyPrice) : undefined,
        weeklyPrice: weeklyPrice ? Number(weeklyPrice) : undefined,
        monthlyPrice: monthlyPrice ? Number(monthlyPrice) : undefined,
        isPriceNegotiable, withOperator, deliveryAvailable,
        minRentalDays: minRentalDays ? Number(minRentalDays) : undefined,
        governorate: governorate || undefined, city: city || undefined,
        latitude: latitude ?? undefined, longitude: longitude ?? undefined,
        contactPhone: contactPhone || undefined, whatsapp: whatsapp || undefined,
      };

      const result = await createEquip.mutateAsync(data);

      // Upload images
      for (const img of images) {
        if (img.file) {
          const fd = new FormData();
          fd.append('file', img.file);
          const token = getAuthToken();
          await fetch(`${API_BASE}/uploads/equipment/${result.id}/images`, {
            method: 'POST', body: fd,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
        }
      }

      addToast('success', 'تم نشر إعلان المعدة بنجاح');
      router.push(`/equipment/${result.id}`);
    } catch (e: any) {
      addToast('error', e?.message || 'حدث خطأ');
    }
  }

  const isLoading = createEquip.isPending;

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
          title="إضافة إعلان معدة"
        >
          {/* ── Step 0: Type ── */}
          {step === 0 && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">نوع الإعلان</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: 'EQUIPMENT_SALE', l: 'بيع معدة', i: 'sell', d: 'عرض معدة للبيع' }, { v: 'EQUIPMENT_RENT', l: 'تأجير معدة', i: 'car_rental', d: 'عرض معدة للإيجار' }].map(opt => (
                    <button key={opt.v} type="button" onClick={() => setListingType(opt.v)}
                      className={`p-4 rounded-2xl border-2 text-right transition-all ${listingType === opt.v ? 'border-primary bg-primary/5' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                      <span className="material-symbols-outlined text-2xl text-primary mb-2 block">{opt.i}</span>
                      <p className="font-bold text-sm">{opt.l}</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{opt.d}</p>
                    </button>
                  ))}
                </div>
              </section>
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">نوع المعدة</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {EQUIP_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => setEquipmentType(t.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${equipmentType === t.value ? 'border-primary bg-primary/5' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                      <span className="material-symbols-outlined text-xl text-primary">{t.icon}</span>
                      <span className="text-[10px] font-bold">{t.label}</span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── Step 1: Specs ── */}
          {step === 1 && (
            <div className="space-y-6">
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">المعلومات الأساسية</h3>
                <div className="space-y-4">
                  <div><label className={labelCls}>العنوان *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: حفار كاتربيلر 20 طن" /></div>
                  <div><label className={labelCls}>الوصف *</label><textarea className={`${inputCls} min-h-[100px]`} value={description} onChange={e => setDescription(e.target.value)} placeholder="وصف تفصيلي للمعدة..." /></div>
                </div>
              </section>
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">المواصفات الفنية</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>الماركة</label><input className={inputCls} value={make} onChange={e => setMake(e.target.value)} placeholder="Caterpillar" /></div>
                  <div><label className={labelCls}>الموديل</label><input className={inputCls} value={model} onChange={e => setModel(e.target.value)} placeholder="320D" /></div>
                  <div><label className={labelCls}>سنة الصنع</label><input type="number" className={inputCls} value={year} onChange={e => setYear(e.target.value)} placeholder="2020" /></div>
                  <div>
                    <label className={labelCls}>الحالة</label>
                    <select className={inputCls} value={condition} onChange={e => setCondition(e.target.value)}>
                      {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>السعة/الحمولة</label><input className={inputCls} value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="20 طن" /></div>
                  <div><label className={labelCls}>القدرة</label><input className={inputCls} value={power} onChange={e => setPower(e.target.value)} placeholder="150 حصان" /></div>
                  <div><label className={labelCls}>الوزن</label><input className={inputCls} value={weight} onChange={e => setWeight(e.target.value)} placeholder="22,000 كجم" /></div>
                  <div><label className={labelCls}>ساعات التشغيل</label><input type="number" className={inputCls} value={hoursUsed} onChange={e => setHoursUsed(e.target.value)} placeholder="5000" /></div>
                </div>
              </section>
            </div>
          )}

          {/* ── Step 2: Price & Location ── */}
          {step === 2 && (
            <div className="space-y-6">
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">السعر</h3>
                <div className="space-y-4">
                  {listingType === 'EQUIPMENT_SALE' ? (
                    <div><label className={labelCls}>سعر البيع (ر.ع) *</label><input type="number" className={inputCls} value={price} onChange={e => setPrice(e.target.value)} placeholder="0.000" /></div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className={labelCls}>يومي (ر.ع)</label><input type="number" className={inputCls} value={dailyPrice} onChange={e => setDailyPrice(e.target.value)} /></div>
                      <div><label className={labelCls}>أسبوعي (ر.ع)</label><input type="number" className={inputCls} value={weeklyPrice} onChange={e => setWeeklyPrice(e.target.value)} /></div>
                      <div><label className={labelCls}>شهري (ر.ع)</label><input type="number" className={inputCls} value={monthlyPrice} onChange={e => setMonthlyPrice(e.target.value)} /></div>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isPriceNegotiable} onChange={e => setIsPriceNegotiable(e.target.checked)} className="w-4 h-4 rounded" /><span className="text-sm font-bold">قابل للتفاوض</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={withOperator} onChange={e => setWithOperator(e.target.checked)} className="w-4 h-4 rounded" /><span className="text-sm font-bold">مع مشغل</span></label>
                    <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={deliveryAvailable} onChange={e => setDeliveryAvailable(e.target.checked)} className="w-4 h-4 rounded" /><span className="text-sm font-bold">توصيل متوفر</span></label>
                  </div>
                  {listingType === 'EQUIPMENT_RENT' && (
                    <div><label className={labelCls}>أقل مدة إيجار (أيام)</label><input type="number" className={inputCls} value={minRentalDays} onChange={e => setMinRentalDays(e.target.value)} /></div>
                  )}
                </div>
              </section>
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">الموقع والتواصل</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>المحافظة</label>
                    <select className={inputCls} value={governorate} onChange={e => setGovernorate(e.target.value)}>
                      <option value="">اختر المحافظة</option>
                      {governorateOptions.map((g: LocationOption) => <option key={g.value} value={g.label}>{g.label}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>المدينة</label><input className={inputCls} value={city} onChange={e => setCity(e.target.value)} placeholder="المدينة" /></div>
                  <div><label className={labelCls}>رقم الهاتف</label><input className={inputCls} value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+968" /></div>
                  <div><label className={labelCls}>واتساب</label><input className={inputCls} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+968" /></div>
                </div>
                <LocationPicker latitude={latitude} longitude={longitude} onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
              </section>
            </div>
          )}

          {/* ── Step 3: Images ── */}
          {step === 3 && (
            <section className={sectionCls}>
              <h3 className="font-black text-base text-on-surface mb-4">صور المعدة</h3>
              <ImageUploader images={images} onChange={setImages} />
            </section>
          )}
        </MultiStepForm>

        {errors.length > 0 && <FormErrorOverlay messages={errors} onClose={() => setErrors([])} />}
      </main>
    </AuthGuard>
  );
}
