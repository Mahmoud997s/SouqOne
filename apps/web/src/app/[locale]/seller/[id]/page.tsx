'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { GenericListingCard } from '@/components/generic-listing-card';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { EmptyState } from '@/components/empty-state';
import { usePublicProfile, useListings, useCreateConversation } from '@/lib/api';
import { useBusListings } from '@/lib/api/buses';
import { useEquipmentListings, useOperatorListings } from '@/lib/api/equipment';
import { useParts } from '@/lib/api/parts';
import { useCarServices } from '@/lib/api/services';
import { useInsuranceOffers } from '@/lib/api/insurance';
import { useJobs } from '@/lib/api/jobs';
import { useReviews, useReviewSummary } from '@/lib/api/reviews';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useToast } from '@/components/toast';
import { VerifiedBadge } from '@/components/verified-badge';
import { StarRating } from '@/components/reviews/star-rating';
import { ReviewSummaryCard } from '@/components/reviews/review-summary';
import { ReviewCard } from '@/components/reviews/review-card';
import { ReviewForm } from '@/components/reviews/review-form';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';

const SECTION_TABS = [
  { key: 'cars', icon: 'directions_car', labelKey: 'sectionCars', entityType: 'LISTING' },
  { key: 'buses', icon: 'directions_bus', labelKey: 'sectionBuses', entityType: 'BUS_LISTING' },
  { key: 'equipment', icon: 'construction', labelKey: 'sectionEquipment', entityType: 'EQUIPMENT_LISTING' },
  { key: 'operators', icon: 'engineering', labelKey: 'sectionOperators', entityType: 'OPERATOR_LISTING' },
  { key: 'parts', icon: 'build', labelKey: 'sectionParts', entityType: 'SPARE_PART' },
  { key: 'services', icon: 'car_repair', labelKey: 'sectionServices', entityType: 'CAR_SERVICE' },
  { key: 'insurance', icon: 'shield', labelKey: 'sectionInsurance', entityType: 'INSURANCE' },
  { key: 'jobs', icon: 'work', labelKey: 'sectionJobs', entityType: 'JOB' },
] as const;

type SectionKey = typeof SECTION_TABS[number]['key'];

export default function SellerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SectionKey>('cars');
  const { data: seller, isLoading: sellerLoading, isError: sellerError, refetch: refetchSeller } = usePublicProfile(id);
  const sellerId = seller?.id;

  // ─── Listings by section ───
  const cars = useListings(sellerId ? { sellerId, limit: '50' } : {});
  const buses = useBusListings(sellerId ? { userId: sellerId, limit: '50' } : undefined);
  const equipment = useEquipmentListings(sellerId ? { userId: sellerId, limit: '50' } : undefined);
  const operators = useOperatorListings(sellerId ? { userId: sellerId, limit: '50' } : undefined);
  const parts = useParts(sellerId ? { sellerId, limit: '50' } : undefined);
  const services = useCarServices(sellerId ? { userId: sellerId, limit: '50' } : undefined);
  const insurance = useInsuranceOffers(sellerId ? { userId: sellerId, limit: '50' } : undefined);
  const jobs = useJobs(sellerId ? { userId: sellerId, limit: '50' } : {});

  const createConv = useCreateConversation();
  const requireAuth = useRequireAuth();
  const { addToast } = useToast();
  const { user } = useAuth();
  const tp = useTranslations('pages');
  const tr = useTranslations('reviews');
  const locale = useLocale();
  const { data: reviewSummary } = useReviewSummary(seller?.id);
  const { data: reviews } = useReviews(seller ? { userId: seller.id, limit: '10' } : undefined);

  function getSectionData(): { items: any[]; isLoading: boolean } {
    switch (activeSection) {
      case 'cars': return { items: cars.data?.items ?? [], isLoading: cars.isLoading };
      case 'buses': return { items: buses.data?.items ?? [], isLoading: buses.isLoading };
      case 'equipment': return { items: equipment.data?.items ?? [], isLoading: equipment.isLoading };
      case 'operators': return { items: operators.data?.items ?? [], isLoading: operators.isLoading };
      case 'parts': return { items: parts.data?.items ?? [], isLoading: parts.isLoading };
      case 'services': return { items: services.data?.items ?? [], isLoading: services.isLoading };
      case 'insurance': return { items: insurance.data?.items ?? [], isLoading: insurance.isLoading };
      case 'jobs': return { items: jobs.data?.items ?? [], isLoading: jobs.isLoading };
      default: return { items: [], isLoading: false };
    }
  }

  function handleContact() {
    requireAuth(async () => {
      if (!seller) return;
      const firstListing = cars.data?.items?.[0];
      if (!firstListing) {
        addToast('info', tp('sellerNoListings'));
        return;
      }
      try {
        const conv = await createConv.mutateAsync({ entityType: 'LISTING', entityId: firstListing.id });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast('error', err instanceof Error ? err.message : tp('sellerErrorConversation'));
      }
    }, tp('sellerLoginToContact'));
  }

  if (sellerLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-28 pb-16 max-w-7xl mx-auto px-6">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-surface-container-high" />
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-surface-container-high rounded-full w-48" />
                <div className="h-4 bg-surface-container-high rounded-full w-32" />
              </div>
            </div>
            <ListingSkeleton count={4} />
          </div>
        </main>
      </>
    );
  }

  if (sellerError || !seller) {
    return (
      <>
        <Navbar />
        <div className="pt-28 px-8"><ErrorState onRetry={() => refetchSeller()} /></div>
      </>
    );
  }

  const sectionData = getSectionData();
  const currentTab = SECTION_TABS.find(t => t.key === activeSection)!;

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-6">
        {/* Seller Header */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 md:p-8 mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {seller.avatarUrl ? (
            <Image src={getImageUrl(seller.avatarUrl) || ''} alt={seller.displayName || seller.username} width={80} height={80} className="w-20 h-20 rounded-full object-cover shrink-0 ring-4 ring-surface-container-lowest shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-black text-3xl shrink-0">
              {(seller.displayName || seller.username)[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black">{seller.displayName || seller.username}</h1>
              {seller.isVerified && <VerifiedBadge />}
            </div>
            {reviewSummary && reviewSummary.reviewCount > 0 && (
              <div className="flex items-center gap-1.5 mb-1">
                <StarRating value={Math.round(reviewSummary.averageRating)} size="sm" readonly />
                <span className="text-xs text-on-surface-variant font-bold">({reviewSummary.reviewCount})</span>
              </div>
            )}
            {seller.governorate && (
              <p className="text-on-surface-variant text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {seller.governorate}
              </p>
            )}
            {seller.bio && <p className="text-on-surface-variant text-sm mt-2">{seller.bio}</p>}
            <div className="flex items-center gap-3 mt-2">
              <p className="text-xs text-on-surface-variant">
                {tp('sellerMemberSince', { date: new Date(seller.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US') })}
              </p>
              {seller.totalListings !== undefined && (
                <span className="text-xs font-bold text-primary">{seller.totalListings} {tp('sellerListingsCount')}</span>
              )}
            </div>
          </div>
          <button
            onClick={handleContact}
            disabled={createConv.isPending}
            className="bg-primary text-on-primary px-8 py-3 text-sm font-black flex items-center gap-2 hover:brightness-110 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            {createConv.isPending ? tp('sellerContactPending') : tp('sellerContactSeller')}
          </button>
        </div>

        {/* Section Tabs */}
        <h2 className="text-2xl font-black mb-4">{tp('sellerListings')}</h2>
        <div className="flex gap-1 mb-6 overflow-x-auto no-scrollbar pb-1">
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

        {/* Seller Listings */}
        {sectionData.isLoading ? (
          <ListingSkeleton count={4} />
        ) : sectionData.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sectionData.items.map((item: any) => {
              if (activeSection === 'cars') {
                const img = item.images?.find((i: any) => i.isPrimary) ?? item.images?.[0];
                return (
                  <VehicleCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    make={item.make}
                    model={item.model}
                    year={item.year}
                    price={item.price}
                    currency={item.currency}
                    mileage={item.mileage}
                    fuelType={item.fuelType}
                    transmission={item.transmission}
                    condition={item.condition}
                    governorate={item.governorate}
                    imageUrl={getImageUrl(img?.url)}
                    listingType={item.listingType}
                    dailyPrice={item.dailyPrice}
                  />
                );
              }
              const imgUrl = item.images?.[0]?.url || item.imageUrl || null;
              return (
                <GenericListingCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  sectionType={currentTab.entityType}
                  price={item.price || item.salary || item.priceFrom || item.basePrice || item.pricePerTrip}
                  currency={item.currency || 'OMR'}
                  governorate={item.governorate}
                  imageUrl={imgUrl}
                  createdAt={item.createdAt}
                  description={item.description}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="inventory_2"
            title={tp('sellerEmptyTitle')}
            description={tp('sellerEmptyDesc')}
          />
        )}

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">reviews</span>
            {tr('ratingsAndReviews')}
          </h2>

          {reviewSummary && reviewSummary.reviewCount > 0 && (
            <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant/10 p-6 mb-6">
              <ReviewSummaryCard summary={reviewSummary} />
            </div>
          )}

          {user && user.id !== seller.id && (
            <div className="bg-surface-container-lowest dark:bg-surface-container rounded-2xl border border-outline-variant/10 p-6 mb-6">
              <h3 className="text-sm font-black text-on-surface mb-3">{tr('writeReview')}</h3>
              <ReviewForm entityType="LISTING" entityId={seller.id} revieweeId={seller.id} />
            </div>
          )}

          {reviews && reviews.items.length > 0 ? (
            <div className="space-y-3">
              {reviews.items.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>
          ) : (
            <p className="text-center text-on-surface-variant/60 text-sm py-8">{tr('noReviews')}</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
