'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { ImageUploader, type UploadedImage } from '@/features/ads/components/image-uploader';
import { useSearchBrands } from '@/lib/api';
import { getCountries, getGovernorates, getCities } from '@/lib/location-data';
import { useLocale } from 'next-intl';
import { inputCls, labelCls, chipCls } from '@/lib/constants/form-styles';
import type {
  FieldConfig,
  FieldOption,
  FormValues,
} from '@/types/form-config';

const LocationPicker = dynamic(
  () => import('@/components/map/location-picker'),
  { ssr: false },
);

/* ═══════════════════════════════════════════════════════════
 * Shared props every field renderer receives
 * ═══════════════════════════════════════════════════════════ */

export interface FieldRendererProps {
  field: FieldConfig;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  tp: ReturnType<typeof useTranslations>;
  allValues: FormValues;
}

/* ═══════════════════════════════════════════════════════════
 * 1. Text Field
 * ═══════════════════════════════════════════════════════════ */

function TextField({ field, value, onChange, tp }: FieldRendererProps) {
  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <input
        type="text"
        className={inputCls}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholderKey ? tp(field.placeholderKey) : undefined}
      />
      {field.hintKey && (
        <p className="text-[11px] text-on-surface-variant mt-1">{tp(field.hintKey)}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 2. Textarea Field
 * ═══════════════════════════════════════════════════════════ */

function TextareaField({ field, value, onChange, tp }: FieldRendererProps) {
  const rows = field.type === 'textarea' && 'rows' in field ? (field as any).rows ?? 4 : 4;
  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <textarea
        className={inputCls + ' min-h-[100px] resize-none'}
        rows={rows}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholderKey ? tp(field.placeholderKey) : undefined}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 3. Number Field
 * ═══════════════════════════════════════════════════════════ */

function NumberField({ field, value, onChange, tp }: FieldRendererProps) {
  const cfg = field as Extract<FieldConfig, { type: 'number' }>;
  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <input
        type="number"
        className={inputCls}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
        placeholder={field.placeholderKey ? tp(field.placeholderKey) : undefined}
        step={cfg.step}
        min={cfg.min}
        max={cfg.max}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 4. Select (Dropdown) Field
 * ═══════════════════════════════════════════════════════════ */

function SelectField({ field, value, onChange, tp }: FieldRendererProps) {
  const options = (field as Extract<FieldConfig, { type: 'select' }>).options;
  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <select
        className={inputCls}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
      >
        <option value="">{tp('lfSelect')}</option>
        {options.map((opt: FieldOption) => (
          <option key={opt.value} value={opt.value}>
            {tp(opt.labelKey)}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 5. Chip Select (single selection chips)
 * ═══════════════════════════════════════════════════════════ */

function ChipSelectField({ field, value, onChange, tp }: FieldRendererProps) {
  const options = (field as Extract<FieldConfig, { type: 'chip-select' }>).options;
  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: FieldOption) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(field.name, opt.value)}
            className={chipCls((value as string) === opt.value)}
          >
            {tp(opt.labelKey)}
            {opt.descKey && (
              <span className="text-[10px] opacity-60 ms-1">({tp(opt.descKey)})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 6. Card Select (big cards with icon + description)
 * ═══════════════════════════════════════════════════════════ */

function CardSelectField({ field, value, onChange, tp }: FieldRendererProps) {
  const cfg = field as Extract<FieldConfig, { type: 'card-select' }>;
  const cols = cfg.columns ?? 2;
  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cfg.options.map((opt: FieldOption) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(field.name, opt.value)}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-start ${
              (value as string) === opt.value
                ? 'border-primary bg-primary/5 dark:bg-primary/10'
                : 'border-outline-variant/20 hover:border-outline-variant/40'
            }`}
          >
            {opt.icon && (
              <span
                className={`material-symbols-outlined text-2xl mt-0.5 ${
                  (value as string) === opt.value ? 'text-primary' : 'text-on-surface-variant'
                }`}
              >
                {opt.icon}
              </span>
            )}
            <div>
              <p className="font-black text-on-surface text-sm">{tp(opt.labelKey)}</p>
              {opt.descKey && (
                <p className="text-xs text-on-surface-variant mt-0.5">{tp(opt.descKey)}</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 7. Multi Chip (multi-selection chips)
 * ═══════════════════════════════════════════════════════════ */

function MultiChipField({ field, value, onChange, tp }: FieldRendererProps) {
  const options = (field as Extract<FieldConfig, { type: 'multi-chip' }>).options;
  const selected = (value as string[]) ?? [];

  function toggle(v: string) {
    const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v];
    onChange(field.name, next);
  }

  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: FieldOption) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={chipCls(selected.includes(opt.value))}
          >
            {tp(opt.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 8. Checkbox Field
 * ═══════════════════════════════════════════════════════════ */

function CheckboxField({ field, value, onChange, tp }: FieldRendererProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(field.name, e.target.checked)}
        className="w-4 h-4 rounded accent-primary"
      />
      <span className="text-sm font-bold text-on-surface">{tp(field.labelKey)}</span>
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 9. Date Field
 * ═══════════════════════════════════════════════════════════ */

function DateField({ field, value, onChange, tp }: FieldRendererProps) {
  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <input
        type="date"
        className={inputCls}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 10. Time Field
 * ═══════════════════════════════════════════════════════════ */

function TimeField({ field, value, onChange, tp }: FieldRendererProps) {
  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <input
        type="time"
        className={inputCls}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 11. Image Upload Field
 * ═══════════════════════════════════════════════════════════ */

function ImageUploadField({ field, value, onChange }: FieldRendererProps) {
  const cfg = field as Extract<FieldConfig, { type: 'image-upload' }>;
  const images = (value as UploadedImage[]) ?? [];
  return (
    <ImageUploader
      images={images}
      onChange={(imgs) => onChange(field.name, imgs)}
      maxImages={cfg.maxImages ?? 10}
    />
  );
}

/* ═══════════════════════════════════════════════════════════
 * 12. Location Field (Country → Governorate → City + Map)
 * ═══════════════════════════════════════════════════════════ */

function LocationField({ field, value: _value, onChange, tp, allValues }: FieldRendererProps) {
  const cfg = field as Extract<FieldConfig, { type: 'location' }>;
  const locale = useLocale();
  const showCountry = cfg.showCountry !== false;
  const defaultCountry = cfg.defaultCountry ?? 'OM';

  const [country, setCountry] = useState(defaultCountry);
  const [govKey, setGovKey] = useState('');

  const governorateOptions = getGovernorates(country, locale);
  const cityOptions = getCities(country, govKey, locale);

  const cityValue = (allValues['city'] as string) ?? '';
  const lat = (allValues['latitude'] as number | null) ?? null;
  const lng = (allValues['longitude'] as number | null) ?? null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {showCountry && (
          <div>
            <label className={labelCls}>{tp('busLabelCountry')}</label>
            <select
              className={inputCls}
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setGovKey('');
                onChange('governorate', '');
                onChange('city', '');
              }}
            >
              {getCountries(locale).map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className={labelCls}>{tp('busLabelGovernorate')}</label>
          <select
            className={inputCls}
            value={govKey}
            onChange={(e) => {
              setGovKey(e.target.value);
              const g = governorateOptions.find((x) => x.value === e.target.value);
              onChange('governorate', g?.label ?? e.target.value);
              onChange('city', '');
            }}
          >
            <option value="">{tp('busSelectGovernorate')}</option>
            {governorateOptions.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{tp('busLabelCity')}</label>
          <select
            className={inputCls}
            value={cityValue}
            onChange={(e) => onChange('city', e.target.value)}
          >
            <option value="">{tp('busSelectCity')}</option>
            {cityOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-4 rounded-xl overflow-hidden border border-outline-variant/10">
        <LocationPicker
          latitude={lat}
          longitude={lng}
          onChange={(newLat: number, newLng: number) => {
            onChange('latitude', newLat);
            onChange('longitude', newLng);
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * 13. Brands Multi-Select Field
 * ═══════════════════════════════════════════════════════════ */

function BrandsMultiSelectField({ field, value, onChange, tp }: FieldRendererProps) {
  const { data: brands = [] } = useSearchBrands('');
  const selected = (value as string[]) ?? [];

  return (
    <div>
      <label className={labelCls}>{tp(field.labelKey)}</label>
      <select
        multiple
        value={selected}
        onChange={(e) =>
          onChange(
            field.name,
            Array.from(e.target.selectedOptions, (o) => o.value),
          )
        }
        className={inputCls + ' h-28'}
      >
        {brands.map((b: any) => (
          <option key={b.id} value={b.name}>
            {b.nameAr || b.name}
          </option>
        ))}
      </select>
      {field.hintKey && (
        <p className="text-[11px] text-on-surface-variant mt-1">{tp(field.hintKey)}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * Master Field Renderer — dispatches to the correct renderer
 * ═══════════════════════════════════════════════════════════ */

const RENDERERS: Record<string, React.FC<FieldRendererProps>> = {
  text: TextField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  'chip-select': ChipSelectField,
  'card-select': CardSelectField,
  'multi-chip': MultiChipField,
  checkbox: CheckboxField,
  date: DateField,
  time: TimeField,
  'image-upload': ImageUploadField,
  location: LocationField,
  'brands-multi-select': BrandsMultiSelectField,
};

export function renderField(props: FieldRendererProps): React.ReactNode {
  const Renderer = RENDERERS[props.field.type];
  if (!Renderer) {
    console.warn(`[FormEngine] Unknown field type: ${props.field.type}`);
    return null;
  }
  return <Renderer key={props.field.name} {...props} />;
}
