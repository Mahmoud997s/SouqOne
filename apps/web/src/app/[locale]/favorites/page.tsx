'use client';

import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { AuthGuard } from '@/components/auth-guard';
import { VehicleCard } from '@/features/ads/components/vehicle-card';
import { RentalCard } from '@/features/rentals/components/rental-card';
import { ErrorState } from '@/components/error-state';
import { Heart, SlidersHorizontal } from 'lucide-react';
import { useFavorites, useToggleFavorite, type EntityType, type FavoriteItem } from '@/lib/api';
import { getImageUrl } from '@/lib/image-utils';

// ── Types ──
type SortOption = 'newest' | 'price' | 'oldest';

interface UndoState {
  item: FavoriteItem;
  timeoutId: NodeJS.Timeout;
}

// ── Category Tabs Config ──
const CATEGORY_TABS: { value: EntityType; label: string; icon: string }[] = [
  { value: 'LISTING', label: 'سيارات', icon: 'directions_car' },
  { value: 'BUS_LISTING', label: 'باصات', icon: 'directions_bus' },
  { value: 'EQUIPMENT_LISTING', label: 'معدات', icon: 'construction' },
  { value: 'SPARE_PART', label: 'قطع غيار', icon: 'settings' },
  { value: 'CAR_SERVICE', label: 'خدمات', icon: 'build' },
  { value: 'JOB', label: 'وظائف', icon: 'work' },
  { value: 'TRANSPORT', label: 'نقل', icon: 'local_shipping' },
  { value: 'TRIP', label: 'رحلات', icon: 'flight' },
];

const ENTITY_ROUTES: Record<string, string> = {
  LISTING: '/cars',
  JOB: '/jobs',
  SPARE_PART: '/parts',
  CAR_SERVICE: '/services',
  BUS_LISTING: '/buses',
  EQUIPMENT_LISTING: '/equipment',
  TRANSPORT: '/transport',
  TRIP: '/trips',
};

// ── Sort Options ──
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price', label: 'السعر' },
  { value: 'oldest', label: 'الأقدم' },
];

// ── Generic Fav Card for non-vehicle entities ──
function GenericFavCard({
  item,
  onRemove,
}: {
  item: FavoriteItem;
  onRemove: (item: FavoriteItem) => void;
}) {
  const route = ENTITY_ROUTES[item.entityType] || '/';
  const tabConfig = CATEGORY_TABS.find(t => t.value === item.entityType);

  return (
    <Link
      href={`${route}/${item.entityId}`}
      className="group relative rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(15,23,42,0.06)] transition-all duration-300"
    >
      <div className="aspect-[16/10] bg-surface-container-low relative overflow-hidden">
        {item.entity?.image ? (
          <Image
            src={getImageUrl(item.entity.image) || ''}
            alt={item.entity?.title || ''}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-on-surface-variant/25">
            <span className="material-symbols-outlined text-4xl">{tabConfig?.icon || 'bookmark'}</span>
          </div>
        )}

        {/* Filled Heart - Remove Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item);
          }}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
          aria-label="إزالة من المفضلة"
        >
          <Heart className="w-4 h-4 fill-primary text-primary" />
        </button>

        {/* Category badge */}
        <span className="absolute top-2 right-2 bg-primary/90 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
          {tabConfig?.label || item.entityType}
        </span>
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-sm text-on-surface line-clamp-2 leading-snug">
          {item.entity?.title || 'عنصر محذوف'}
        </h3>
      </div>
    </Link>
  );
}

// ── Vehicle Fav Card Wrapper with Heart Overlay ──
function VehicleFavCard({
  item,
  onRemove,
}: {
  item: FavoriteItem;
  onRemove: (item: FavoriteItem) => void;
}) {
  const listing = item.listing;
  if (!listing) return null;

  const img = listing.images?.find((i: any) => i.isPrimary) ?? listing.images?.[0];

  // Check if it's a rental listing
  if (listing.listingType === 'RENTAL') {
    return (
      <div className="relative group">
        <RentalCard
          id={listing.id}
          title={listing.title}
          make={listing.make}
          model={listing.model}
          year={listing.year}
          dailyPrice={listing.dailyPrice}
          weeklyPrice={listing.weeklyPrice}
          monthlyPrice={listing.monthlyPrice}
          currency={listing.currency}
          mileage={listing.mileage}
          fuelType={listing.fuelType}
          transmission={listing.transmission}
          governorate={listing.governorate}
          imageUrl={getImageUrl(img?.url)}
        />
        {/* Heart overlay for removal */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(item);
          }}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-20"
          aria-label="إزالة من المفضلة"
        >
          <Heart className="w-4 h-4 fill-primary text-primary" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      <VehicleCard
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
      />
      {/* Heart overlay for removal */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onRemove(item);
        }}
        className="absolute top-2 left-2 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-20"
        aria-label="إزالة من المفضلة"
      >
        <Heart className="w-4 h-4 fill-primary text-primary" />
      </button>
    </div>
  );
}

// ── Undo Toast Component ──
function UndoToast({
  visible,
  onUndo,
  onDismiss,
}: {
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 right-4 left-4 lg:right-8 lg:left-auto lg:w-80 bg-foreground text-background rounded-2xl px-4 py-3 flex items-center justify-between z-50 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-200">
      <span className="text-sm">تمت الإزالة من المفضلة</span>
      <button
        onClick={onUndo}
        className="text-primary font-medium text-sm hover:underline px-2 py-1 rounded"
      >
        تراجع
      </button>
    </div>
  );
}

// ── Main Page ──
export default function FavoritesPage() {
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
          return priceB - priceA; // High to low
        });
      default:
        return sorted;
    }
  }, [items, sortBy]);

  // Handle remove with undo
  const handleRemove = useCallback((item: FavoriteItem) => {
    // Clear any existing undo
    if (undoState) {
      clearTimeout(undoState.timeoutId);
    }

    // Optimistically remove
    toggleFav.mutate({ entityType: item.entityType, entityId: item.entityId });

    // Show undo toast
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
      // Re-add to favorites
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

  // Count display
  const countText = totalCount === 0 ? 'لا يوجد إعلانات' : totalCount === 1 ? 'إعلان واحد' : `${totalCount} إعلان`;

  return (
    <AuthGuard>
      <Navbar />
      <div className="min-h-screen bg-background" dir="rtl">
        {/* ── Page Header ── */}
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-[22px] font-medium text-on-surface">المفضلة</h1>
            <span className="text-[13px] text-muted-foreground">{countText}</span>
          </div>
        </div>

        {/* ── Category Filter Tabs ── */}
        {availableTabs.length > 0 && (
          <div className="px-4 py-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === 'ALL'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                الكل
              </button>
              {availableTabs.map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === tab.value
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Sort Row ── */}
        {totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-muted-foreground">
              {sortedItems.length} {sortedItems.length === 1 ? 'نتيجة' : 'نتائج'}
            </span>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-sm bg-transparent border-none outline-none text-on-surface cursor-pointer"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Results Grid ── */}
        <main className="px-4 pb-24">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 animate-pulse">
                  <div className="aspect-[16/10] bg-surface-container-high" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-surface-container-high rounded-full w-3/4" />
                    <div className="h-3 bg-surface-container-high rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <ErrorState onRetry={() => refetch()} />
          ) : sortedItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {sortedItems.map((fav) => {
                if (fav.entityType === 'LISTING' && fav.listing) {
                  return (
                    <VehicleFavCard
                      key={fav.id}
                      item={fav}
                      onRemove={handleRemove}
                    />
                  );
                }
                return (
                  <GenericFavCard
                    key={fav.id}
                    item={fav}
                    onRemove={handleRemove}
                  />
                );
              })}
            </div>
          ) : (
            /* ── Empty State ── */
            <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
              <Heart size={48} className="text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-on-surface mb-2">قائمة المفضلة فارغة</h3>
              <p className="text-sm text-muted-foreground mb-6">
                احفظ الإعلانات التي تعجبك للرجوع إليها لاحقاً
              </p>
              <Link
                href="/listings"
                className="bg-primary text-on-primary px-6 py-3 rounded-xl text-sm font-medium hover:brightness-110 transition-all"
              >
                تصفح الإعلانات
              </Link>
            </div>
          )}
        </main>

        {/* ── Undo Toast ── */}
        <UndoToast
          visible={showUndo}
          onUndo={handleUndo}
          onDismiss={handleDismissUndo}
        />
      </div>
      <Footer />
    </AuthGuard>
  );
}
