'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import { useCreateOperatorListing } from '@/lib/api/equipment';
import { useToast } from '@/components/toast';
import { getGovernorates, type LocationOption } from '@/lib/location-data';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const OPERATOR_TYPES = [
  { value: 'DRIVER', labelKey: 'opTypeDriver', icon: 'drive_eta', descKey: 'opTypeDriverDesc' },
  { value: 'OPERATOR', labelKey: 'opTypeOperator', icon: 'precision_manufacturing', descKey: 'opTypeOperatorDesc' },
  { value: 'TECHNICIAN', labelKey: 'opTypeTechnician', icon: 'build', descKey: 'opTypeTechnicianDesc' },
  { value: 'MAINTENANCE', labelKey: 'opTypeMaintenance', icon: 'handyman', descKey: 'opTypeMaintenanceDesc' },
];

const EQUIP_TYPES = [
  { value: 'EXCAVATOR', key: 'opExcavator' }, { value: 'CRANE', key: 'opCrane' },
  { value: 'LOADER', key: 'opLoader' }, { value: 'BULLDOZER', key: 'opBulldozer' },
  { value: 'FORKLIFT', key: 'opForklift' }, { value: 'CONCRETE_MIXER', key: 'opConcreteMixer' },
  { value: 'GENERATOR', key: 'opGenerator' }, { value: 'COMPRESSOR', key: 'opCompressor' },
  { value: 'TRUCK', key: 'opTruck' }, { value: 'DUMP_TRUCK', key: 'opDumpTruck' },
  { value: 'WATER_TANKER', key: 'opWaterTanker' }, { value: 'LIGHT_EQUIPMENT', key: 'opLightEquip' },
];

const sectionCls = 'bg-surface-container-lowest dark:bg-surface-container rounded-2xl p-5 border border-outline-variant/10';
const labelCls = 'block text-sm font-bold text-on-surface mb-1.5';
const inputCls = 'w-full bg-surface-container-low dark:bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm font-medium text-on-surface focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all';

export default function AddOperatorPage() {
  const tp = useTranslations('pages');
  const locale = useLocale();
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

  const governorateOptions = getGovernorates('OM', locale);

  const steps = [
    { label: tp('opStepType'), icon: 'engineering' },
    { label: tp('opStepInfo'), icon: 'description' },
    { label: tp('opStepPrice'), icon: 'payments' },
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
    if (!title) errs.push(tp('opErrTitle'));
    if (!description) errs.push(tp('opErrDesc'));
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
      addToast('success', tp('opSuccess'));
      router.push(`/equipment/operators/${result.id}`);
    } catch (e: any) {
      addToast('error', e?.message || tp('opError'));
    }
  }

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-8 max-w-[900px] mx-auto px-4 md:px-8">
        <MultiStepForm
          steps={steps}
          currentStep={step}
          onNext={() => { setStep(s => Math.min(s + 1, maxStep)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onBack={() => { setStep(s => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onSubmit={handleSubmit}
          isLoading={createOp.isPending}
          submitLabel={tp('opSubmit')}
          canProceed={canProceed}
          title={tp('opTitle')}
        >
          {/* Step 0 */}
          {step === 0 && (
            <section className={sectionCls}>
              <h3 className="font-black text-base text-on-surface mb-4">{tp('opLabelServiceType')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {OPERATOR_TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => setOperatorType(t.value)}
                    className={`p-4 rounded-2xl border-2 text-start transition-all ${operatorType === t.value ? 'border-primary bg-primary/5' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                    <span className="material-symbols-outlined text-2xl text-primary mb-2 block">{t.icon}</span>
                    <p className="font-bold text-sm">{tp(t.labelKey)}</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">{tp(t.descKey)}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">{tp('opLabelBasicInfo')}</h3>
                <div className="space-y-4">
                  <div><label className={labelCls}>{tp('opLabelTitle')}</label><input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} placeholder={tp('opPlaceholderTitle')} /></div>
                  <div><label className={labelCls}>{tp('opLabelDesc')}</label><textarea className={`${inputCls} min-h-[100px]`} value={description} onChange={e => setDescription(e.target.value)} placeholder={tp('opPlaceholderDesc')} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className={labelCls}>{tp('opLabelExperience')}</label><input type="number" className={inputCls} value={experienceYears} onChange={e => setExperienceYears(e.target.value)} placeholder="10" /></div>
                    <div><label className={labelCls}>{tp('opLabelSpecializations')}</label><input className={inputCls} value={specializations} onChange={e => setSpecializations(e.target.value)} placeholder={tp('opPlaceholderSpec')} /></div>
                  </div>
                  <div><label className={labelCls}>{tp('opLabelCerts')}</label><input className={inputCls} value={certifications} onChange={e => setCertifications(e.target.value)} placeholder={tp('opPlaceholderCerts')} /></div>
                </div>
              </section>
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">{tp('opLabelEquipTypes')}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {EQUIP_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => toggleEquipType(t.value)}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-bold text-center transition-all ${equipmentTypes.includes(t.value) ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/10 hover:border-primary/30'}`}>
                      {tp(t.key)}
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
                <h3 className="font-black text-base text-on-surface mb-4">{tp('opLabelPrices')}</h3>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div><label className={labelCls}>{tp('opLabelDailyRate')}</label><input type="number" className={inputCls} value={dailyRate} onChange={e => setDailyRate(e.target.value)} /></div>
                  <div><label className={labelCls}>{tp('opLabelHourlyRate')}</label><input type="number" className={inputCls} value={hourlyRate} onChange={e => setHourlyRate(e.target.value)} /></div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isPriceNegotiable} onChange={e => setIsPriceNegotiable(e.target.checked)} className="w-4 h-4 rounded" /><span className="text-sm font-bold">{tp('opLabelNegotiable')}</span></label>
              </section>
              <section className={sectionCls}>
                <h3 className="font-black text-base text-on-surface mb-4">{tp('opLabelLocationContact')}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelCls}>{tp('opLabelGov')}</label>
                    <select className={inputCls} value={governorate} onChange={e => setGovernorate(e.target.value)}>
                      <option value="">{tp('opSelectGov')}</option>
                      {governorateOptions.map((g: LocationOption) => <option key={g.value} value={g.label}>{g.label}</option>)}
                    </select>
                  </div>
                  <div><label className={labelCls}>{tp('opLabelCity')}</label><input className={inputCls} value={city} onChange={e => setCity(e.target.value)} /></div>
                  <div><label className={labelCls}>{tp('opLabelPhone')}</label><input className={inputCls} value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+968" /></div>
                  <div><label className={labelCls}>{tp('opLabelWhatsapp')}</label><input className={inputCls} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+968" /></div>
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
