'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Link } from '@/i18n/navigation';
import { useLeafletCSS } from '@/hooks/use-leaflet-css';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations } from 'next-intl';

// Fix Leaflet default marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom icons for sale vs rental
const SaleIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:#1D4ED8;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M21.41 11.58l-9-9C12.04 2.21 11.53 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .53.21 1.04.59 1.41l9 9c.36.36.86.59 1.41.59.55 0 1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const RentalIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:#22C55E;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">
    <svg width="14" height="14" fill="white" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface ListingMarker {
  id: string;
  title: string;
  price: string;
  currency: string;
  latitude: number;
  longitude: number;
  listingType?: 'SALE' | 'RENTAL';
  imageUrl?: string | null;
  governorate?: string | null;
  make?: string;
  model?: string;
  year?: number;
}

interface ListingsMapProps {
  listings: ListingMarker[];
  height?: string;
  userLocation?: { lat: number; lng: number } | null;
}

// Auto-fit map bounds to all markers
function FitBounds({ listings }: { listings: ListingMarker[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (listings.length === 0 || fitted.current) return;
    const bounds = L.latLngBounds(
      listings.map(l => [l.latitude, l.longitude] as [number, number])
    );
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
    fitted.current = true;
  }, [listings, map]);

  return null;
}

export default function ListingsMap({ listings, height = 'h-[500px]', userLocation }: ListingsMapProps) {
  useLeafletCSS();
  const tp = useTranslations('pages');
  const markersWithLocation = listings.filter(l => l.latitude && l.longitude);

  // Default center: Muscat or user location
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [23.5880, 58.3829];

  if (markersWithLocation.length === 0) {
    return (
      <div className={`${height} rounded-2xl bg-surface-container-low flex items-center justify-center`}>
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">map</span>
          <p className="text-on-surface-variant font-medium">{tp('listingsMapNoListings')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${height} rounded-2xl overflow-hidden border border-outline-variant/30 relative z-0`}>
      <MapContainer
        center={defaultCenter}
        zoom={8}
        className="h-full w-full"
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FitBounds listings={markersWithLocation} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'user-marker',
              html: `<div style="background:#3B82F6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3),0 2px 6px rgba(0,0,0,0.3)"></div>`,
              iconSize: [18, 18],
              iconAnchor: [9, 9],
            })}
          >
            <Popup><span className="font-bold text-sm">{tp('listingsMapYourLocation')}</span></Popup>
          </Marker>
        )}

        {/* Listing markers */}
        {markersWithLocation.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={listing.listingType === 'RENTAL' ? RentalIcon : SaleIcon}
          >
            <Popup maxWidth={260} minWidth={220}>
              <div className="p-0 -m-[1px]">
                {getImageUrl(listing.imageUrl) && (
                  <div className="relative w-full h-28 overflow-hidden rounded-t-lg">
                    <Image
                      src={getImageUrl(listing.imageUrl)!}
                      alt={listing.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-3">
                  <h4 className="font-bold text-sm text-on-surface line-clamp-1 mb-1">{listing.title}</h4>
                  {listing.make && (
                    <p className="text-xs text-on-surface-variant mb-2">
                      {listing.make} {listing.model} · {listing.year}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-extrabold text-sm">
                      {Number(listing.price).toLocaleString('en-US')} {listing.currency}
                    </span>
                    <Link
                      href={`/sale/car/${listing.id}`}
                      className="bg-primary text-white px-3 py-1.5 rounded-lg text-[11px] font-bold hover:bg-primary/90 transition-all"
                    >
                      {tp('listingsMapView')}
                    </Link>
                  </div>
                  {listing.governorate && (
                    <p className="text-[11px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {listing.governorate}
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2 shadow-lg z-[1000] flex items-center gap-4 text-[11px] font-bold">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow" />
          {tp('listingsMapSale')}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow" />
          {tp('listingsMapRental')}
        </div>
        {userLocation && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
            {tp('listingsMapYou')}
          </div>
        )}
      </div>
    </div>
  );
}
