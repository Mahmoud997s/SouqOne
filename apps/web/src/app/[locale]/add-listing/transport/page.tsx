'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
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
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const TRANSPORT_TYPES = [
  { value: 'CARGO', key: 'trTypeCargo' },
  { value: 'FURNITURE', key: 'trTypeFurniture' },
  { value: 'DELIVERY', key: 'trTypeDelivery' },
  { value: 'HEAVY_TRANSPORT', key: 'trTypeHeavy' },
  { value: 'TRUCK_RENTAL', key: 'trTypeTruckRent' },
  { value: 'OTHER_TRANSPORT', key: 'trTypeOther' },
];

const PRICING_TYPES = [
  { value: 'FIXED', key: 'trPriceFixed' },
  { value: 'PER_KM', key: 'trPricePerKm' },
  { value: 'PER_TRIP', key: 'trPricePerTrip' },
  { value: 'HOURLY', key: 'trPriceHourly' },
  { value: 'NEGOTIABLE_PRICE', key: 'trPriceNeg' },
];

const PROVIDER_TYPES = [
  { value: 'INDIVIDUAL', key: 'trProvIndividual' },
  { value: 'COMPANY', key: 'trProvCompany' },
];

export default function AddTransportPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4"><div className="animate-pulse bg-surface-container-low h-96 rounded-xl" /></main></>}>
      <AddTransportContent />
    </Suspense>
  );
}

function AddTransportContent() {
  const tp = useTranslations('pages');
  const locale = useLocale();
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
  const governorateOptions = getGovernorates(selectedCountry, locale);
  const cityOptions = getCities(selectedCountry, selectedGov, locale);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const steps = [
    { label: tp('trStepBasic') },
    { label: tp('trStepDetails') },
    { label: tp('trStepLocation') },
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

      addToast('success', tp('trSuccess'));
      router.push(`/transport/${item.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tp('trError');
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
          submitLabel={tp('trSubmit')}
          canProceed={canProceed}
          title={tp('trTitle')}
        >
          {step === 0 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('trLabelType')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TRANSPORT_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('transportType', t.value)}
                      className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.transportType === t.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                      {tp(t.key)}
                    </button>
                  ))}
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-6">{tp('trLabelPhotos')}</h2>
                <ImageUploader images={images} onChange={setImages} disabled={isLoading} />
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('trLabelProvider')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>{tp('trLabelTitle')}</label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder={tp('trPlaceholderTitle')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('trLabelProvName')}</label>
                    <input type="text" value={form.providerName} onChange={e => set('providerName', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('trLabelProvType')}</label>
                    <div className="flex gap-3">
                      {PROVIDER_TYPES.map(p => (
                        <button key={p.value} type="button" onClick={() => set('providerType', p.value)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${form.providerType === p.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                          {tp(p.key)}
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
                <h2 className="text-lg font-extrabold mb-4">{tp('trLabelDetailsSection')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>{tp('trLabelDesc')}</label>
                    <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder={tp('trPlaceholderDesc')} className={inputCls + ' resize-none'} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{tp('trLabelVehicle')}</label>
                      <input type="text" value={form.vehicleType} onChange={e => set('vehicleType', e.target.value)} placeholder={tp('trPlaceholderVehicle')} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('trLabelCapacity')}</label>
                      <input type="text" value={form.vehicleCapacity} onChange={e => set('vehicleCapacity', e.target.value)} placeholder={tp('trPlaceholderCapacity')} className={inputCls} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('trLabelPricingSection')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>{tp('trLabelPricingType')}</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRICING_TYPES.map(p => (
                        <button key={p.value} type="button" onClick={() => set('pricingType', p.value)}
                          className={`py-2.5 rounded-lg text-sm font-bold transition-all ${form.pricingType === p.value ? 'bg-primary text-on-primary shadow-ambient' : 'bg-surface border border-outline text-on-surface hover:border-primary'}`}>
                          {tp(p.key)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{tp('trLabelBasePrice')}</label>
                      <input type="number" step="0.01" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('trLabelPricePerKm')}</label>
                      <input type="number" step="0.001" value={form.pricePerKm} onChange={e => set('pricePerKm', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 cursor-pointer bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                      <input type="checkbox" checked={form.hasInsurance} onChange={e => set('hasInsurance', e.target.checked)} className="w-5 h-5 accent-primary" />
                      <span className="text-sm font-medium text-on-surface">{tp('trLabelInsurance')}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer bg-surface-container-lowest rounded-lg p-3 border border-outline-variant/10">
                      <input type="checkbox" checked={form.hasTracking} onChange={e => set('hasTracking', e.target.checked)} className="w-5 h-5 accent-primary" />
                      <span className="text-sm font-medium text-on-surface">{tp('trLabelTracking')}</span>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('trLabelLocation')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>{tp('trLabelCountry')}</label>
                    <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedGov(''); set('governorate', ''); set('city', ''); }} className={inputCls}>
                      <option value="">{tp('trSelect')}</option>
                      {getCountries(locale).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{tp('trLabelGov')}</label>
                    <select value={selectedGov} onChange={e => { setSelectedGov(e.target.value); const g = governorateOptions.find(x => x.value === e.target.value); set('governorate', g?.label ?? ''); set('city', ''); }} className={inputCls}>
                      <option value="">{tp('trSelect')}</option>
                      {governorateOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{tp('trLabelCity')}</label>
                    <select value={form.city} onChange={e => set('city', e.target.value)} className={inputCls} disabled={!selectedGov}>
                      <option value="">{tp('trSelect')}</option>
                      {cityOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('trLabelMap')}</h2>
                <LocationPicker latitude={form.latitude} longitude={form.longitude} onChange={(lat, lng) => { set('latitude', lat); set('longitude', lng); }} />
              </section>

              <section className="glass-card rounded-xl p-6 md:p-8">
                <h2 className="text-lg font-extrabold mb-4">{tp('trLabelContact')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{tp('trLabelPhone')}</label>
                    <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+968..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('trLabelWhatsapp')}</label>
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
