'use client';

import { useParams } from 'next/navigation';
import { GenericEditForm } from '@/components/generic-edit-form';
import { useInsuranceOffer, useUpdateInsurance } from '@/lib/api/insurance';
import { useTranslations } from 'next-intl';

export default function EditInsurancePage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useInsuranceOffer(id);
  const update = useUpdateInsurance();
  const tp = useTranslations('pages');

  const fields = [
    { name: 'title', label: 'Title', required: true },
    { name: 'insuranceType', label: 'Insurance Type', type: 'select' as const, options: [
      { value: 'COMPREHENSIVE', label: 'Comprehensive' },
      { value: 'THIRD_PARTY', label: 'Third Party' },
      { value: 'AGAINST_OTHERS', label: 'Against Others' },
    ]},
    { name: 'provider', label: 'Provider' },
    { name: 'price', label: 'Price', type: 'number' as const },
    { name: 'coverageAmount', label: 'Coverage Amount', type: 'number' as const },
    { name: 'governorate', label: 'Governorate' },
    { name: 'description', label: 'Description', type: 'textarea' as const },
  ];

  return (
    <GenericEditForm
      title={tp('editListingTitle')}
      subtitle={tp('editListingDesc')}
      item={data as Record<string, any>}
      isLoading={isLoading}
      isError={isError}
      refetch={refetch}
      fields={fields}
      updateFn={(payload) => update.mutateAsync({ id, data: payload })}
      isUpdating={update.isPending}
      redirectPath={`/insurance/${id}`}
    />
  );
}
