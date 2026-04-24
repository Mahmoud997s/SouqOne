'use client';

import { Suspense, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { DetailSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { FormEngine } from '@/components/form-engine';
import { listingFormConfigs } from '@/config/listing-forms';
import { useBusListing, useUpdateBusListing } from '@/lib/api/buses';
import { useEquipmentListing, useUpdateEquipmentListing, useOperatorListing, useUpdateOperatorListing } from '@/lib/api/equipment';
import { usePart, useUpdatePart } from '@/lib/api/parts';
import { useCarService, useUpdateCarService } from '@/lib/api/services';
import { getImageUrl } from '@/lib/image-utils';
import type { UploadedImage } from '@/features/ads/components/image-uploader';

/** Fetch + update hooks keyed by listing type */
function useFetchAndUpdate(type: string, id: string) {
  const bus = useBusListing(type === 'bus' ? id : '');
  const busUpdate = useUpdateBusListing();

  const equipment = useEquipmentListing(type === 'equipment' ? id : '');
  const equipUpdate = useUpdateEquipmentListing();

  const parts = usePart(type === 'parts' ? id : '');
  const partsUpdate = useUpdatePart();

  const service = useCarService(type === 'service' ? id : '');
  const serviceUpdate = useUpdateCarService();

  const operator = useOperatorListing(type === 'operator' ? id : '');
  const operatorUpdate = useUpdateOperatorListing();

  const map: Record<string, {
    data: any;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
    update: any;
  }> = {
    bus: { ...bus, update: busUpdate },
    equipment: { ...equipment, update: equipUpdate },
    parts: { ...parts, update: partsUpdate },
    service: { ...service, update: serviceUpdate },
    operator: { ...operator, update: operatorUpdate },
  };

  return map[type] ?? null;
}

export default function DynamicEditListingPage() {
  const { type, id } = useParams<{ type: string; id: string }>();

  const config = listingFormConfigs[type];
  if (!config) return notFound();

  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4">
            <DetailSkeleton />
          </main>
        </>
      }
    >
      <EditListingContent type={type} id={id} />
    </Suspense>
  );
}

function EditListingContent({ type, id }: { type: string; id: string }) {
  const config = listingFormConfigs[type]!;
  const result = useFetchAndUpdate(type, id);

  // Convert existing images to UploadedImage format
  const initialData = useMemo(() => {
    if (!result?.data) return undefined;
    const raw = result.data as Record<string, any>;
    const data: Record<string, unknown> = {};

    // Copy all scalar fields
    for (const [key, val] of Object.entries(raw)) {
      if (key === 'images' && Array.isArray(val)) {
        // Convert API images to UploadedImage[]
        data.images = val.map((img: any, idx: number) => ({
          id: img.id,
          url: getImageUrl(img.url || img.imageUrl),
          isPrimary: img.isPrimary ?? idx === 0,
          order: img.order ?? idx,
        })) as UploadedImage[];
      } else if (key !== 'createdAt' && key !== 'updatedAt' && key !== 'deletedAt' && key !== 'user' && key !== 'userId') {
        data[key] = val;
      }
    }

    return data;
  }, [result?.data]);

  const handleSubmit = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!result?.update) throw new Error('Unknown listing type');
      const updated = await result.update.mutateAsync({ id, data: payload });
      return { id: (updated as any).id ?? id };
    },
    [result?.update, id],
  );

  if (result?.isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4">
          <DetailSkeleton />
        </main>
      </>
    );
  }

  if (result?.isError) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4">
          <ErrorState onRetry={result.refetch} />
        </main>
      </>
    );
  }

  return (
    <FormEngine
      config={config}
      mode="edit"
      entityId={id}
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={result?.update?.isPending}
    />
  );
}
