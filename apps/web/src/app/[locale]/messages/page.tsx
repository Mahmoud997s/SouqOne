'use client';

import { MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function MessagesPage() {
  const tp = useTranslations('pages');
  return (
    <div className="flex-1 flex items-center justify-center bg-surface-container-low/10"
      style={{ backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(0,74,198,0.04) 0%, transparent 60%)' }}>
      <div className="text-center px-6 max-w-xs">
        {/* Gradient icon */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-2xl bg-primary/[0.06] rotate-6 scale-90" />
          <div className="absolute inset-0 rounded-2xl bg-primary/[0.08] -rotate-3 scale-95" />
          <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center shadow-sm">
            <MessageCircle size={32} className="text-primary/50" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-[16px] font-bold text-on-surface mb-1.5">{tp('msgChatTitle')}</h2>
        <p className="text-[12px] text-on-surface-variant/60 leading-relaxed mb-5">
          {tp('msgChatSubtitle')}
        </p>
        <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary/8 text-primary text-[11px] font-medium">
          <ArrowRight size={12} />
          <span>{tp('msgChatSelect')}</span>
        </div>
      </div>
    </div>
  );
}
