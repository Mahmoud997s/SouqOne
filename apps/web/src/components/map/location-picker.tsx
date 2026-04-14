'use client';

import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLeafletCSS } from '@/hooks/use-leaflet-css';
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

// مسقط، عمان
const DEFAULT_CENTER: [number, number] = [23.5880, 58.3829];

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) {
      map.flyTo([lat, lng], 15, { duration: 1 });
    }
  }, [lat, lng, map]);
  return null;
}

export default function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  useLeafletCSS();
  const tp = useTranslations('pages');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const center: [number, number] = latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER;
  const hasPin = latitude !== null && longitude !== null;

  const handleClick = useCallback((lat: number, lng: number) => {
    setError('');
    onChange(lat, lng);
  }, [onChange]);

  function handleLocateMe() {
    if (!navigator.geolocation) {
      setError(tp('mapBrowserUnsupported'));
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError(tp('mapPermissionDenied'));
            break;
          case err.POSITION_UNAVAILABLE:
            setError(tp('mapPositionUnavailable'));
            break;
          case err.TIMEOUT:
            setError(tp('mapTimeout'));
            break;
          default:
            setError(tp('mapError'));
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  return (
    <div className="space-y-3">
      {/* زرار تحديد الموقع */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locating}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all disabled:opacity-60"
        >
          {locating ? (
            <>
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
              {tp('mapLocating')}
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-sm">my_location</span>
              {tp('mapLocateMe')}
            </>
          )}
        </button>
        <span className="text-xs text-on-surface-variant">{tp('mapClickHint')}</span>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* الخريطة */}
      <div className="h-[280px] rounded-2xl overflow-hidden border border-outline-variant/30 relative z-0">
        <MapContainer
          center={center}
          zoom={hasPin ? 15 : 10}
          className="h-full w-full"
          scrollWheelZoom={true}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onClick={handleClick} />
          {hasPin && (
            <>
              <Marker
                position={[latitude!, longitude!]}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target as L.Marker;
                    const pos = marker.getLatLng();
                    onChange(pos.lat, pos.lng);
                  },
                }}
              />
              <FlyToLocation lat={latitude!} lng={longitude!} />
            </>
          )}
        </MapContainer>
      </div>

      {/* الإحداثيات */}
      {hasPin && (
        <div className="flex items-center gap-4 text-xs text-on-surface-variant bg-surface-container-low rounded-xl px-4 py-2.5">
          <span className="material-symbols-outlined text-sm text-primary">location_on</span>
          <span>{tp('mapLat')} <strong className="text-on-surface">{latitude!.toFixed(6)}</strong></span>
          <span>{tp('mapLng')} <strong className="text-on-surface">{longitude!.toFixed(6)}</strong></span>
        </div>
      )}
    </div>
  );
}
