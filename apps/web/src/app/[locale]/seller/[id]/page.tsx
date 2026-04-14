'use client';

import { useParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { ListingSkeleton } from '@/components/loading-skeleton';
import { ErrorState } from '@/components/error-state';
import { EmptyState } from '@/components/empty-state';
import { usePublicProfile, useListings, useCreateConversation } from '@/lib/api';
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

export default function SellerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: seller, isLoading: sellerLoading, isError: sellerError, refetch: refetchSeller } = usePublicProfile(id);
  const { data: listings, isLoading: listingsLoading } = useListings(seller ? { sellerId: seller.id, limit: '50' } : {});
  const createConv = useCreateConversation();
  const requireAuth = useRequireAuth();
  const { addToast } = useToast();
  const { user } = useAuth();
  const tp = useTranslations('pages');
  const tr = useTranslations('reviews');
  const locale = useLocale();
  const { data: reviewSummary } = useReviewSummary(seller?.id);
  const { data: reviews } = useReviews(seller ? { userId: seller.id, limit: '10' } : undefined);

  function handleContact() {
    requireAuth(async () => {
      if (!seller) return;
      const firstListing = listings?.items?.[0];
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

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 max-w-7xl mx-auto px-6">
        {/* Seller Header */}
        <div className="bg-surface-container-lowest border border-outline-variant/10 p-4 md:p-8 mb-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          {seller.avatarUrl ? (
            <img src={getImageUrl(seller.avatarUrl) || ''} alt={seller.displayName || seller.username} className="w-20 h-20 rounded-full object-cover shrink-0 ring-4 ring-surface-container-lowest shadow-lg" />
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
            <p className="text-xs text-on-surface-variant mt-2">
              {tp('sellerMemberSince', { date: new Date(seller.createdAt).toLocaleDateString(locale === 'ar' ? 'ar-OM' : 'en-US') })}
            </p>
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

        {/* Seller Listings */}
        <h2 className="text-2xl font-black mb-6">{tp('sellerListings')}</h2>

        {listingsLoading ? (
          <ListingSkeleton count={4} />
        ) : listings && listings.items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.items.map((item) => {
              const img = item.images?.find((i) => i.isPrimary) ?? item.images?.[0];
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
