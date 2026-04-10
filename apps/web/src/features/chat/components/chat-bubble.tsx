'use client';

import { useState } from 'react';
import { Check, CheckCheck, Loader2, Trash2, Ban } from 'lucide-react';
import { QuickReactions } from './emoji-picker';
import { AudioPlayer } from './voice-recorder';
import type { Message } from '@/lib/api';

interface ChatBubbleProps {
  message: Message;
  isMine: boolean;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}

export function ChatBubble({ message, isMine, onDelete, onReact }: ChatBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);

  const time = new Date(message.createdAt).toLocaleTimeString('ar-OM', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const groupedReactions = message.reactions?.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] || 0) + 1;
    return acc;
  }, {}) ?? {};

  const hasReactions = Object.keys(groupedReactions).length > 0;

  return (
    <div className={`flex ${isMine ? 'justify-start' : 'justify-end'} mb-[2px] group relative px-1`}>
      <div
        className={`relative ${hasReactions ? 'mb-3' : ''}`}
        style={{ maxWidth: 'min(78%, 440px)' }}
        onDoubleClick={() => !message.isDeleted && setShowReactions(s => !s)}
      >
        {/* Quick reactions popup */}
        {showReactions && (
          <QuickReactions
            onReact={(emoji) => { onReact(message.id, emoji); setShowReactions(false); }}
            onClose={() => setShowReactions(false)}
          />
        )}

        {/* Bubble */}
        <div
          className={`relative ${
            message.isDeleted
              ? 'bg-surface-container/50 rounded-2xl px-4 py-2.5'
              : isMine
                ? 'bg-primary text-on-primary rounded-t-2xl rounded-bl-2xl rounded-br-md px-3.5 py-2 shadow-[0_1px_3px_rgba(0,74,198,0.12)]'
                : 'bg-surface-container-lowest text-on-surface rounded-t-2xl rounded-br-2xl rounded-bl-md px-3.5 py-2 shadow-[0_1px_4px_rgba(0,0,0,0.05)] ring-1 ring-outline-variant/[0.06]'
          }`}
        >
          {message.isDeleted ? (
            <p className="text-[12px] text-on-surface-variant/40 flex items-center gap-1.5 italic">
              <Ban size={12} className="shrink-0" /> تم حذف هذه الرسالة
            </p>
          ) : message.type === 'IMAGE' && message.mediaUrl ? (
            <div className="-mx-1 -mt-0.5">
              <img
                src={message.mediaUrl}
                alt="صورة"
                className="rounded-xl max-w-full max-h-72 object-cover cursor-pointer hover:brightness-[0.97] transition-all"
                onClick={() => window.open(message.mediaUrl!, '_blank')}
              />
            </div>
          ) : message.type === 'AUDIO' && message.mediaUrl ? (
            <AudioPlayer src={message.mediaUrl} />
          ) : (
            <p className="text-[13.5px] leading-[1.6] whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}

          {/* Time + status — inline with text */}
          {!message.isDeleted && (
            <div className={`flex items-center gap-1 mt-0.5 ${isMine ? 'justify-start' : 'justify-end'}`}>
              <span className={`text-[10px] tabular-nums ${
                isMine ? 'text-on-primary/45' : 'text-on-surface-variant/35'
              }`}>
                {time}
              </span>
              {isMine && (
                <span className={
                  message.isRead || message.status === 'read'
                    ? 'text-blue-200'
                    : 'text-on-primary/30'
                }>
                  {message.status === 'sending' ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : message.isRead || message.status === 'read' ? (
                    <CheckCheck size={13} strokeWidth={2.5} />
                  ) : (
                    <Check size={13} strokeWidth={2.5} />
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Reactions display */}
        {hasReactions && (
          <div className={`flex gap-1 absolute -bottom-3 ${isMine ? 'right-2' : 'left-2'}`}>
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className="bg-surface-container-lowest rounded-full px-1.5 py-0.5 text-[12px] shadow-md ring-1 ring-outline-variant/[0.06] hover:ring-primary/20 transition-all flex items-center gap-0.5 hover:scale-110 active:scale-95"
              >
                {emoji}{count > 1 && <span className="text-[9px] font-bold text-on-surface-variant/50">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Delete button (hover, own messages only) */}
        {isMine && !message.isDeleted && !message.id.startsWith('temp-') && (
          <button
            onClick={() => onDelete(message.id)}
            className="absolute top-1.5 left-1.5 opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          >
            <Trash2 size={11} className="text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
