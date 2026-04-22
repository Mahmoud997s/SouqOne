/**
 * Full-screen image lightbox with keyboard navigation.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

interface ImageItem {
  id: string;
  url: string;
}

interface LightboxProps {
  images: ImageItem[];
  startIndex: number;
  onClose: () => void;
}

export function Lightbox({ images, startIndex, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(startIndex);

  const prev = useCallback(
    () => setIdx((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );

  const next = useCallback(
    () => setIdx((i) => (i + 1) % images.length),
    [images.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') next();
      if (e.key === 'ArrowRight') prev();
    }
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  const currentImage = images[idx];

  return (
    <div className="fixed inset-0 z-[9999] bg-[#060e1e] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0 border-b border-white/10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-white/80 text-xl">close</span>
        </button>
        <span className="text-white/60 text-sm font-bold tracking-wider">
          {idx + 1} / {images.length}
        </span>
        <div className="w-10" />
      </div>

      {/* Main image */}
      <div className="flex-1 relative min-h-0">
        {currentImage && (
          <Image
            src={currentImage.url}
            alt={`صورة ${idx + 1}`}
            fill
            className="object-contain"
            sizes="100vw"
            priority
          />
        )}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute top-1/2 right-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined text-white text-2xl">chevron_right</span>
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined text-white text-2xl">chevron_left</span>
      </button>

      {/* Thumbnails */}
      <div className="shrink-0 flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar justify-center border-t border-white/10">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIdx(i)}
            className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
              i === idx ? 'border-primary scale-105' : 'border-white/10 opacity-40 hover:opacity-70'
            }`}
          >
            <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default Lightbox;
