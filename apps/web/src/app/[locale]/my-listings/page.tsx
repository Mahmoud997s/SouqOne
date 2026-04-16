'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { GenericListingCard } from '@/components/generic-listing-card';
import { useMyListings, useDeleteListing } from '@/lib/api';
import { useMyBusListings, useDeleteBusListing } from '@/lib/api/buses';
import { useMyEquipmentListings, useDeleteEquipmentListing, useMyOperatorListings, useDeleteOperatorListing } from '@/lib/api/equipment';
import { useMyParts, useDeletePart } from '@/lib/api/parts';
import { useMyCarServices, useDeleteCarService } from '@/lib/api/services';
import { useMyInsuranceOffers, useDeleteInsurance } from '@/lib/api/insurance';
import { useMyJobs, useDeleteJob } from '@/lib/api/jobs';
import { useCreateFeaturedPayment } from '@/lib/api/payments';
import { getImageUrl } from '@/lib/image-utils';
import { useToast } from '@/components/toast';
import { useTranslations, useLocale } from 'next-intl';

type StatusFilter = 'ALL' | 'ACTIVE' | 'DRAFT' | 'SOLD';

const SECTION_TABS = [
  { key: 'cars', icon: 'directions_car', labelKey: 'sectionCars' },
  { key: 'buses', icon: 'directions_bus', labelKey: 'sectionBuses' },
  { key: 'equipment', icon: 'construction', labelKey: 'sectionEquipment' },
  { key: 'operators', icon: 'engineering', labelKey: 'sectionOperators' },
  { key: 'parts', icon: 'build', labelKey: 'sectionParts' },
  { key: 'services', icon: 'car_repair', labelKey: 'sectionServices' },
  { key: 'insurance', icon: 'shield', labelKey: 'sectionInsurance' },
  { key: 'jobs', icon: 'work', labelKey: 'sectionJobs' },
] as const;

type SectionKey = typeof SECTION_TABS[number]['key'];

export default function MyListingsPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>('cars');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const { addToast } = useToast();
  const tp = useTranslations('pages');
  const locale = useLocale();

  // ─── Car listings ───
  const carParams: Record<string, string> = { limit: '50' };
  if (statusFilter !== 'ALL') carParams.status = statusFilter;
  const cars = useMyListings(carParams);
  const deleteCar = useDeleteListing();

  // ─── Other sections (useMy* hooks) ───
  const buses = useMyBusListings();
  const deleteBus = useDeleteBusListing();
  const equipment = useMyEquipmentListings();
  const deleteEquipment = useDeleteEquipmentListing();
  const operators = useMyOperatorListings();
  const deleteOperator = useDeleteOperatorListing();
  const parts = useMyParts();
  const deleteParts = useDeletePart();
  const services = useMyCarServices();
  const deleteService = useDeleteCarService();
  const insurance = useMyInsuranceOffers();
  const deleteIns = useDeleteInsurance();
  const jobs = useMyJobs();
  const deleteJob = useDeleteJob();
  const featureMut = useCreateFeaturedPayment();

  const statusFilters: { key: StatusFilter; label: string; icon: string }[] = [
    { key: 'ALL', label: tp('myListingsFilterAll'), icon: 'list' },
    { key: 'ACTIVE', label: tp('myListingsFilterActive'), icon: 'check_circle' },
    { key: 'DRAFT', label: tp('myListingsFilterDraft'), icon: 'edit_note' },
    { key: 'SOLD', label: tp('myListingsFilterSold'), icon: 'sell' },
  ];

  const statusLabels: Record<string, { label: string; cls: string }> = {
    ACTIVE: { label: tp('myListingsFilterActive'), cls: 'bg-brand-green/90 text-white' },
    DRAFT: { label: tp('myListingsFilterDraft'), cls: 'bg-amber-500/90 text-white' },
    SOLD: { label: tp('myListingsFilterSold'), cls: 'bg-outline/80 text-white' },
    EXPIRED: { label: tp('myListingsFilterExpired'), cls: 'bg-error/80 text-white' },
  };

  // ─── Section data mapping ───
  function getSectionData(): { items: any[]; isLoading: boolean; refetch: () => void } {
    switch (activeSection) {
      case 'cars': return { items: cars.data?.items ?? [], isLoading: cars.isLoading, refetch: cars.refetch };
      case 'buses': return { items: buses.data ?? [], isLoading: buses.isLoading, refetch: buses.refetch };
      case 'equipment': return { items: equipment.data ?? [], isLoading: equipment.isLoading, refetch: equipment.refetch };
      case 'operators': return { items: operators.data ?? [], isLoading: operators.isLoading, refetch: operators.refetch };
      case 'parts': return { items: parts.data ?? [], isLoading: parts.isLoading, refetch: parts.refetch };
      case 'services': return { items: services.data ?? [], isLoading: services.isLoading, refetch: services.refetch };
      case 'insurance': return { items: insurance.data ?? [], isLoading: insurance.isLoading, refetch: insurance.refetch };
      case 'jobs': return { items: jobs.data?.items ?? [], isLoading: jobs.isLoading, refetch: jobs.refetch };
      default: return { items: [], isLoading: false, refetch: () => {} };
    }
  }

  function getDeleteFn(): ((id: string, opts: any) => void) | null {
    switch (activeSection) {
      case 'cars': return (id, opts) => deleteCar.mutate(id, opts);
      case 'buses': return (id, opts) => deleteBus.mutate(id, opts);
      case 'equipment': return (id, opts) => deleteEquipment.mutate(id, opts);
      case 'operators': return (id, opts) => deleteOperator.mutate(id, opts);
      case 'parts': return (id, opts) => deleteParts.mutate(id, opts);
      case 'services': return (id, opts) => deleteService.mutate(id, opts);
      case 'insurance': return (id, opts) => deleteIns.mutate(id, opts);
      case 'jobs': return (id, opts) => deleteJob.mutate(id, opts);
      default: return null;
    }
  }

  function getEditRoute(id: string): string {
    switch (activeSection) {
      case 'cars': return `/edit-listing/${id}`;
      case 'buses': return `/edit-listing/bus/${id}`;
      case 'equipment': return `/edit-listing/equipment/${id}`;
      case 'operators': return `/edit-listing/operator/${id}`;
      case 'parts': return `/edit-listing/parts/${id}`;
      case 'services': return `/edit-listing/service/${id}`;
      case 'insurance': return `/edit-listing/insurance/${id}`;
      case 'jobs': return `/edit-listing/job/${id}`;
      default: return `/edit-listing/${id}`;
    }
  }

  const ENTITY_TYPE_MAP: Record<SectionKey, string> = {
    cars: 'LISTING', buses: 'BUS_LISTING', equipment: 'EQUIPMENT_LISTING',
    operators: 'OPERATOR_LISTING', parts: 'SPARE_PART', services: 'CAR_SERVICE',
    insurance: 'INSURANCE', jobs: 'JOB',
  };

  const sectionData = getSectionData();
  const deleteFn = getDeleteFn();

  // Filter by status for non-car sections (they don't have server-side status filter)
  const filteredItems = activeSection === 'cars'
    ? sectionData.items
    : statusFilter === 'ALL'
      ? sectionData.items
      : sectionData.items.filter((item: any) => item.status === statusFilter);

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-background pt-28 pb-24 lg:pb-16">
        <main className="max-w-6xl mx-auto px-4 md:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">inventory_2</span>
                {tp('myListingsTitle')}
              </h1>
              <p className="text-sm text-on-surface-variant mt-1">
                {tp('myListingsCount', { count: filteredItems.length })}
              </p>
            </div>
            <Link
              href="/add-listing"
              className="btn-success px-6 py-2.5 text-sm font-black flex items-center gap-2 hover:brightness-110 transition-all shadow-ambient"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              {tp('myListingsAdd')}
            </Link>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mb-4 overflow-x-auto no-scrollbar pb-1">
            {SECTION_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-full transition-all whitespace-nowrap ${
                  activeSection === tab.key
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface bg-surface-container-low/50 dark:bg-surface-container-high/30 hover:bg-surface-container-low dark:hover:bg-surface-container-high/50'
                }`}
              >
                <span className="material-symbols-outlined text-base">{tab.icon}</span>
                {tp(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-black transition-all whitespace-nowrap ${
                  statusFilter === f.key
                    ? 'bg-surface-container-lowest dark:bg-surface-container text-primary shadow-sm border border-outline-variant/10 dark:border-outline-variant/20'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50 dark:hover:bg-surface-container-high/30'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{f.icon}</span>
                {f.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {sectionData.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-surface-container-high aspect-[4/3] rounded-lg" />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item: any) => {
                const st = statusLabels[item.status] ?? { label: item.status, cls: 'bg-outline/60 text-white' };
                const entityType = ENTITY_TYPE_MAP[activeSection];

                const actionBar = (
                  <div className="flex -mx-3 -mb-1.5">
                    <Link
                      href={getEditRoute(item.id)}
                      className="flex-1 py-2.5 text-center text-xs font-black text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      {tp('myListingsEdit')}
                    </Link>
                    <div className="w-px bg-outline-variant/10 dark:bg-outline-variant/20" />
                    <button
                      onClick={async () => {
                        try {
                          const res = await featureMut.mutateAsync({ entityType, entityId: item.id });
                          window.location.href = res.checkoutUrl;
                        } catch (err: any) { addToast('error', err?.message || tp('myListingsFeatureError')); }
                      }}
                      disabled={featureMut.isPending || item.isPremium}
                      className={`flex-1 py-2.5 text-center text-xs font-black transition-all flex items-center justify-center gap-1.5 ${item.isPremium ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/10' : 'text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/10'}`}
                    >
                      <span className="material-symbols-outlined text-sm">workspace_premium</span>
                      {item.isPremium ? tp('myListingsFeatured') : tp('myListingsFeature')}
                    </button>
                    <div className="w-px bg-outline-variant/10 dark:bg-outline-variant/20" />
                    <button
                      onClick={() => {
                        if (confirm(tp('myListingsDeleteConfirm'))) {
                          deleteFn?.(item.id, { onSuccess: () => sectionData.refetch() });
                        }
                      }}
                      className="flex-1 py-2.5 text-center text-xs font-black text-on-surface-variant hover:text-error hover:bg-error/5 transition-all flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      {tp('myListingsDelete')}
                    </button>
                  </div>
                );

                if (activeSection === 'cars') {
                  const img = item.images?.find((i: any) => i.isPrimary) ?? item.images?.[0];
                  return (
                    <div
                      key={item.id}
                      className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 overflow-hidden group hover:shadow-lg dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all"
                    >
                      <div className="relative">
                        <VehicleCard
                          id={item.id}
                          title={item.title}
                          make={item.make}
                          model={item.model}
                          year={item.year}
                          price={item.price}
                          currency={item.currency}
                          mileage={item.mileage}
                          fuelType={item.fuelType}
                          imageUrl={getImageUrl(img?.url)}
                          listingType={item.listingType}
                          dailyPrice={item.dailyPrice}
                        />
                        <div className="absolute top-2 left-2">
                          <span className={`text-[10px] font-black px-2 py-1 ${st.cls}`}>
                            {st.label}
                          </span>
                        </div>
                      </div>
                      <div className="px-3 py-2 flex items-center gap-3 text-[11px] text-on-surface-variant border-t border-outline-variant/10 dark:border-outline-variant/20">
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          {item.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {new Date(item.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US')}
                        </span>
                      </div>
                      <div className="flex border-t border-outline-variant/10 dark:border-outline-variant/20">
                        {actionBar}
                      </div>
                    </div>
                  );
                }

                // Generic card for all other sections
                const imgUrl = item.images?.[0]?.url || item.imageUrl || null;
                return (
                  <GenericListingCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    sectionType={entityType}
                    price={item.price || item.salary || item.priceFrom || item.basePrice || item.pricePerTrip}
                    currency={item.currency || 'OMR'}
                    governorate={item.governorate}
                    imageUrl={imgUrl}
                    status={item.status}
                    createdAt={item.createdAt}
                    description={item.description}
                    showBadge={false}
                    actions={actionBar}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/10 dark:border-outline-variant/20 p-12 md:p-16 text-center">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-primary/10 dark:bg-primary/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary">inventory_2</span>
              </div>
              <h3 className="text-lg font-black text-on-surface mb-2">
                {statusFilter === 'ALL' ? tp('myListingsEmptyAll') : tp('myListingsEmptyFiltered', { filter: statusFilters.find(f => f.key === statusFilter)?.label ?? '' })}
              </h3>
              <p className="text-sm text-on-surface-variant mb-6 max-w-xs mx-auto">{tp('myListingsEmptyDesc')}</p>
              <Link
                href="/add-listing"
                className="inline-flex items-center gap-2 btn-primary px-8 py-3 text-sm font-black hover:brightness-110 transition-all"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                {tp('myListingsAddFirst')}
              </Link>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </AuthGuard>
  );
}
