'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ImageUploader, type UploadedImage } from './image-uploader';
import { useBrands, useCarModels, useCarYears } from '@/lib/api';
import { getCountries, getGovernorates, getCities } from '@/lib/location-data';
import { FUEL_LABELS, TRANSMISSION_LABELS, CONDITION_LABELS, CANCEL_LABELS, BODY_OPTIONS, DRIVE_OPTIONS, CANCEL_OPTIONS } from '@/lib/constants/mappings';
import { MultiStepForm } from '@/components/ui/multi-step-form';
import { FormErrorOverlay } from '@/components/form-error-overlay';

const LocationPicker = dynamic(() => import('@/components/map/location-picker'), { ssr: false });

export interface ListingFormData {
  title: string;
  make: string;
  model: string;
  year: number;
  price: string;
  currency: string;
  mileage: string;
  fuelType: string;
  transmission: string;
  condition: string;
  bodyType: string;
  exteriorColor: string;
  engineSize: string;
  horsepower: string;
  doors: string;
  seats: string;
  driveType: string;
  description: string;
  governorate: string;
  city: string;
  latitude: number | null;
  longitude: number | null;
  isPriceNegotiable: boolean;
  listingType: 'SALE' | 'RENTAL';
  dailyPrice: string;
  weeklyPrice: string;
  monthlyPrice: string;
  minRentalDays: string;
  depositAmount: string;
  kmLimitPerDay: string;
  withDriver: boolean;
  deliveryAvailable: boolean;
  insuranceIncluded: boolean;
  cancellationPolicy: string;
}

const defaultData: ListingFormData = {
  title: '',
  make: '',
  model: '',
  year: new Date().getFullYear(),
  price: '',
  currency: 'OMR',
  mileage: '',
  fuelType: '',
  transmission: '',
  condition: '',
  bodyType: '',
  exteriorColor: '',
  engineSize: '',
  horsepower: '',
  doors: '',
  seats: '',
  driveType: '',
  description: '',
  governorate: '',
  city: '',
  latitude: null,
  longitude: null,
  isPriceNegotiable: false,
  listingType: 'SALE',
  dailyPrice: '',
  weeklyPrice: '',
  monthlyPrice: '',
  minRentalDays: '1',
  depositAmount: '',
  kmLimitPerDay: '',
  withDriver: false,
  deliveryAvailable: false,
  insuranceIncluded: false,
  cancellationPolicy: '',
};

interface ListingFormProps {
  initialData?: Partial<ListingFormData>;
  initialImages?: UploadedImage[];
  onSubmit: (data: Record<string, unknown>, images: UploadedImage[]) => Promise<void>;
  isLoading: boolean;
  errorMessages: string[];
  onClearErrors: () => void;
  submitLabel: string;
}

const fuelOptions = ['PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC'];
const transOptions = ['AUTOMATIC', 'MANUAL'];
const condOptions = ['NEW', 'USED', 'LIKE_NEW'];
const bodyOptions = [...BODY_OPTIONS];
const driveOptions = [...DRIVE_OPTIONS];

const fuelLabels = FUEL_LABELS;
const transLabels = TRANSMISSION_LABELS;
const condLabels = CONDITION_LABELS;
const cancelOptions = [...CANCEL_OPTIONS];
const cancelLabels = CANCEL_LABELS;

export function ListingForm({ initialData, initialImages, onSubmit, isLoading, errorMessages, onClearErrors, submitLabel }: ListingFormProps) {
  const [form, setForm] = useState<ListingFormData>({ ...defaultData, ...initialData });
  const [images, setImages] = useState<UploadedImage[]>(initialImages ?? []);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [selectedModelId, setSelectedModelId] = useState('');

  const { data: brands = [] } = useBrands();
  const { data: models = [] } = useCarModels(selectedBrandId);
  const { data: years = [] } = useCarYears(selectedModelId);

  const [selectedCountry, setSelectedCountry] = useState('OM');
  const [selectedGov, setSelectedGov] = useState('');
  const governorateOptions = getGovernorates(selectedCountry);
  const cityOptions = getCities(selectedCountry, selectedGov);

  useEffect(() => {
    if (initialData) setForm((prev) => ({ ...prev, ...initialData }));
  }, [initialData]);

  useEffect(() => {
    if (initialImages) setImages(initialImages);
  }, [initialImages]);

  function set<K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const isRental = form.listingType === 'RENTAL';
    const payload: Record<string, unknown> = {
      title: form.title,
      make: form.make,
      model: form.model,
      year: form.year,
      price: isRental ? 0 : parseFloat(form.price),
      currency: form.currency,
      description: form.description,
      isPriceNegotiable: isRental ? false : form.isPriceNegotiable,
      listingType: form.listingType,
    };
    if (form.mileage) payload.mileage = parseInt(form.mileage);
    if (form.fuelType) payload.fuelType = form.fuelType;
    if (form.transmission) payload.transmission = form.transmission;
    if (form.condition) payload.condition = form.condition;
    if (form.bodyType) payload.bodyType = form.bodyType;
    if (form.exteriorColor) payload.exteriorColor = form.exteriorColor;
    if (form.engineSize) payload.engineSize = form.engineSize;
    if (form.horsepower) payload.horsepower = parseInt(form.horsepower);
    if (form.doors) payload.doors = parseInt(form.doors);
    if (form.seats) payload.seats = parseInt(form.seats);
    if (form.driveType) payload.driveType = form.driveType;
    if (form.governorate) payload.governorate = form.governorate;
    if (form.city) payload.city = form.city;
    if (form.latitude) payload.latitude = form.latitude;
    if (form.longitude) payload.longitude = form.longitude;

    if (isRental) {
      if (form.dailyPrice) payload.dailyPrice = parseFloat(form.dailyPrice);
      if (form.weeklyPrice) payload.weeklyPrice = parseFloat(form.weeklyPrice);
      if (form.monthlyPrice) payload.monthlyPrice = parseFloat(form.monthlyPrice);
      if (form.minRentalDays) payload.minRentalDays = parseInt(form.minRentalDays);
      if (form.depositAmount) payload.depositAmount = parseFloat(form.depositAmount);
      if (form.kmLimitPerDay) payload.kmLimitPerDay = parseInt(form.kmLimitPerDay);
      payload.withDriver = form.withDriver;
      payload.deliveryAvailable = form.deliveryAvailable;
      payload.insuranceIncluded = form.insuranceIncluded;
      if (form.cancellationPolicy) payload.cancellationPolicy = form.cancellationPolicy;
    }

    await onSubmit(payload, images);
  }

  const [step, setStep] = useState(0);

  const inputCls = 'w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm';
  const labelCls = 'text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-2';

  const steps = [
    { label: 'البيانات الأساسية' },
    { label: 'تفاصيل السيارة والملكية' },
    { label: 'تفاصيل الإعلان وبيانات الاتصال' },
  ];

  const canProceedStep0 = !!form.make && !!form.model && !!form.year;
  const canProceedStep1 = true;
  const canProceedStep2 = form.listingType === 'RENTAL' ? !!form.dailyPrice : !!form.price;
  const canProceed = step === 0 ? canProceedStep0 : step === 1 ? canProceedStep1 : canProceedStep2;

  return (
    <MultiStepForm
      steps={steps}
      currentStep={step}
      onNext={() => setStep(s => Math.min(s + 1, steps.length - 1))}
      onBack={() => setStep(s => Math.max(s - 1, 0))}
      onSubmit={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
      isLoading={isLoading}
      submitLabel={submitLabel}
      canProceed={canProceed}
      title={form.listingType === 'RENTAL' ? 'تأجير سيارتك' : 'بيع سيارتك'}
    >
      {/* ═══ Step 1: البيانات الأساسية ═══ */}
      {step === 0 && (
        <div className="space-y-8">
          {/* Listing Type Toggle */}
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-extrabold">القسم</h2>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-3">
              <span className="text-primary text-lg">🚗</span>
              <span className="text-sm text-on-surface-variant">عربيات وقطع غيار</span>
              <span className="text-on-surface-variant/40 mx-1">›</span>
              <span className="text-sm font-bold text-on-surface">{form.listingType === 'RENTAL' ? 'سيارات للإيجار' : 'سيارات للبيع'}</span>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => set('listingType', 'SALE')}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  form.listingType === 'SALE'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                بيع
              </button>
              <button
                type="button"
                onClick={() => set('listingType', 'RENTAL')}
                className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all ${
                  form.listingType === 'RENTAL'
                    ? 'bg-primary text-on-primary shadow-lg'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                إيجار
              </button>
            </div>
          </section>

          {/* Images */}
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-extrabold">تحميل الصور</h2>
            </div>
            <ImageUploader images={images} onChange={setImages} disabled={isLoading} />
            <p className="text-xs text-on-surface-variant mt-3">استخدم الوضع الأفقي في الكاميرا للحصول على صور غلاف أفضل</p>
          </section>

          {/* Basic Info */}
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-extrabold">البيانات الأساسية للسيارة</h2>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>الماركة *</label>
                  <select required value={selectedBrandId} onChange={(e) => {
                    const brand = brands.find(b => b.id === e.target.value);
                    setSelectedBrandId(e.target.value);
                    setSelectedModelId('');
                    set('make', brand?.name ?? '');
                    set('model', '');
                    set('year', 0);
                  }} className={inputCls}>
                    <option value="">اختر الماركة</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.nameAr || b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>الموديل *</label>
                  <select required value={selectedModelId} onChange={(e) => {
                    const model = models.find(m => m.id === e.target.value);
                    setSelectedModelId(e.target.value);
                    set('model', model?.name ?? '');
                    set('year', 0);
                  }} className={inputCls} disabled={!selectedBrandId}>
                    <option value="">{selectedBrandId ? 'اختر الموديل' : 'اختر الماركة أولاً'}</option>
                    {models.map((m) => <option key={m.id} value={m.id}>{m.nameAr || m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>سنة الصنع *</label>
                  <select required value={form.year || ''} onChange={(e) => set('year', parseInt(e.target.value))} className={inputCls} disabled={!selectedModelId}>
                    <option value="">{selectedModelId ? 'اختر السنة' : 'اختر الموديل أولاً'}</option>
                    {years.map((y) => <option key={y.id} value={y.year}>{y.year}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>الحالة *</label>
                  <div className="flex gap-3">
                    {condOptions.map((c) => (
                      <button key={c} type="button" onClick={() => set('condition', c)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${form.condition === c ? 'bg-primary text-white' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}>
                        {condLabels[c]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>الكيلومترات</label>
                  <input type="number" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} placeholder="أدخل كيلومترات، على سبيل المثال 42,500" className={inputCls} />
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ═══ Step 2: تفاصيل السيارة والملكية ═══ */}
      {step === 1 && (
        <div className="space-y-8">
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-extrabold">تفاصيل السيارة</h2>
            </div>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>نوع الوقود</label>
                  <select value={form.fuelType} onChange={(e) => set('fuelType', e.target.value)} className={inputCls}>
                    <option value="">اختر</option>
                    {fuelOptions.map((f) => <option key={f} value={f}>{fuelLabels[f]}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>ناقل الحركة</label>
                  <select value={form.transmission} onChange={(e) => set('transmission', e.target.value)} className={inputCls}>
                    <option value="">اختر</option>
                    {transOptions.map((t) => <option key={t} value={t}>{transLabels[t]}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>نوع الهيكل</label>
                  <select value={form.bodyType} onChange={(e) => set('bodyType', e.target.value)} className={inputCls}>
                    <option value="">اختر</option>
                    {bodyOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>نوع الدفع</label>
                  <select value={form.driveType} onChange={(e) => set('driveType', e.target.value)} className={inputCls}>
                    <option value="">اختر</option>
                    {driveOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>اللون</label>
                  <input type="text" value={form.exteriorColor} onChange={(e) => set('exteriorColor', e.target.value)} placeholder="أبيض" className={inputCls} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>حجم المحرك</label>
                  <input type="text" value={form.engineSize} onChange={(e) => set('engineSize', e.target.value)} placeholder="2.5L" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>القوة (حصان)</label>
                  <input type="number" value={form.horsepower} onChange={(e) => set('horsepower', e.target.value)} placeholder="200" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>الأبواب</label>
                  <input type="number" value={form.doors} onChange={(e) => set('doors', e.target.value)} placeholder="4" className={inputCls} />
                </div>
              </div>
            </div>
          </section>

          {/* Rental-specific fields */}
          {form.listingType === 'RENTAL' && (
            <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-lg font-extrabold">تفاصيل الإيجار</h2>
              </div>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>أقل مدة إيجار (أيام)</label>
                    <input type="number" min="1" value={form.minRentalDays} onChange={(e) => set('minRentalDays', e.target.value)} placeholder="1" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>حد الكيلومترات / يوم</label>
                    <input type="number" value={form.kmLimitPerDay} onChange={(e) => set('kmLimitPerDay', e.target.value)} placeholder="250" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>سياسة الإلغاء</label>
                    <select value={form.cancellationPolicy} onChange={(e) => set('cancellationPolicy', e.target.value)} className={inputCls}>
                      <option value="">اختر</option>
                      {cancelOptions.map((c) => <option key={c} value={c}>{cancelLabels[c]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer bg-surface-container-low rounded-xl p-3">
                    <input type="checkbox" checked={form.withDriver} onChange={(e) => set('withDriver', e.target.checked)} className="w-5 h-5 accent-primary" />
                    <span className="text-sm font-medium text-on-surface">مع سائق</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer bg-surface-container-low rounded-xl p-3">
                    <input type="checkbox" checked={form.deliveryAvailable} onChange={(e) => set('deliveryAvailable', e.target.checked)} className="w-5 h-5 accent-primary" />
                    <span className="text-sm font-medium text-on-surface">توصيل متاح</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer bg-surface-container-low rounded-xl p-3">
                    <input type="checkbox" checked={form.insuranceIncluded} onChange={(e) => set('insuranceIncluded', e.target.checked)} className="w-5 h-5 accent-primary" />
                    <span className="text-sm font-medium text-on-surface">تأمين شامل</span>
                  </label>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ═══ Step 3: تفاصيل الإعلان وبيانات الاتصال ═══ */}
      {step === 2 && (
        <div className="space-y-8">
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-extrabold">تفاصيل الإعلان</h2>
            </div>
            <div className="space-y-5">
              <div>
                <label className={labelCls}>عنوان الإعلان *</label>
                <input type="text" required value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="مثال: تويوتا كامري 2023 فل كامل" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>الوصف</label>
                <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="صف سيارتك بالتفصيل..." className={inputCls + ' resize-none'} />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-extrabold">{form.listingType === 'RENTAL' ? 'أسعار الإيجار' : 'السعر'}</h2>
            </div>
            {form.listingType === 'SALE' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>السعر المطلوب (ر.ع.) *</label>
                    <input type="number" required step="0.01" value={form.price} onChange={(e) => set('price', e.target.value)} placeholder="0.000" className={inputCls} />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isPriceNegotiable} onChange={(e) => set('isPriceNegotiable', e.target.checked)} className="w-5 h-5 accent-primary" />
                  <span className="text-sm font-medium text-on-surface">السعر قابل للتفاوض</span>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>السعر اليومي (ر.ع.) *</label>
                    <input type="number" required step="0.001" value={form.dailyPrice} onChange={(e) => set('dailyPrice', e.target.value)} placeholder="15.000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>السعر الأسبوعي (ر.ع.)</label>
                    <input type="number" step="0.001" value={form.weeklyPrice} onChange={(e) => set('weeklyPrice', e.target.value)} placeholder="90.000" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>السعر الشهري (ر.ع.)</label>
                    <input type="number" step="0.001" value={form.monthlyPrice} onChange={(e) => set('monthlyPrice', e.target.value)} placeholder="300.000" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>مبلغ التأمين (ر.ع.)</label>
                  <input type="number" step="0.001" value={form.depositAmount} onChange={(e) => set('depositAmount', e.target.value)} placeholder="50.000" className={inputCls} />
                </div>
              </div>
            )}
          </section>

          {/* Location */}
          <section className="bg-surface-container-lowest rounded-3xl p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-lg font-extrabold">الموقع</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>الدولة</label>
                <select value={selectedCountry} onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedGov('');
                  set('governorate', '');
                  set('city', '');
                }} className={inputCls}>
                  <option value="">اختر الدولة</option>
                  {getCountries().map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>المحافظة</label>
                <select value={selectedGov} onChange={(e) => {
                  setSelectedGov(e.target.value);
                  const gov = governorateOptions.find(g => g.value === e.target.value);
                  set('governorate', gov?.label ?? '');
                  set('city', '');
                }} className={inputCls} disabled={!selectedCountry}>
                  <option value="">{selectedCountry ? 'اختر المحافظة' : 'اختر الدولة أولاً'}</option>
                  {governorateOptions.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>المدينة</label>
                <select value={form.city} onChange={(e) => set('city', e.target.value)} className={inputCls} disabled={!selectedGov}>
                  <option value="">{selectedGov ? 'اختر المدينة' : 'اختر المحافظة أولاً'}</option>
                  {cityOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6">
              <label className={labelCls}>حدد الموقع على الخريطة (اختياري)</label>
              <LocationPicker
                latitude={form.latitude}
                longitude={form.longitude}
                onChange={(lat, lng) => {
                  set('latitude', lat);
                  set('longitude', lng);
                }}
              />
            </div>
          </section>

          {errorMessages.length > 0 && <FormErrorOverlay messages={errorMessages} onClose={onClearErrors} />}
        </div>
      )}
    </MultiStepForm>
  );
}
