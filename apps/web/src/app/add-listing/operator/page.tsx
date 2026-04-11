'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import { useCreateOperatorListing } from '@/lib/api/equipment';
import { useToast } from '@/components/toast';
import { getGovernorates, type LocationOption } from '@/lib/location-data';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const OPERATOR_TYPES = [
  { value: 'DRIVER', label: 'سائق', icon: 'drive_eta', desc: 'سائق شاحنات أو معدات' },
  { value: 'OPERATOR', label: 'مشغل', icon: 'precision_manufacturing', desc: 'مشغل حفارات ورافعات' },
  { value: 'TECHNICIAN', label: 'فني', icon: 'build', desc: 'فني صيانة وإصلاح' },
  { value: 'MAINTENANCE', label: 'صيانة', icon: 'handyman', desc: 'خدمات صيانة دورية' },
];

const EQUIP_TYPES = [
  { value: 'EXCAVATOR', label: 'حفار' }, { value: 'CRANE', label: 'رافعة' },
  { value: 'LOADER', label: 'لودر' }, { value: 'BULLDOZER', label: 'بلدوزر' },
  { value: 'FORKLIFT', label: 'رافعة شوكية' }, { value: 'CONCRETE_MIXER', label: 'خلاطة' },
  { value: 'GENERATOR', label: 'مولد' }, { value: 'COMPRESSOR', label: 'ضاغط' },
  { value: 'TRUCK', label: 'شاحنة' }, { value: 'DUMP_TRUCK', label: 'قلاب' },
  { value: 'WATER_TANKER', label: 'صهريج' }, { value: 'LIGHT_EQUIPMENT', label: 'معدات خفيفة' },
];

const sectionCls = 'bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10';
const labelCls = 'block text-sm font-bold text-on-surface mb-1.5';
const inputCls = 'w-full bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

export default function AddOperatorPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const createOp = useCreateOperatorListing();

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const [operatorType, setOperatorType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [equipmentTypes, setEquipmentTypes] = useState<string[]>([]);
  const [certifications, setCertifications] = useState('');
  const [dailyRate, setDailyRate] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [isPriceNegotiable, setIsPriceNegotiable] = useState(false);
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [contactPhone, setContactPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const governorateOptions = getGovernorates('OM');

  const steps = [
    { label: 'نوع الخدمة', icon: 'engineering' },
    { label: 'المعلومات', icon: 'description' },
    { label: 'الأسعار والموقع', icon: 'payments' },
  ];
  const maxStep = steps.length - 1;

  const canProceed =
    step === 0 ? !!operatorType :
    step === 1 ? !!(title && description) :
    true;

  function toggleEquipType(v: string) {
    setEquipmentTypes(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v]);
  }

  async function handleSubmit() {
    const errs: string[] = [];
    if (!title) errs.push('العنوان مطلوب');
    if (!description) errs.push('الوصف مطلوب');
    if (errs.length) { setErrors(errs); return; }

    try {
      const data: Record<string, unknown> = {
        title, description, operatorType,
        specializations: specializations ? specializations.split(',').map(s => s.trim()).filter(Boolean) : [],
        experienceYears: experienceYears ? Number(experienceYears) : undefined,
        equipmentTypes: equipmentTypes.length ? equipmentTypes : undefined,
        certifications: certifications ? certifications.split(',').map(s => s.trim()).filter(Boolean) : [],
        dailyRate: dailyRate ? Number(dailyRate) : undefined,
        hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
        isPriceNegotiable,
        governorate: governorate || undefined, city: city || undefined,
        latitude: latitude ?? undefined, longitude: longitude ?? undefined,
        contactPhone: contactPhone || undefined, whatsapp: whatsapp || undefined,
      };

      const result = await createOp.mutateAsync(data);
      addToast('success', 'تم نشر الإعلان بنجاح');
      router.push(`/equipment/operators/${result.id}`);
    } catch (e: any) {
      addToast('error', e?.message || 'حدث خطأ');
    }
  }

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
          isLoading={createOp.isPending}
          submitLabel="نشر الإعلان"
          canProceed={canProceed}
          title="تسجيل كمشغل/فني"
        >
          {/* Step 0 */}
          {step === 0 && (
            <section className={sectionCls}>
              <h3 className="font-black text-base text-on-surface mb-4">نوع الخدمة</h3>
              <div className="grid grid-cols-2 gap-3">
                {OPERATOR_TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => setOperatorType(t.value)}
                    className={`p-4 rounded-2xl border-2 text-right transition-all ${operatorType === t.value ? 'border-primary bg-primary/5' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                    <span className="material-symbols-outlined text-2xl text-primary mb-2 block">{t.icon}</span>
                    <p className="font-bold text-sm">{t.label}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{t.desc}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">المعلومات الأساسية</h3>
                <div className="space-y-4">
                  <div><label className={labelCls}>العنوان *</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: مشغل حفارات — خبرة 10 سنوات" /></div>
                  <div><label className={labelCls}>الوصف *</label><textarea className={`${inputCls} min-h-[100px]`} value={description} onChange={e => setDescription(e.target.value)} placeholder="اكتب عن خبرتك ومهاراتك..." /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>سنوات الخبرة</label><input type="number" className={inputCls} value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="10" /></div>
                    <div><label className={labelCls}>التخصصات</label><input className={inputCls} value={specializations} onChange={e => setSpecializations(e.target.value)} placeholder="حفر، تسوية (فاصل بفاصلة)" /></div>
                  </div>
                  <div><label className={labelCls}>الشهادات</label><input className={inputCls} value={certifications} onChange={e => setCertifications(e.target.value)} placeholder="رخصة ثقيلة، شهادة سلامة (فاصل بفاصلة)" /></div>
                </div>
              </section>
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">أنواع المعدات التي تعمل عليها</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {EQUIP_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => toggleEquipType(t.value)}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-bold text-center transition-all ${equipmentTypes.includes(t.value) ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">الأسعار</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div><label className={labelCls}>السعر اليومي (ر.ع)</label><input type="number" className={inputCls} value={dailyRate} onChange={e => setDailyRate(e.target.value)} /></div>
                  <div><label className={labelCls}>السعر بالساعة (ر.ع)</label><input type="number" className={inputCls} value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isPriceNegotiable} onChange={e => setIsPriceNegotiable(e.target.checked)} className="w-4 h-4 rounded" /><span className="text-sm font-bold">قابل للتفاوض</span></label>
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
                  <div><label className={labelCls}>المدينة</label><input className={inputCls} value={city} onChange={e => setCity(e.target.value)} /></div>
                  <div><label className={labelCls}>رقم الهاتف</label><input className={inputCls} value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+968" /></div>
                  <div><label className={labelCls}>واتساب</label><input className={inputCls} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+968" /></div>
                </div>
                <LocationPicker latitude={latitude} longitude={longitude} onChange={(lat, lng) => { setLatitude(lat); setLongitude(lng); }} />
              </section>
            </div>
          )}
        </MultiStepForm>

        {errors.length > 0 && <FormErrorOverlay messages={errors} onClose={() => setErrors([])} />}
      </main>
    </AuthGuard>
  );
}
