'use client';

import { MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MessagesPage() {
  const tp = useTranslations('pages');
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-container-low/20">
      <div className="text-center px-6">
        {/* Decorative icon stack */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-3xl bg-primary/[0.04] rotate-6" />
          <div className="absolute inset-0 rounded-3xl bg-primary/[0.06] -rotate-3" />
          <div className="relative w-full h-full rounded-3xl bg-primary/[0.08] flex items-center justify-center">
            <MessageCircle size={36} className="text-primary/40" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-lg font-black text-on-surface mb-2">{tp('msgChatTitle')}</h2>
        <p className="text-[12px] text-on-surface-variant/45 max-w-[260px] mx-auto leading-relaxed mb-5">
          {tp('msgChatSubtitle')}
        </p>
        <div className="flex items-center justify-center gap-1 text-[11px] text-on-surface-variant/30">
          <ArrowRight size={12} />
          <span>{tp('msgChatSelect')}</span>
        </div>
      </div>
    </div>
  );
}
