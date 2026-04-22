'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { ErrorState } from '@/components/error-state';
import { Heart } from 'lucide-react';
import { useFavorites, useToggleFavorite, type EntityType, type FavoriteItem } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations } from 'next-intl';

// ── Types ──
type SortOption = 'newest' | 'price' | 'oldest';

interface UndoState {
  item: FavoriteItem;
  timeoutId: NodeJS.Timeout;
}

// ── Category Tabs Config ──
const CATEGORY_TABS: { value: EntityType; labelKey: string; icon: string }[] = [
  { value: 'LISTING', labelKey: 'catCars', icon: 'directions_car' },
  { value: 'BUS_LISTING', labelKey: 'catBuses', icon: 'directions_bus' },
  { value: 'EQUIPMENT_LISTING', labelKey: 'catEquipment', icon: 'construction' },
  { value: 'SPARE_PART', labelKey: 'catParts', icon: 'settings' },
  { value: 'CAR_SERVICE', labelKey: 'catServices', icon: 'build' },
  { value: 'JOB', labelKey: 'catJobs', icon: 'work' },
  { value: 'TRANSPORT', labelKey: 'catTransport', icon: 'local_shipping' },
  { value: 'TRIP', labelKey: 'catTrips', icon: 'flight' },
  { value: 'INSURANCE', labelKey: 'catInsurance', icon: 'shield' },
  { value: 'OPERATOR_LISTING', labelKey: 'catOperators', icon: 'engineering' },
];

const ENTITY_ROUTES: Record<string, string> = {
  LISTING: '/sale/car',
  JOB: '/jobs',
  SPARE_PART: '/sale/part',
  CAR_SERVICE: '/sale/service',
  BUS_LISTING: '/sale/bus',
  EQUIPMENT_LISTING: '/sale/equipment',
  TRANSPORT: '/transport',
  TRIP: '/trips',
  INSURANCE: '/insurance',
  OPERATOR_LISTING: '/equipment/operators',
};

// ── Sort Options ──
const SORT_KEYS: { value: SortOption; labelKey: string }[] = [
  { value: 'newest', labelKey: 'sortNewest' },
  { value: 'price', labelKey: 'sortPrice' },
  { value: 'oldest', labelKey: 'sortOldest' },
];

// ── Generic Fav Card for non-vehicle entities ──
function GenericFavCard({
  item,
  onRemove,
  t,
}: {
  item: FavoriteItem;
  onRemove: (item: FavoriteItem) => void;
  t: (key: string) => string;
}) {
  const route = ENTITY_ROUTES[item.entityType] || '/';
  const tabConfig = CATEGORY_TABS.find(tab => tab.value === item.entityType);

  return (
    <Link
      href={`${route}/${item.entityId}`}
      className="group relative h-full rounded-xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-container-low">
        {item.entity?.image ? (
          <Image
            src={getImageUrl(item.entity.image) || ''}
            alt={item.entity?.title || ''}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant/25">
            <span className="material-symbols-outlined text-3xl sm:text-4xl">{tabConfig?.icon || 'bookmark'}</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

        {/* Heart remove button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item);
          }}
          className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center"
          aria-label={t('removeFromFav')}
        >
          <span
            className="material-symbols-outlined text-[18px] sm:text-[20px] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)] text-red-500"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            favorite
          </span>
        </button>

        {/* Category badge */}
        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[10px] font-bold bg-black/55 backdrop-blur-sm text-white">
          {t(tabConfig?.labelKey || 'catCars')}
        </span>
      </div>
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1">
        <h3 dir="auto" className="text-[10px] sm:text-[13px] font-black leading-snug line-clamp-2 sm:line-clamp-1 text-on-surface">
          {item.entity?.title || t('deletedItem')}
        </h3>
      </div>
    </Link>
  );
}

// ── Undo Toast Component ──
function UndoToast({
  visible,
  onUndo,
  onDismiss,
  t,
}: {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
  t: (key: string) => string;
}) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-4 left-4 lg:right-8 lg:left-auto lg:w-80 bg-foreground text-background rounded-2xl px-4 py-3 flex items-center justify-between z-50 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200">
      <span className="text-sm">{t('undoRemoved')}</span>
      <button
        onClick={onUndo}
        className="text-primary font-medium text-sm hover:underline px-2 py-1 rounded"
      >
        {t('undo')}
      </button>
    </div>
  );
}

// ── Main Page ──
export default function FavoritesPage() {
  const t = useTranslations('favorites');
  const [activeTab, setActiveTab] = useState<EntityType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  const filterType = activeTab === 'ALL' ? undefined : activeTab;
  const { data, isLoading, isError, refetch } = useFavorites(filterType);
  const items = data?.items ?? [];
  const totalCount = data?.meta?.total ?? 0;
  const toggleFav = useToggleFavorite();

  // Compute available tabs based on all favorites (not filtered)
  const { data: allFavs } = useFavorites(undefined);
  const availableTabs = useMemo(() => {
    if (!allFavs?.items) return [];
    const types = new Set(allFavs.items.map(i => i.entityType));
    return CATEGORY_TABS.filter(tab => types.has(tab.value));
  }, [allFavs]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...items];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'price':
        return sorted.sort((a, b) => {
          const priceA = Number(a.listing?.price ?? 0);
          const priceB = Number(b.listing?.price ?? 0);
          return priceB - priceA;
        });
      default:
        return sorted;
    }
  }, [items, sortBy]);

  // Handle remove with undo
  const handleRemove = useCallback((item: FavoriteItem) => {
    if (undoState) clearTimeout(undoState.timeoutId);
    toggleFav.mutate({ entityType: item.entityType, entityId: item.entityId });
    setShowUndo(true);
    const timeoutId = setTimeout(() => {
      setShowUndo(false);
      setUndoState(null);
    }, 4000);
    setUndoState({ item, timeoutId });
  }, [toggleFav, undoState]);

  // Handle undo
  const handleUndo = useCallback(() => {
    if (undoState) {
      clearTimeout(undoState.timeoutId);
      toggleFav.mutate({
        entityType: undoState.item.entityType,
        entityId: undoState.item.entityId,
      });
      setShowUndo(false);
      setUndoState(null);
    }
  }, [undoState, toggleFav]);

  const handleDismissUndo = useCallback(() => {
    setShowUndo(false);
    setUndoState(null);
  }, []);

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-background pb-24 lg:pb-16">

        {/* ══ PREMIUM BANNER HEADER ══ */}
        <div className="relative bg-gradient-to-bl from-[#004ac6] via-[#1d4ed8] to-[#0B2447] overflow-hidden px-4 pt-8 pb-10">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h30v30H0zm30 30h30v30H30z\' fill=\'%23fff\' fill-opacity=\'.5\'/%3E%3C/svg%3E")', backgroundSize: '30px 30px' }} />
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
          <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Heart size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-white leading-tight">
                {t('pageTitle')}
              </h1>
              <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-white/15 text-[11px] font-medium text-white/90">
                {t('subtitle', { count: totalCount })}
              </span>
            </div>
          </div>
        </div>

        {/* ═══ A) CATEGORY FILTER TABS ═══ */}
        <div className="px-4 md:px-8 max-w-7xl mx-auto mt-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-on-surface text-surface'
                  : 'border border-outline-variant/30 text-on-surface hover:border-on-surface/50'
              }`}
            >
              {t('filterAll')}
            </button>
            {availableTabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${
                  activeTab === tab.value
                    ? 'bg-on-surface text-surface'
                    : 'border border-outline-variant/30 text-on-surface hover:border-on-surface/50'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          {/* ═══ B) SORT BAR ═══ */}
          {totalCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {SORT_KEYS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-medium flex-shrink-0 transition-colors ${
                    sortBy === opt.value
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline-variant/20 text-on-surface-variant hover:border-primary/30 bg-surface-container-lowest cursor-pointer'
                  }`}
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ C) CONTENT GRID ═══ */}
        <div className="px-4 md:px-8 mt-6 max-w-7xl mx-auto">
          {isLoading ? (
            /* ── Skeleton ── */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-outline-variant/10 overflow-hidden bg-surface-container-lowest animate-pulse">
                  <div className="aspect-[16/10] bg-surface-container-high" />
                  <div className="p-2.5 sm:p-3 space-y-2">
                    <div className="h-3 sm:h-4 w-3/4 bg-surface-container-high rounded" />
                    <div className="h-2 sm:h-3 w-1/2 bg-surface-container rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : sortedItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {sortedItems.map((fav) => {
                // LISTING type → VehicleCard (has built-in fav button)
                if (fav.entityType === 'LISTING' && fav.listing) {
                  const listing = fav.listing;
                  const img = listing.images?.find((i: any) => i.isPrimary) ?? listing.images?.[0];
                  return (
                    <VehicleCard
                      key={fav.id}
                      id={listing.id}
                      title={listing.title}
                      make={listing.make}
                      model={listing.model}
                      year={listing.year}
                      price={listing.price}
                      currency={listing.currency}
                      mileage={listing.mileage}
                      fuelType={listing.fuelType}
                      transmission={listing.transmission}
                      condition={listing.condition}
                      governorate={listing.governorate}
                      imageUrl={getImageUrl(img?.url)}
                      listingType={listing.listingType}
                      dailyPrice={listing.dailyPrice}
                      createdAt={listing.createdAt}
                      href={listing.listingType === 'RENTAL' ? `/rental/car/${listing.id}` : `/sale/car/${listing.id}`}
                    />
                  );
                }

                // Non-vehicle entity → GenericFavCard
                return (
                  <GenericFavCard
                    key={fav.id}
                    item={fav}
                    onRemove={handleRemove}
                    t={t}
                  />
                );
              })}
            </div>
          ) : (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart size={28} className="text-primary" />
              </div>
              <h3 className="text-[16px] font-medium text-on-surface mb-1">{t('emptyTitle')}</h3>
              <p className="text-[13px] text-on-surface-variant mb-6 max-w-xs">
                {t('emptyDescription')}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary text-[13px] font-medium hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-base">search</span>
                {t('browseListings')}
              </Link>
            </div>
          )}
        </div>

        {/* ── Undo Toast ── */}
        <UndoToast
          visible={showUndo}
          onUndo={handleUndo}
          onDismiss={handleDismissUndo}
          t={t}
        />
      </div>
      <Footer />
    </AuthGuard>
  );
}
