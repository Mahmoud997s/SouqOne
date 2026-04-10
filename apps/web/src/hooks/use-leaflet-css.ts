'use client';

import { useEffect } from 'react';

const LEAFLET_CSS_ID = 'leaflet-css';
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_OVERRIDES_ID = 'leaflet-overrides';

const OVERRIDES = `
.leaflet-container { font-family: inherit; z-index: 0; }
.leaflet-tile-pane img { max-width: none !important; }
.leaflet-popup-content-wrapper { border-radius: 16px !important; box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important; padding: 0 !important; overflow: hidden; }
.leaflet-popup-content { margin: 0 !important; line-height: 1.5 !important; }
.leaflet-popup-tip { box-shadow: none !important; }
.leaflet-control-zoom a { display: flex !important; align-items: center !important; justify-content: center !important; }
.custom-marker, .user-marker { background: none !important; border: none !important; }
`;

export function useLeafletCSS() {
  useEffect(() => {
    // Load Leaflet CSS from CDN (only once)
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement('link');
      link.id = LEAFLET_CSS_ID;
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }

    // Add overrides (only once)
    if (!document.getElementById(LEAFLET_OVERRIDES_ID)) {
      const style = document.createElement('style');
      style.id = LEAFLET_OVERRIDES_ID;
      style.textContent = OVERRIDES;
      document.head.appendChild(style);
    }
  }, []);
}
