/**
 * Sale Page Shell — Main page layout orchestrator.
 * Combines all sub-components into the unified sale detail page.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Share2, Heart, MessageCircle, Phone, Trash2, Star } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { haversineDistance } from '@/lib/geo-utils';
import {
  useCreateConversation,
  useDeleteListing,
  useDeleteBusListing,
  useDeleteEquipmentListing,
  useDeletePart,
  useDeleteCarService,
} from '@/lib/api';
import { useFavContext } from '@/providers/favorites-provider';
import type { EntityType } from '@/lib/api/favorites';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/components/toast';
import { PhotoGallery } from '@/components/shared/PhotoGallery';
import { ListingBadge } from '@/components/listing-badge';

import type { UnifiedListing } from '../types/unified.types';
import type { SectionConfig } from '../types/config.types';
import { Highlights } from './Highlights';
import { SpecsGrid } from './SpecsGrid';
import { DetailsTable } from './DetailsTable';
import { ContractDetails } from './ContractDetails';
import { PriceCard } from './PriceCard';
import { SimilarItems } from './SimilarItems';
import { SellerRow } from './SellerRow';

const MapView = dynamic(() => import('@/components/map/map-view'), { ssr: false });

interface SalePageShellProps {
  listing: UnifiedListing;
  config: SectionConfig;
}

function formatRelativeTime(dateString: string, locale: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diffDays < 7) return rtf.format(-diffDays, 'day');
  if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), 'week');
  return rtf.format(-Math.floor(diffDays / 30), 'month');
}

/**
 * Simple divider component.
 */
function Divider() {
  return <div className="h-px bg-outline-variant/20 my-5" />;
}

/**
 * Section title with styling.
 */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-semibold text-on-surface tracking-tight">{children}</h2>
      <div className="mt-1 h-[3px] w-8 rounded-full bg-primary" />
    </div>
  );
}

/**
 * Expandable text component for descriptions.
 */
function ExpandableText({ text, expandLabel, collapseLabel }: { text: string; expandLabel: string; collapseLabel: string }) {
  const [expanded, setExpanded] = useState(false);
  const maxLength = 200;

  if (text.length <= maxLength) {
    return <p className="text-[13px] text-on-surface-variant leading-relaxed whitespace-pre-line">{text}</p>;
  }

  const displayText = expanded ? text : text.slice(0, maxLength) + '...';

  return (
    <div>
      <p className="text-[13px] text-on-surface-variant leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 text-[12px] text-primary hover:underline underline-offset-2 font-medium"
      >
        {expanded ? collapseLabel : expandLabel}
      </button>
    </div>
  );
}

/**
 * Breadcrumb navigation component.
 */
function Breadcrumb({ listing, config, homeLabel }: { listing: UnifiedListing; config: SectionConfig; homeLabel: string }) {
  const listPaths: Record<string, string> = {
    car: '/browse/cars',
    bus: '/browse/buses',
    equipment: '/browse/equipment',
    part: '/browse/parts',
    service: '/browse/services',
  };

  return (
    <nav className="flex items-center gap-1 text-[12px] text-on-surface-variant flex-wrap">
      <Link href="/" className="text-primary hover:underline cursor-pointer">
        {homeLabel}
      </Link>
      <span className="mx-0.5">›</span>
      <Link href={listPaths[listing.type]} className="text-primary hover:underline cursor-pointer">
        {config.displayName}
      </Link>
      <span className="mx-0.5">›</span>
      <span className="truncate max-w-[160px] sm:max-w-xs">{listing.title}</span>
    </nav>
  );
}

/**
 * Main sale page shell component.
 */
/** Get the edit route for a given listing type + id */
function getEditRoute(type: string, id: string): string {
  const map: Record<string, string> = {
    car: `/edit-listing/car/${id}`,
    bus: `/edit-listing/bus/${id}`,
    equipment: `/edit-listing/equipment/${id}`,
    part: `/edit-listing/parts/${id}`,
    service: `/edit-listing/service/${id}`,
  };
  return map[type] || `/edit-listing/car/${id}`;
}

export function SalePageShell({ listing, config }: SalePageShellProps) {
  const router = useRouter();
  const { addToast } = useToast();
  const ts = useTranslations('sale');
  const deleteListing = useDeleteListing();
  const deleteBusListing = useDeleteBusListing();
  const deleteEquipmentListing = useDeleteEquipmentListing();
  const deletePart = useDeletePart();
  const deleteCarService = useDeleteCarService();
  const locale = useLocale();
  const requireAuth = useRequireAuth();
  const createConv = useCreateConversation();
  const { user } = useAuth();
  const { isFav: checkFav, toggleFav } = useFavContext();

  const isOwner = !!(user && listing.seller.id === user.id);
  const deleteMutation = {
    car: deleteListing,
    bus: deleteBusListing,
    equipment: deleteEquipmentListing,
    part: deletePart,
    service: deleteCarService,
  }[listing.type];

  // ─── Favorite entity type mapping ──────────────────────────────────────────
  const favEntityType: EntityType = (() => {
    switch (listing.type) {
      case 'car': return 'LISTING';
      case 'bus': return 'BUS_LISTING';
      case 'equipment': return 'EQUIPMENT_LISTING';
      case 'part': return 'SPARE_PART';
      case 'service': return 'CAR_SERVICE';
      default: return 'LISTING';
    }
  })();
  const saved = checkFav(`${favEntityType}:${listing.id}`);

  // ─── User location for distance calc ──────────────────────────────────────
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const lat = sessionStorage.getItem('userLat');
    const lng = sessionStorage.getItem('userLng');
    if (lat && lng) {
      setUserLat(parseFloat(lat));
      setUserLng(parseFloat(lng));
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLng(pos.coords.longitude);
          sessionStorage.setItem('userLat', String(pos.coords.latitude));
          sessionStorage.setItem('userLng', String(pos.coords.longitude));
        },
        () => {},
        { enableHighAccuracy: false, timeout: 5000 }
      );
    }
  }, []);

  const distance =
    userLat !== null && userLng !== null && listing.location
      ? haversineDistance(userLat, userLng, listing.location.lat, listing.location.lng)
      : null;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleMessage = useCallback(async () => {
    requireAuth(async () => {
      try {
        const entityTypeMap: Record<string, string> = {
          car: 'LISTING',
          bus: 'BUS_LISTING',
          equipment: 'EQUIPMENT_LISTING',
          part: 'SPARE_PART',
          service: 'CAR_SERVICE',
        };

        const conv = await createConv.mutateAsync({
          entityType: entityTypeMap[listing.type] as string,
          entityId: listing.id,
        });
        router.push(`/messages/${conv.id}`);
      } catch (err) {
        addToast(
          'error',
          err instanceof Error ? err.message : ts('errorConversation')
        );
      }
    }, ts('loginToContact'));
  }, [listing.type, listing.id, requireAuth, createConv, router, addToast]);

  const handleWhatsApp = useCallback(() => {
    if (!listing.seller.whatsapp) return;
    requireAuth(() => {
      const phone = listing.seller.whatsapp!.replace(/\D/g, '');
      const message = encodeURIComponent(ts('whatsappMessage', { title: listing.title }));
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }, ts('loginToContact'));
  }, [listing.seller.whatsapp, listing.title, requireAuth, ts]);

  const handleCall = useCallback(() => {
    if (!listing.seller.phone) return;
    requireAuth(() => {
      window.location.href = `tel:${listing.seller.phone}`;
    }, ts('loginToContact'));
  }, [listing.seller.phone, requireAuth, ts]);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: listing.title, url });
    } else {
      navigator.clipboard.writeText(url);
      addToast('success', ts('linkCopied'));
    }
  }, [listing.title, addToast]);

  const handleSave = useCallback(() => {
    requireAuth(async () => {
      try {
        await toggleFav.mutateAsync({ entityType: favEntityType, entityId: listing.id });
        addToast('success', saved ? ts('removedFromFav') : ts('addedToFav'));
      } catch {
        addToast('error', ts('errorConversation'));
      }
    }, ts('loginToContact'));
  }, [saved, addToast, requireAuth, toggleFav, favEntityType, listing.id, ts]);

  const handleReport = useCallback(() => {
    // TODO: Implement report modal
    addToast('info', ts('reportComingSoon'));
  }, [addToast]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteMutation.mutateAsync(listing.id);
      addToast('success', ts('deleteSuccessToast'));
      router.push('/my-listings');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : ts('deleteErrorToast'));
    }
  }, [deleteMutation, listing.id, addToast, router, ts]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-5xl mx-auto px-4 md:px-8 pt-4 pb-16">
        {/* ══ A — TOP BAR ══ */}
        <div className="flex items-center justify-between mb-5">
          <Breadcrumb listing={listing} config={config} homeLabel={ts('breadcrumbHome')} />

          {/* Share + Save */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-outline-variant/40 text-[12px] text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-150 cursor-pointer"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">{ts('share')}</span>
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-[12px] transition-all duration-150 cursor-pointer ${
                saved
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-outline-variant/40 text-on-surface hover:border-primary hover:text-primary hover:bg-primary/5'
              }`}
            >
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">{saved ? ts('saved') : ts('save')}</span>
            </button>
          </div>
        </div>

        {/* ══ B — TITLE SECTION ══ */}
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h1 className="text-[24px] font-bold text-on-surface leading-tight tracking-tight">
              {listing.title}
            </h1>
            {listing.isPremium && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">
                <Star size={10} className="fill-amber-500 text-amber-500" />
                {ts('premiumListing')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(listing.city || listing.governorate) && (
              <>
                <span className="text-[12px] text-on-surface-variant">
                  {[listing.city, listing.governorate, ts('country')].filter(Boolean).join('، ')}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant inline-block" />
              </>
            )}
            <ListingBadge type={listing.listingType} />
          </div>
        </div>

        {/* ══ STATUS BANNER — shown if listing is not active ══ */}
        {listing.status && !['ACTIVE', 'AVAILABLE'].includes(listing.status.toUpperCase()) && (
          <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-medium">
            <span className="material-symbols-outlined text-base">warning</span>
            {listing.status === 'SOLD' ? ts('statusSold') : ts('statusUnavailable')}
          </div>
        )}

        {/* ══ C — PHOTO GALLERY ══ */}
        <div className="mb-4">
          <PhotoGallery images={listing.images} title={listing.title} placeholderIcon={config.icon} />
        </div>

        {/* ══ MOBILE/TABLET CTA BUTTONS — Below Gallery ══ */}
        <div className="lg:hidden mb-5">
          {isOwner ? (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href={getEditRoute(listing.type, listing.id)}
                className="h-12 rounded-xl bg-primary text-on-primary text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                {ts('editListing')}
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="h-12 rounded-xl bg-error text-on-error text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-error/90 active:scale-[0.98] transition-all shadow-sm"
              >
                <Trash2 size={18} />
                {ts('deleteListing')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleMessage}
                className="h-10 rounded-xl bg-primary text-on-primary text-[12px] font-medium flex items-center justify-center gap-1"
              >
                <MessageCircle size={14} />
                {ts('contact')}
              </button>
              {listing.seller.phone ? (
                <button
                  onClick={handleCall}
                  className="h-10 rounded-xl border border-outline-variant/30 text-on-surface text-[12px] font-medium flex items-center justify-center gap-1 hover:border-primary hover:text-primary transition-colors"
                >
                  <Phone size={14} />
                  {ts('call')}
                </button>
              ) : (
                <button
                  disabled
                  className="h-10 rounded-xl border border-outline-variant/20 text-on-surface-variant/40 text-[12px] font-medium flex items-center justify-center gap-1 cursor-not-allowed bg-surface-container-low"
                >
                  <Phone size={14} />
                  {ts('call')}
                </button>
              )}
              {listing.seller.whatsapp ? (
                <button
                  onClick={handleWhatsApp}
                  className="h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-medium flex items-center justify-center gap-1 hover:bg-emerald-100 transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {ts('whatsapp')}
                </button>
              ) : (
                <button
                  disabled
                  className="h-10 rounded-xl border border-outline-variant/20 text-on-surface-variant/40 text-[12px] font-medium flex items-center justify-center gap-1 cursor-not-allowed bg-surface-container-low"
                >
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.141.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  {ts('whatsapp')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* ══ D — TWO-COLUMN LAYOUT ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">
          {/* ════ LEFT COLUMN ════ */}
          <div>
            {/* Seller Row */}
            <SellerRow seller={listing.seller} />
            <div className="h-[2px] w-50 rounded-full bg-primary mt-1 mx-auto" />

            {/* Mobile stats — views + date (desktop shows these in PriceCard) */}
            <div className="lg:hidden flex items-center gap-4 text-[11px] text-on-surface-variant mb-4 mt-3">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">visibility</span>
                {ts('views', { count: listing.views.toLocaleString('en-US') })}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {formatRelativeTime(listing.createdAt, locale)}
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                {listing.status === 'SOLD' ? ts('statusSoldShort') : ts('statusActive')}
              </span>
            </div>

            <Divider />

            {/* Description */}
            {listing.description && (
              <>
                <div>
                  <SectionTitle>{ts('descriptionTitle')}</SectionTitle>
                  <ExpandableText text={listing.description} expandLabel={ts('expand')} collapseLabel={ts('collapse')} />
                </div>
                <Divider />
              </>
            )}

            {/* Contract Details Section */}
            <ContractDetails listing={listing} />

            {/* Highlights */}
            {config.highlightFields?.length > 0 && (
              <>
                <Highlights listing={listing} fields={config.highlightFields} />
                <Divider />
              </>
            )}


            {/* Specs Grid */}
            {config.specsFields?.length > 0 && (
              <>
                <div>
                  <SectionTitle>{ts('specsTitle')}</SectionTitle>
                  <SpecsGrid listing={listing} fields={config.specsFields} />
                </div>
                <Divider />
              </>
            )}

            {/* Details Table */}
            {config.tableFields?.length > 0 && (
              <>
                <div>
                  <SectionTitle>{ts('detailsTitle', { type: config.displayName })}</SectionTitle>
                  <DetailsTable listing={listing} fields={config.tableFields} />
                </div>
              </>
            )}

            {/* Features / الكماليات */}
            {(() => {
              const features =
                listing.carData?.features ||
                listing.busData?.features ||
                listing.equipmentData?.features ||
                listing.serviceData?.features ||
                [];
              if (features.length === 0) return null;
              return (
                <>
                  <Divider />
                  <div>
                    <SectionTitle>{ts('featuresTitle')}</SectionTitle>
                    <div className="flex flex-wrap gap-2">
                      {features.map((feat) => (
                        <span
                          key={feat}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container text-[12px] text-on-surface"
                        >
                          <span className="material-symbols-outlined text-primary text-[14px] flex-shrink-0">
                            check
                          </span>
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Location Map */}
            {listing.location && (
              <>
                <Divider />
                <div>
                  <SectionTitle>{ts('locationTitle')}</SectionTitle>
                  <p className="text-[12px] text-on-surface-variant mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                    {[listing.city, listing.governorate, ts('country')].filter(Boolean).join('، ')}
                    {distance !== null && (
                      <span className="flex items-center gap-1.5 text-[11px] text-on-surface-variant ms-1">
                        {distance < 1
                          ? ts('distanceMeters', { distance: Math.round(distance * 1000) })
                          : ts('distanceKm', { distance: distance.toFixed(1) })}
                      </span>
                    )}
                  </p>
                  <div className="rounded-2xl overflow-hidden border border-border/40 shadow-sm" style={{ height: 200 }}>
                    <MapView
                      latitude={listing.location.lat}
                      longitude={listing.location.lng}
                      title={listing.title}
                      showDirections
                      showShare
                      sellerPhone={listing.seller.phone}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${listing.location.lat},${listing.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 h-10 rounded-xl bg-primary/10 text-primary text-[12px] font-medium flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">directions</span>
                      {ts('getDirections')}
                    </a>
                    <a
                      href={`https://www.google.com/maps?q=${listing.location.lat},${listing.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-10 px-4 rounded-xl border border-outline-variant/30 text-on-surface-variant text-[12px] font-medium flex items-center justify-center gap-1.5 hover:border-primary hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-base">open_in_new</span>
                      {ts('viewOnMap')}
                    </a>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* ════ RIGHT COLUMN — Price Card ════ */}
          <PriceCard
            listing={listing}
            isOwner={isOwner}
            editRoute={getEditRoute(listing.type, listing.id)}
            onMessage={handleMessage}
            onWhatsApp={handleWhatsApp}
            onCall={listing.seller.phone ? handleCall : undefined}
            onReport={handleReport}
            onDelete={isOwner ? () => setShowDeleteConfirm(true) : undefined}
          />
        </div>

        {/* ══ E — SIMILAR ITEMS ══ */}
        <SimilarItems
          type={listing.type}
          currentId={listing.id}
          governorate={listing.governorate}
        />
      </main>

      {/* ══ DELETE CONFIRMATION MODAL ══ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/20 shadow-2xl max-w-md w-full overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Header with warning icon */}
            <div className="bg-error/5 px-6 py-5 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0">
                  <Trash2 size={24} className="text-error" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-on-surface">
                    {ts('deleteConfirmTitle')}
                  </h3>
                  <p className="text-sm text-on-surface-variant mt-0.5">
                    {ts('deleteListing')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Message body */}
            <div className="px-6 py-5">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {ts('deleteConfirmMessage')}
              </p>
            </div>
            
            {/* Actions */}
            <div className="px-6 py-4 bg-surface-container-highest/30 border-t border-outline-variant/10">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 h-11 rounded-xl border border-outline-variant/30 text-on-surface text-[14px] font-medium hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-150"
                >
                  {ts('cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="flex-1 h-11 rounded-xl bg-error text-on-error text-[14px] font-medium hover:bg-error/90 active:scale-[0.98] transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-on-error/30 border-t-on-error rounded-full animate-spin" />
                      {ts('delete')}
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      {ts('delete')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
