'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { ListingForm, ListingFormData } from '@/features/ads/components/listing-form';
import type { UploadedImage } from '@/features/ads/components/image-uploader';
import { DetailSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { useListing, useUpdateListing } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { API_BASE } from '@/lib/config';
import { getImageUrl } from '@/lib/image-utils';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: car, isLoading, isError, refetch } = useListing(id);
  const updateListing = useUpdateListing(id);
  const { addToast } = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(data: Record<string, unknown>, images: UploadedImage[]) {
    setErrorMessages([]);
    try {
      await updateListing.mutateAsync(data);

      // Upload new images (those with a File object)
      const newImages = images.filter((img) => img.file);
      if (newImages.length > 0) {
        setUploading(true);
        const token = getAuthToken();

        for (const img of newImages) {
          if (img.file) {
            const formData = new FormData();
            formData.append('file', img.file);
            formData.append('isPrimary', String(img.isPrimary));

            await fetch(`${API_BASE}/api/v1/uploads/listings/${id}/images`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData,
            });
          }
        }
        setUploading(false);
      }

      addToast('success', 'تم حفظ التعديلات بنجاح!');
      router.push(`/cars/${id}`);
    } catch (err) {
      setUploading(false);
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الإعلان';
      setErrorMessages(msg.split('\n').filter(Boolean));
    }
  }

  if (isLoading) return <><Navbar /><DetailSkeleton /></>;
  if (isError || !car) return <><Navbar /><div className="pt-28 px-8"><ErrorState onRetry={() => refetch()} /></div></>;

  const initialData: Partial<ListingFormData> = {
    title: car.title,
    make: car.make,
    model: car.model,
    year: car.year,
    price: String(car.price),
    currency: car.currency,
    mileage: car.mileage ? String(car.mileage) : '',
    fuelType: car.fuelType || '',
    transmission: car.transmission || '',
    condition: car.condition || '',
    bodyType: car.bodyType || '',
    exteriorColor: car.exteriorColor || '',
    engineSize: car.engineSize || '',
    horsepower: car.horsepower ? String(car.horsepower) : '',
    doors: car.doors ? String(car.doors) : '',
    seats: car.seats ? String(car.seats) : '',
    driveType: car.driveType || '',
    description: car.description || '',
    governorate: car.governorate || '',
    city: car.city || '',
    isPriceNegotiable: car.isPriceNegotiable,
  };

  // Convert existing DB images to UploadedImage format
  const existingImages: UploadedImage[] = (car.images || [])
    .sort((a, b) => {
      const aOrder = 'order' in a ? (a as { order: number }).order : 0;
      const bOrder = 'order' in b ? (b as { order: number }).order : 0;
      return aOrder - bOrder;
    })
    .map((img, i) => ({
      id: img.id,
      url: getImageUrl(img.url) || img.url,
      isPrimary: img.isPrimary,
      order: i,
    }));

  const isBusy = updateListing.isPending || uploading;

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">تعديل الإعلان</h1>
          <p className="text-on-surface-variant">عدّل تفاصيل إعلانك وأعد نشره.</p>
        </div>

        <ListingForm
          initialData={initialData}
          initialImages={existingImages}
          onSubmit={handleSubmit}
          isLoading={isBusy}
          errorMessages={errorMessages}
          onClearErrors={() => setErrorMessages([])}
          submitLabel={uploading ? 'جارٍ رفع الصور...' : 'حفظ التعديلات'}
        />
      </main>
      <Footer />
    </AuthGuard>
  );
}
