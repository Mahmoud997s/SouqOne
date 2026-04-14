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
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const TRIP_TYPES = [
  { value: 'BUS_SUBSCRIPTION', key: 'tripTypeBusSub' },
  { value: 'SCHOOL_TRANSPORT', key: 'tripTypeSchool' },
  { value: 'TOURISM', key: 'tripTypeTourism' },
  { value: 'CORPORATE', key: 'tripTypeCorp' },
  { value: 'CARPOOLING', key: 'tripTypeCarpool' },
  { value: 'OTHER_TRIP', key: 'tripTypeOther' },
];

const SCHEDULE_TYPES = [
  { value: 'SCHEDULE_DAILY', key: 'tripSchedDaily' },
  { value: 'SCHEDULE_WEEKLY', key: 'tripSchedWeekly' },
  { value: 'SCHEDULE_MONTHLY', key: 'tripSchedMonthly' },
  { value: 'ONE_TIME', key: 'tripSchedOnce' },
];

const DAYS = [
  { value: 'SAT', key: 'tripDaySat' },
  { value: 'SUN', key: 'tripDaySun' },
  { value: 'MON', key: 'tripDayMon' },
  { value: 'TUE', key: 'tripDayTue' },
  { value: 'WED', key: 'tripDayWed' },
  { value: 'THU', key: 'tripDayThu' },
  { value: 'FRI', key: 'tripDayFri' },
];

export default function AddTripPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4"><div className="animate-pulse bg-surface-container-low h-96 rounded-xl" /></main></>}>
      <AddTripContent />
    </Suspense>
  );
}

function AddTripContent() {
  const tp = useTranslations('pages');
  const locale = useLocale();
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
  const governorateOptions = getGovernorates(selectedCountry, locale);
  const cityOptions = getCities(selectedCountry, selectedGov, locale);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const steps = [
    { label: tp('tripStepBasic') },
    { label: tp('tripStepRoute') },
    { label: tp('tripStepPrice') },
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
      addToast('success', tp('tripSuccess'));
      router.push(`/trips/${item.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tp('tripError');
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
          submitLabel={tp('tripSubmit')}
          canProceed={canProceed}
          title={tp('tripTitle')}
        >
          {step === 0 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('tripLabelType')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRIP_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('tripType', t.value)}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.tripType === t.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                      {tp(t.key)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('tripLabelProvider')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>{tp('tripLabelTitle')}</label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder={tp('tripPlaceholderTitle')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('tripLabelProviderName')}</label>
                    <input type="text" value={form.providerName} onChange={e => set('providerName', e.target.value)} className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{tp('tripLabelVehicle')}</label>
                      <input type="text" value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)} placeholder={tp('tripPlaceholderVehicle')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('tripLabelCapacity')}</label>
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
                <h2 className="text-lg font-extrabold mb-4">{tp('tripLabelRoute')}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{tp('tripLabelFrom')}</label>
                      <input type="text" value={form.routeFrom} onChange={e => set('routeFrom', e.target.value)} placeholder={tp('tripPlaceholderFrom')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('tripLabelTo')}</label>
                      <input type="text" value={form.routeTo} onChange={e => set('routeTo', e.target.value)} placeholder={tp('tripPlaceholderTo')} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{tp('tripLabelStops')}</label>
                    <div className="flex gap-2">
                      <input type="text" value={form.newStop} onChange={e => set('newStop', e.target.value)} placeholder={tp('tripPlaceholderStop')} className={inputCls}
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
                <h2 className="text-lg font-extrabold mb-4">{tp('tripLabelSchedule')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>{tp('tripLabelSchedType')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SCHEDULE_TYPES.map(s => (
                        <button key={s.value} type="button" onClick={() => set('scheduleType', s.value)}
                          className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.scheduleType === s.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                          {tp(s.key)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{tp('tripLabelDays')}</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(d => (
                        <button key={d.value} type="button" onClick={() => set('operatingDays', form.operatingDays.includes(d.value) ? form.operatingDays.filter(x => x !== d.value) : [...form.operatingDays, d.value])}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${form.operatingDays.includes(d.value) ? 'bg-primary text-on-primary' : 'bg-surface border border-outline text-on-surface-variant hover:border-primary'}`}>
                          {tp(d.key)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{tp('tripLabelStartDate')}</label>
                      <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('tripLabelEndDate')}</label>
                      <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{tp('tripLabelDesc')}</label>
                    <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder={tp('tripPlaceholderDesc')} className={inputCls + ' resize-none'} />
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('tripLabelPrices')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{tp('tripLabelPriceTrip')}</label>
                    <input type="number" step="0.01" value={form.pricePerTrip} onChange={e => set('pricePerTrip', e.target.value)} placeholder="5.000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('tripLabelPriceMonthly')}</label>
                    <input type="number" step="0.01" value={form.priceMonthly} onChange={e => set('priceMonthly', e.target.value)} placeholder="50.000" className={inputCls} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className={labelCls}>{tp('tripLabelSeats')}</label>
                  <input type="number" value={form.availableSeats} onChange={e => set('availableSeats', e.target.value)} placeholder="20" className={inputCls} />
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('tripLabelLocationContact')}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>{tp('tripLabelCountry')}</label>
                      <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedGov(''); set('governorate', ''); set('city', ''); }} className={inputCls}>
                        <option value="">{tp('tripSelect')}</option>
                        {getCountries(locale).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>{tp('tripLabelGov')}</label>
                      <select value={selectedGov} onChange={e => { setSelectedGov(e.target.value); const g = governorateOptions.find(x => x.value === e.target.value); set('governorate', g?.label ?? ''); set('city', ''); }} className={inputCls}>
                        <option value="">{tp('tripSelect')}</option>
                        {governorateOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>{tp('tripLabelCity')}</label>
                      <select value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} disabled={!selectedGov}>
                        <option value="">{tp('tripSelect')}</option>
                        {cityOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={labelCls}>{tp('tripLabelMap')}</label>
                    <LocationPicker latitude={form.latitude} longitude={form.longitude} onChange={(lat, lng) => { set('latitude', lat); set('longitude', lng); }} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{tp('tripLabelPhone')}</label>
                      <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+968..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('tripLabelWhatsapp')}</label>
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
