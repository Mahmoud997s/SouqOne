'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useLeafletCSS } from '@/hooks/use-leaflet-css';
import { useTranslations, useLocale } from 'next-intl';

// Fix Leaflet default marker icon issue in Next.js
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

interface MapViewProps {
  latitude: number;
  longitude: number;
  title?: string;
  zoom?: number;
  height?: string;
  showDirections?: boolean;
  showShare?: boolean;
  sellerPhone?: string | null;
}

export default function MapView({
  latitude,
  longitude,
  title,
  zoom = 14,
  height = 'h-[300px]',
  showDirections = true,
  showShare = true,
  sellerPhone,
}: MapViewProps) {
  useLeafletCSS();
  const tp = useTranslations('pages');
  const locale = useLocale();
  const [address, setAddress] = useState<string>('');
  const [shareOpen, setShareOpen] = useState(false);

  // Reverse geocoding via Nominatim (free)
  useEffect(() => {
    if (!latitude || !longitude) return;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${locale}`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) {
          const parts = data.display_name.split(',').slice(0, 3);
          setAddress(parts.join(locale === 'ar' ? '، ' : ', '));
        }
      })
      .catch(() => {});
  }, [latitude, longitude, locale]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  const shareText = `📍 ${title || tp('mapViewListingLocation')}\n${googleMapsUrl}`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(googleMapsUrl)}&text=${encodeURIComponent(title || tp('mapViewListingLocation'))}`;

  function copyLink() {
    navigator.clipboard.writeText(googleMapsUrl).then(() => {
      setShareOpen(false);
    });
  }

  return (
    <div className="space-y-3">
      <div className={`${height} rounded-2xl overflow-hidden border border-outline-variant/30 relative z-0`}>
        <MapContainer
          center={[latitude, longitude]}
          zoom={zoom}
          className="h-full w-full"
          scrollWheelZoom={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[latitude, longitude]}>
            {title && <Popup><span className="font-bold text-sm">{title}</span></Popup>}
          </Marker>
        </MapContainer>
      </div>

      {/* العنوان */}
      {address && (
        <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-primary">pin_drop</span>
          {address}
        </p>
      )}

      {/* أزرار الإجراءات */}
      <div className="flex flex-wrap gap-2">
        {showDirections && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">directions</span>
            {tp('mapViewDirections')}
          </a>
        )}

        {sellerPhone && (
          <>
            <a
              href={`https://wa.me/${sellerPhone.replace(/[^0-9+]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#25D366]/90 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.61.609l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.315 0-4.458-.768-6.178-2.064l-.354-.28-3.244 1.088 1.088-3.244-.28-.354A9.935 9.935 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              {tp('mapViewWhatsapp')}
            </a>
            <a
              href={`tel:${sellerPhone}`}
              className="flex items-center gap-2 bg-surface-container-low text-on-surface px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined text-sm">call</span>
              {tp('mapViewCall')}
            </a>
          </>
        )}

        {showShare && (
          <div className="relative">
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="flex items-center gap-2 bg-surface-container-low text-on-surface px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-surface-container-high transition-all"
            >
              <span className="material-symbols-outlined text-sm">share</span>
              {tp('mapViewShare')}
            </button>

            {shareOpen && (
              <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-outline-variant/20 py-2 min-w-[180px] z-50">
                <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-sm">
                  <span className="text-[#25D366]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                  </span>
                  {tp('mapViewShareWhatsapp')}
                </a>
                <a href={telegramShareUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-sm">
                  <span className="text-[#0088cc]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  </span>
                  {tp('mapViewShareTelegram')}
                </a>
                <button onClick={copyLink} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-sm w-full text-start">
                  <span className="material-symbols-outlined text-base text-on-surface-variant">content_copy</span>
                  {tp('mapViewCopyLink')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

