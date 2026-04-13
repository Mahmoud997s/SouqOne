'use client';

import { useEffect } from 'react';

interface FormErrorOverlayProps {
  messages: string[];
  onClose: () => void;
}

export function FormErrorOverlay({ messages, onClose }: FormErrorOverlayProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!messages.length) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/15 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-l from-amber-400 via-orange-500 to-red-500" />

        <div className="p-6 md:p-8">
          {/* Icon + Title */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-3xl text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
            </div>
            <h3 className="text-lg font-black text-on-surface">
              يرجى تصحيح البيانات التالية
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              لإتمام نشر الإعلان، يرجى مراجعة الحقول أدناه
            </p>
          </div>

          {/* Error list */}
          <div className="space-y-2.5 mb-6 max-h-[40vh] overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className="flex items-start gap-3 bg-surface-container-low rounded-xl p-3 border border-outline-variant/10">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xs">close</span>
                </span>
                <p className="text-sm font-medium text-on-surface leading-relaxed">{msg}</p>
              </div>
            ))}
          </div>

          {/* Action */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-black hover:brightness-110 transition-all shadow-ambient"
          >
            فهمت، سأصحح البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
