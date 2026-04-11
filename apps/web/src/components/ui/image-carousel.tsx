'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: { id?: string; url: string }[];
  alt: string;
  badge?: React.ReactNode;
}

export function ImageCarousel({ images, alt, badge }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < images.length) setCurrent(idx);
    },
    [images.length]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    // RTL: swipe left = next in LTR, but in RTL swipe right = next
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        // Swipe right (RTL: next)
        goTo(current + 1);
      } else {
        // Swipe left (RTL: prev)
        goTo(current - 1);
      }
    }
  };

  const currentUrl = images[current]?.url;

  if (images.length === 0) {
    return (
      <div className="relative aspect-[16/10] bg-surface-container-low flex items-center justify-center text-on-surface-variant/30">
        <span className="material-symbols-outlined text-7xl">directions_car</span>
      </div>
    );
  }

  // Fullscreen overlay
  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
        onClick={() => setFullscreen(false)}
      >
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <div
          className="w-full h-full flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => e.stopPropagation()}
        >
          {currentUrl && (
            <Image
              src={currentUrl}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          )}
        </div>
        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-6 inset-x-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
          </div>
        )}
        {/* Counter */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
          {current + 1} / {images.length}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Main image — swipeable */}
      <div
        className="relative aspect-[16/10] bg-surface-container-low cursor-pointer overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => setFullscreen(true)}
      >
        {currentUrl && (
          <Image
            src={currentUrl}
            alt={alt}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            priority={current === 0}
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Badge */}
        {badge && <div className="absolute top-4 right-4">{badge}</div>}

        {/* Counter on mobile */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            {current + 1} / {images.length}
          </div>
        )}

        {/* Nav arrows (desktop) */}
        {images.length > 1 && (
          <>
            {current > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goTo(current - 1); }}
                className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
            )}
            {current < images.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goTo(current + 1); }}
                className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Dots indicator (mobile) */}
      {images.length > 1 && images.length <= 8 && (
        <div className="flex justify-center gap-1.5 py-3 md:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-primary w-4' : 'bg-outline-variant/30 w-1.5'}`}
            />
          ))}
        </div>
      )}

      {/* Thumbnails (desktop) */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2 p-3 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => goTo(i)}
              className={`shrink-0 w-20 h-20 overflow-hidden transition-all ${
                i === current ? 'border-2 border-primary ring-2 ring-primary/20' : 'border-2 border-outline-variant/20 dark:border-outline-variant/30 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover !relative" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
