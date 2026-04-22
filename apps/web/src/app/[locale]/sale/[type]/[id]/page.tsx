/**
 * Unified Sale Detail Page
 * Dynamic route: /sale/[type]/[id]
 * Supports: car, bus, equipment, part, service
 */

'use client';

import { useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { ErrorState } from '@/components/error-state';
import { useUnifiedListing } from '@/features/sale/hooks/useUnifiedListing';
import { getSaleConfig } from '@/features/sale/config/specs.config';
import { SalePageShell } from '@/features/sale/components/SalePageShell';
import type { SaleEntityType } from '@/features/sale/types/unified.types';
import { useTranslations } from 'next-intl';

const VALID_TYPES: SaleEntityType[] = ['car', 'bus', 'equipment', 'part', 'service'];

/**
 * Page skeleton for loading state.
 * Matches the visual structure of the actual page.
 */
function SalePageSkeleton() {
  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-16 pb-28 lg:pb-16 animate-pulse">
        {/* Breadcrumb */}
        <div className="h-4 w-48 bg-surface-container-high rounded mb-5" />

        {/* Title */}
        <div className="h-7 w-96 bg-surface-container-high rounded mb-3" />
        <div className="h-4 w-64 bg-surface-container-high rounded mb-6" />

        {/* Photo Grid */}
        <div
          className="grid gap-1 rounded-2xl overflow-hidden mb-8"
          style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '185px 185px' }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`bg-surface-container-high ${i === 0 ? 'row-span-2' : ''}`}
            />
          ))}
        </div>

        {/* Two Column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Left */}
          <div className="space-y-4">
            {/* Seller */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container-high" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-surface-container-high rounded" />
                <div className="h-3 w-24 bg-surface-container-high rounded" />
              </div>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 bg-surface-container-high rounded-2xl" />
              ))}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-surface-container-high rounded-2xl" />
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-surface-container-high rounded" />
              <div className="h-4 w-full bg-surface-container-high rounded" />
              <div className="h-4 w-3/4 bg-surface-container-high rounded" />
            </div>
          </div>

          {/* Right */}
          <div className="h-96 bg-surface-container-high rounded-2xl" />
        </div>
      </div>
      <Footer />
    </>
  );
}

/**
 * Main sale page component.
 * Validates type param, fetches unified data, and renders the shell.
 */
export default function SalePage() {
  const params = useParams<{ type: string; id: string }>();
  const { type: typeParam, id } = params;

  // Validate type
  if (!VALID_TYPES.includes(typeParam as SaleEntityType)) {
    notFound();
  }
  const type = typeParam as SaleEntityType;

  const router = useRouter();
  const ts = useTranslations('sale');

  // Fetch unified listing data
  const { listing, isLoading, isError, error, refetch, redirectTo } = useUnifiedListing(type, id);

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // Loading state
  if (isLoading || redirectTo) {
    return <SalePageSkeleton />;
  }

  // Error / not found
  if (isError || !listing) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-28">
          <main className="max-w-5xl mx-auto px-4 md:px-8">
            <ErrorState
              onRetry={() => refetch()}
              message={error?.message || ts('notFound')}
            />
          </main>
        </div>
        <Footer />
      </>
    );
  }

  const config = getSaleConfig(ts)[type];

  return (
    <>
      <Navbar />
      <SalePageShell listing={listing} config={config} />
      <Footer />
    </>
  );
}
