'use client';

import { useParams } from 'next/navigation';
import { notFound, redirect } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useUnifiedRentalListing } from '@/features/rental/hooks/useUnifiedRentalListing';
import { useUnifiedAvailability } from '@/features/rental/hooks/useUnifiedAvailability';
import { useUnifiedBooking } from '@/features/rental/hooks/useUnifiedBooking';
import { RentalPageShell } from '@/features/rental/components/RentalPageShell';
import { getRentalConfig } from '@/features/rental/config/rental.config';
import type { RentalEntityType } from '@/features/rental/types/unified-rental.types';
import { useTranslations } from 'next-intl';
import { useEnumTranslations } from '@/lib/enum-translations';

const VALID_TYPES: RentalEntityType[] = ['car', 'bus', 'equipment'];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function RentalPageSkeleton() {
  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse pt-4">
        <div className="h-4 w-48 bg-surface-container-high rounded mb-6" />
        <div className="h-7 w-96 bg-surface-container-high rounded mb-3" />
        <div
          className="grid gap-1 rounded-2xl overflow-hidden mb-8"
          style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '185px 185px' }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`bg-surface-container-high ${i === 0 ? 'row-span-2' : ''}`} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-surface-container-high rounded" style={{ width: `${80 - i * 5}%` }} />
            ))}
          </div>
          <div className="h-[500px] bg-surface-container-high rounded-2xl" />
        </div>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RentalDetailClient() {
  const params = useParams<{ type: string; id: string }>();

  // Validate type — hooks must be called unconditionally
  const isValidType = VALID_TYPES.includes(params.type as RentalEntityType);
  const type = isValidType ? (params.type as RentalEntityType) : 'car';

  const { listing, isLoading, error, redirectTo } = useUnifiedRentalListing(type, params.id);
  const { unavailableDates } = useUnifiedAvailability(type, params.id);
  const { book, isPending } = useUnifiedBooking(type);
  const t = useTranslations('rental');
  const enumT = useEnumTranslations();

  // Guards (after hooks to respect Rules of Hooks)
  if (!isValidType) notFound();
  if (redirectTo) redirect(redirectTo);
  if (isLoading) return <RentalPageSkeleton />;
  if (error || !listing) notFound();

  const config = getRentalConfig(t, enumT)[type];

  return (
    <>
      <Navbar />
      <div className="pt-2">
        <RentalPageShell
          listing={listing}
          config={config}
          unavailableDates={unavailableDates}
          onBook={(start: string, end: string) => book(listing.id, start, end)}
          isBookingPending={isPending}
        />
      </div>
      <Footer />
    </>
  );
}
