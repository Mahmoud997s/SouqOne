'use client';

import { Suspense, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { FormEngine } from '@/components/form-engine';
import { listingFormConfigs } from '@/config/listing-forms';
import { useCreateBusListing } from '@/lib/api/buses';
import { useCreateEquipmentListing, useCreateOperatorListing } from '@/lib/api/equipment';
import { useCreatePart } from '@/lib/api/parts';
import { useCreateCarService } from '@/lib/api/services';

/** Map config type → the React hook that creates it */
function useCreateMutation(type: string) {
  const bus = useCreateBusListing();
  const equipment = useCreateEquipmentListing();
  const parts = useCreatePart();
  const service = useCreateCarService();
  const operator = useCreateOperatorListing();

  const map: Record<string, any> = {
    bus,
    equipment,
    parts,
    service,
    operator,
  };

  return map[type] ?? null;
}

export default function DynamicAddListingPage() {
  const { type } = useParams<{ type: string }>();

  // If it's a known static route (like 'car'), let the existing page handle it
  // If it's an unknown type, 404
  const config = listingFormConfigs[type];
  if (!config) return notFound();

  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <main className="pt-28 pb-16 max-w-[900px] mx-auto px-4">
            <div className="animate-pulse bg-surface-container-low h-96 rounded-3xl" />
          </main>
        </>
      }
    >
      <AddListingContent type={type} />
    </Suspense>
  );
}

function AddListingContent({ type }: { type: string }) {
  const config = listingFormConfigs[type]!;
  const mutation = useCreateMutation(type);

  const handleSubmit = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!mutation) throw new Error('Unknown listing type');
      const result = await mutation.mutateAsync(payload);
      return { id: (result as any).id ?? (result as any)._id ?? String(result) };
    },
    [mutation],
  );

  return (
    <FormEngine
      config={config}
      mode="create"
      onSubmit={handleSubmit}
      isSubmitting={mutation?.isPending}
    />
  );
}
