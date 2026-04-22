/**
 * Unified photo gallery component with Lightbox, Desktop Grid, and Mobile Swiper.
 * Extracted from cars/[id]/page.tsx for reuse across all listing types.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Dynamic import for Lightbox (heavy component)
const Lightbox = dynamic(() => import('./Lightbox'), { ssr: false });

interface PhotoGalleryProps {
  images: string[];
  title: string;
  /** Material icon name for placeholder (default: 'image') */
  placeholderIcon?: string;
}

/**
 * Main photo gallery component.
 * Renders desktop grid + mobile swiper, manages lightbox state.
 */
export function PhotoGallery({ images, title, placeholderIcon = 'image' }: PhotoGalleryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const handleShowAll = useCallback((idx: number) => {
    setLightboxIdx(idx);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIdx(null);
  }, []);

  return (
    <>
      {lightboxIdx !== null && (
        <Lightbox
          images={images.map((url, i) => ({ id: String(i), url }))}
          startIndex={lightboxIdx}
          onClose={handleCloseLightbox}
        />
      )}

      {/* Desktop Grid */}
      <PhotoGrid
        images={images}
        title={title}
        onShowAll={handleShowAll}
        placeholderIcon={placeholderIcon}
      />

      {/* Mobile Swiper */}
      <MobileSwiper
        images={images}
        title={title}
        onShowAll={handleShowAll}
        placeholderIcon={placeholderIcon}
      />
    </>
  );
}

// ─── Desktop Photo Grid ────────────────────────────────────────────────────

interface PhotoGridProps {
  images: string[];
  title: string;
  onShowAll: (idx: number) => void;
  placeholderIcon: string;
}

function PhotoGrid({ images, title, onShowAll, placeholderIcon }: PhotoGridProps) {
  // Fill to 5 images with empty placeholders
  const filled: string[] = [...images];
  while (filled.length < 5) filled.push('');

  const Placeholder = () => (
    <div className="w-full h-full bg-surface-container flex items-center justify-center text-on-surface-variant">
      <span className="material-symbols-outlined text-4xl opacity-20">{placeholderIcon}</span>
    </div>
  );

  return (
    <div className="hidden md:block relative">
      <div
        className="grid gap-1 rounded-2xl overflow-hidden"
        style={{ gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '185px 185px' }}
      >
        {/* Main large — spans 2 rows */}
        <button
          onClick={() => onShowAll(0)}
          className="relative col-span-1 row-span-2 overflow-hidden"
          style={{ gridRow: '1 / 3', gridColumn: '1 / 2' }}
        >
          {filled[0] ? (
            <Image
              src={filled[0]}
              alt={title}
              fill
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
              sizes="50vw"
            />
          ) : (
            <Placeholder />
          )}
        </button>

        {/* 4 small cells */}
        {filled.slice(1, 5).map((url, i) => (
          <button
            key={i}
            onClick={() => onShowAll(i + 1)}
            className="relative overflow-hidden group bg-surface-container"
          >
            {url ? (
              <Image
                src={url}
                alt={`${title} ${i + 2}`}
                fill
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                sizes="25vw"
              />
            ) : (
              <Placeholder />
            )}
            {/* +N overlay on last cell */}
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-black text-xl">+{images.length - 5}</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Show all button */}
      <button
        onClick={() => onShowAll(0)}
        className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm border border-outline-variant/30 rounded-lg px-3 py-1.5 text-[12px] font-medium text-on-surface shadow-sm hover:bg-white transition-colors cursor-pointer z-10 flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">grid_view</span>
        عرض كل الصور ({images.length})
      </button>
    </div>
  );
}

// ─── Mobile Photo Swiper ───────────────────────────────────────────────────

interface MobileSwiperProps {
  images: string[];
  title: string;
  onShowAll: (idx: number) => void;
  placeholderIcon: string;
}

function MobileSwiper({ images, title, onShowAll, placeholderIcon }: MobileSwiperProps) {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = e.changedTouches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setIdx((i) => Math.min(i + 1, images.length - 1));
      else setIdx((i) => Math.max(i - 1, 0));
    }
  }

  if (!images.length) {
    return (
      <div className="md:hidden h-64 bg-surface-container-low flex items-center justify-center">
        <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">
          {placeholderIcon}
        </span>
      </div>
    );
  }

  return (
    <div
      className="md:hidden relative h-64 overflow-hidden bg-black"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Image
        src={images[idx]}
        alt={title}
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
        {idx + 1} / {images.length}
      </div>
      <button
        onClick={() => onShowAll(idx)}
        className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1"
      >
        <span className="material-symbols-outlined text-sm">grid_view</span>الكل
      </button>
      {images.length > 1 && (
        <div className="absolute bottom-10 inset-x-0 flex justify-center gap-1">
          {images.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? 'bg-white w-4' : 'bg-white/50 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
