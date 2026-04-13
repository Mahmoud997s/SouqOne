'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { ListingForm } from '@/features/ads/components/listing-form';
import type { UploadedImage } from '@/features/ads/components/image-uploader';
import { useCreateListing } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { useToast } from '@/components/toast';
import { API_BASE } from '@/lib/config';

export default function AddCarListingPage() {
  return (
    <Suspense fallback={<><Navbar /><main className="pt-28 pb-16 max-w-[900px] mx-auto px-4"><div className="animate-pulse bg-surface-container-low h-96 rounded-3xl" /></main></>}>
      <AddCarContent />
    </Suspense>
  );
}

function AddCarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingType = (searchParams.get('type') as 'SALE' | 'RENTAL') || 'SALE';
  const createListing = useCreateListing();
  const { addToast } = useToast();
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(data: Record<string, unknown>, images: UploadedImage[]) {
    setErrorMessages([]);
    try {
      const listing = await createListing.mutateAsync(data);

      if (images.length > 0) {
        setUploading(true);
        const token = getAuthToken();

        for (const img of images) {
          if (img.file) {
            const formData = new FormData();
            formData.append('file', img.file);
            formData.append('isPrimary', String(img.isPrimary));

            await fetch(`${API_BASE}/api/v1/uploads/listings/${listing.id}/images`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData,
            });
          }
        }
        setUploading(false);
      }

      addToast('success', 'تم نشر الإعلان بنجاح!');
      router.push(`/cars/${listing.id}`);
    } catch (err) {
      setUploading(false);
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء إنشاء الإعلان';
      setErrorMessages(msg.split('\n').filter(Boolean));
    }
  }

  const isLoading = createListing.isPending || uploading;

  return (
    <AuthGuard>
      <Navbar />
      <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4 md:px-8">
        <ListingForm
          initialData={{ listingType }}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          errorMessages={errorMessages}
          onClearErrors={() => setErrorMessages([])}
          submitLabel={uploading ? 'جارٍ رفع الصور...' : 'نشر الإعلان'}
        />
      </main>
      <Footer />
    </AuthGuard>
  );
}
