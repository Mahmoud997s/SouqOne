'use client';

import { Suspense, useState } from 'react';
import { ImageUploader, type UploadedImage } from '@/features/ads/components/image-uploader';
import { getAuthToken } from '@/lib/auth';
import { API_BASE } from '@/lib/config';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { useCreateInsurance } from '@/lib/api';
import { useToast } from '@/components/toast';
import { getGovernorates, getCountries } from '@/lib/location-data';
import { inputCls, labelCls, sectionCls, sectionTitleCls, chipCls } from '@/lib/constants/form-styles';
import { FormErrorOverlay } from '@/components/form-error-overlay';
import { useTranslations, useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

const INSURANCE_TYPES = [
  { value: 'CAR_COMPREHENSIVE', key: 'insTypeComprehensive' },
  { value: 'CAR_THIRD_PARTY', key: 'insTypeThirdParty' },
  { value: 'MARINE', key: 'insTypeMarine' },
  { value: 'HEAVY_EQUIPMENT', key: 'insTypeEquipment' },
  { value: 'FINANCING', key: 'insTypeFinancing' },
  { value: 'LEASING', key: 'insTypeLeasing' },
];

export default function AddInsurancePage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4"><div className="animate-pulse bg-surface-container-low h-96 rounded-xl" /></main></>}>
      <AddInsuranceContent />
    </Suspense>
  );
}

function AddInsuranceContent() {
  const tp = useTranslations('pages');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || '';
  const create = useCreateInsurance();
  const { addToast } = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [step, setStep] = useState(0);
  const [images, setImages] = useState<UploadedImage[]>([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    offerType: initialType,
    providerName: '',
    coverageType: '',
    priceFrom: '',
    features: [] as string[],
    newFeature: '',
    termsUrl: '',
    contactPhone: '',
    whatsapp: '',
    website: '',
    governorate: '',
    latitude: null as number | null,
    longitude: null as number | null,
  });

  const [selectedCountry, setSelectedCountry] = useState('OM');
  const [selectedGov, setSelectedGov] = useState('');
  const governorateOptions = getGovernorates(selectedCountry, locale);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const steps = [
    { label: tp('insStepBasic') },
    { label: tp('insStepDetails') },
    { label: tp('insStepContact') },
  ];

  const canProceed = step === 0 ? !!form.offerType && !!form.title && !!form.providerName : step === 1 ? !!form.description : true;

  async function handleSubmit() {
    setErrorMessages([]);
    try {
      const payload: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        offerType: form.offerType,
        providerName: form.providerName,
      };
      if (form.coverageType) payload.coverageType = form.coverageType;
      if (form.priceFrom) payload.priceFrom = parseFloat(form.priceFrom);
      if (form.features.length) payload.features = form.features;
      if (form.termsUrl) payload.termsUrl = form.termsUrl;
      if (form.contactPhone) payload.contactPhone = form.contactPhone;
      if (form.whatsapp) payload.whatsapp = form.whatsapp;
      if (form.website) payload.website = form.website;
      if (form.governorate) payload.governorate = form.governorate;
      if (form.latitude) payload.latitude = form.latitude;
      if (form.longitude) payload.longitude = form.longitude;

      const item = await create.mutateAsync(payload);

      if (images.length > 0) {
        const token = getAuthToken();
        for (const img of images) {
          if (img.file) {
            const fd = new FormData();
            fd.append('file', img.file);
            fd.append('isPrimary', String(img.isPrimary));
            await fetch(`${API_BASE}/api/v1/uploads/insurance/${item.id}/images`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: fd,
            });
          }
        }
      }

      addToast('success', tp('insSuccess'));
      router.push(`/insurance/${item.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tp('insError');
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
          submitLabel={tp('insSubmit')}
          canProceed={canProceed}
          title={tp('insTitle')}
        >
          {step === 0 && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">verified_user</span>{tp('insLabelType')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INSURANCE_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => set('offerType', t.value)}
                      className={chipCls(form.offerType === t.value)}>
                      {tp(t.key)}
                    </button>
                  ))}
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">business</span>{tp('insLabelProvider')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>{tp('insLabelTitle')}</label>
                    <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder={tp('insPlaceholderTitle')} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('insLabelCompany')}</label>
                    <input type="text" value={form.providerName} onChange={e => set('providerName', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('insLabelCoverage')}</label>
                    <input type="text" value={form.coverageType} onChange={e => set('coverageType', e.target.value)} placeholder={tp('insPlaceholderCoverage')} className={inputCls} />
                  </div>
                </div>
              </section>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">description</span>{tp('insLabelDetails')}</h2>
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>{tp('insLabelDesc')}</label>
                    <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder={tp('insPlaceholderDesc')} className={inputCls + ' resize-none'} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('insLabelPriceFrom')}</label>
                    <input type="number" step="0.01" value={form.priceFrom} onChange={e => set('priceFrom', e.target.value)} placeholder="25.000" className={inputCls} />
                  </div>
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">star</span>{tp('insLabelFeatures')}</h2>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={form.newFeature} onChange={e => set('newFeature', e.target.value)} placeholder={tp('insPlaceholderFeature')} className={inputCls}
                    onKeyDown={e => { if (e.key === 'Enter' && form.newFeature.trim()) { e.preventDefault(); set('features', [...form.features, form.newFeature.trim()]); set('newFeature', ''); } }} />
                  <button type="button" onClick={() => { if (form.newFeature.trim()) { set('features', [...form.features, form.newFeature.trim()]); set('newFeature', ''); } }}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-bold shrink-0">+</button>
                </div>
                {form.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.features.map((f, i) => (
                      <span key={i} className="bg-surface-container-low px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        {f}
                        <button type="button" onClick={() => set('features', form.features.filter((_, idx) => idx !== i))} className="text-on-surface-variant hover:text-error">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">location_on</span>{tp('insLabelLocation')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>{tp('insLabelCountry')}</label>
                    <select value={selectedCountry} onChange={e => { setSelectedCountry(e.target.value); setSelectedGov(''); set('governorate', ''); }} className={inputCls}>
                      <option value="">{tp('insSelect')}</option>
                      {getCountries(locale).map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>{tp('insLabelGov')}</label>
                    <select value={selectedGov} onChange={e => { setSelectedGov(e.target.value); const g = governorateOptions.find(x => x.value === e.target.value); set('governorate', g?.label ?? ''); }} className={inputCls}>
                      <option value="">{tp('insSelect')}</option>
                      {governorateOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">map</span>{tp('insLabelMap')}</h2>
                <LocationPicker latitude={form.latitude} longitude={form.longitude} onChange={(lat, lng) => { set('latitude', lat); set('longitude', lng); }} />
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">contact_phone</span>{tp('insLabelContact')}</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>{tp('insLabelPhone')}</label>
                      <input type="tel" value={form.contactPhone} onChange={e => set('contactPhone', e.target.value)} placeholder="+968..." className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>{tp('insLabelWhatsapp')}</label>
                      <input type="tel" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+968..." className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{tp('insLabelWebsite')}</label>
                    <input type="url" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>{tp('insLabelTerms')}</label>
                    <input type="url" value={form.termsUrl} onChange={e => set('termsUrl', e.target.value)} placeholder="https://..." className={inputCls} />
                  </div>
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">add_photo_alternate</span>{tp('insLabelPhotos') || 'الصور'}</h2>
                <ImageUploader images={images} onChange={setImages} disabled={isLoading} />
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
