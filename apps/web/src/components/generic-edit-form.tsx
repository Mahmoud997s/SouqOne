'use client';

import { useState, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { DetailSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { ImageUploader, type UploadedImage } from '@/features/ads/components/image-uploader';
import { getAuthToken } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { API_BASE } from '@/lib/config';
import { getImageUrl } from '@/lib/image-utils';
import { getGovernorates } from '@/lib/location-data';
import { inputCls, labelCls, sectionCls, sectionTitleCls } from '@/lib/constants/form-styles';
import { useTranslations } from 'next-intl';

interface FieldConfig {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select';
  options?: { value: string; label: string }[];
  required?: boolean;
}

interface GenericEditFormProps {
  title: string;
  subtitle: string;
  item: Record<string, any>;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  fields: FieldConfig[];
  updateFn: (data: Record<string, unknown>) => Promise<any>;
  isUpdating: boolean;
  redirectPath: string;
  uploadEndpoint?: string;
  deleteImageFn?: (imageId: string) => Promise<any>;
}

export function GenericEditForm({
  title,
  subtitle,
  item,
  isLoading,
  isError,
  refetch,
  fields,
  updateFn,
  isUpdating,
  redirectPath,
  uploadEndpoint,
  deleteImageFn,
}: GenericEditFormProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const tp = useTranslations('pages');
  const governorates = getGovernorates('OM');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const initialImageIdsRef = useRef<string[]>([]);

  // Initialize form data from item
  if (item && !initialized) {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.name] = item[f.name] ?? '';
    });
    setFormData(initial);
    // Initialize images
    if (item.images?.length) {
      const sorted = item.images
        .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
        .map((img: any, i: number) => ({
          id: img.id,
          url: getImageUrl(img.url) || img.url,
          isPrimary: img.isPrimary ?? i === 0,
          order: i,
        }));
      setImages(sorted);
      initialImageIdsRef.current = sorted.map((img: any) => img.id).filter(Boolean);
    }
    setInitialized(true);
  }

  function handleChange(name: string, value: any) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // Only send changed fields
      const payload: Record<string, unknown> = {};
      fields.forEach((f) => {
        const val = formData[f.name];
        if (val !== undefined && val !== '') {
          payload[f.name] = f.type === 'number' ? Number(val) : val;
        }
      });

      await updateFn(payload);

      // Delete removed images from backend
      if (deleteImageFn) {
        const currentIds = new Set(images.filter(img => img.id).map(img => img.id));
        const removedIds = initialImageIdsRef.current.filter(imgId => !currentIds.has(imgId));
        for (const imgId of removedIds) {
          await deleteImageFn(imgId);
        }
      }

      // Upload new images
      if (uploadEndpoint) {
        const newImages = images.filter((img) => img.file);
        if (newImages.length > 0) {
          setUploading(true);
          const token = getAuthToken();
          for (const img of newImages) {
            if (img.file) {
              const fd = new FormData();
              fd.append('file', img.file);
              fd.append('isPrimary', String(img.isPrimary));
              await fetch(`${API_BASE}${uploadEndpoint}`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: fd,
              });
            }
          }
          setUploading(false);
        }
      }

      addToast('success', tp('editListingSaved'));
      router.push(redirectPath);
    } catch (err) {
      setUploading(false);
      addToast('error', err instanceof Error ? err.message : tp('editListingError'));
    }
  }

  if (isLoading) return <><Navbar /><DetailSkeleton /></>;
  if (isError || !item) return <><Navbar /><div className="pt-28 px-8"><ErrorState onRetry={refetch} /></div></>;

  const isBusy = isUpdating || uploading;

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{title}</h1>
          <p className="text-on-surface-variant">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main fields */}
          <div className={sectionCls}>
            <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">edit_note</span>{tp('editListingBasicInfo')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => {
                if (field.name === 'governorate') {
                  return (
                    <div key={field.name}>
                      <label className={labelCls}>{field.label}</label>
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={inputCls}
                      >
                        <option value="">{tp('editListingSelectGovernorate')}</option>
                        {governorates.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (field.type === 'select' && field.options) {
                  return (
                    <div key={field.name}>
                      <label className={labelCls}>{field.label}</label>
                      <select
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={inputCls}
                      >
                        <option value="">---</option>
                        {field.options.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  );
                }
                if (field.type === 'textarea') {
                  return (
                    <div key={field.name} className="md:col-span-2">
                      <label className={labelCls}>{field.label}</label>
                      <textarea
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className={`${inputCls} min-h-[100px]`}
                        rows={4}
                      />
                    </div>
                  );
                }
                return (
                  <div key={field.name}>
                    <label className={labelCls}>{field.label}</label>
                    <input
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className={inputCls}
                      required={field.required}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Images */}
          {uploadEndpoint && (
            <div className={sectionCls}>
              <h2 className={sectionTitleCls}><span className="material-symbols-outlined text-primary text-lg">add_photo_alternate</span>{tp('editListingImages')}</h2>
              <ImageUploader images={images} onChange={setImages} maxImages={10} />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isBusy}
            className="w-full bg-primary text-on-primary py-3.5 rounded-2xl text-sm font-black hover:brightness-110 transition-all disabled:opacity-50 shadow-lg"
          >
            {isBusy ? (
              <span className="flex items-center justify-center gap-2"><span className="material-symbols-outlined animate-spin text-base">progress_activity</span>{tp('editListingUploading')}</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><span className="material-symbols-outlined text-base">save</span>{tp('editListingSave')}</span>
            )}
          </button>
        </form>
      </main>
      <Footer />
    </AuthGuard>
  );
}
