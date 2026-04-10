'use client';

import { useState } from 'react';

const EMOJI_CATEGORIES = [
  { label: 'شائعة', emojis: ['😀','😂','🥹','😍','🥰','😎','🤩','😊','🙂','😅','😢','😭','😤','😡','🥺','😱','🤔','🤗','😴','🤮'] },
  { label: 'إيماءات', emojis: ['👍','👎','👏','🙌','🤝','✌️','🤞','👋','🫡','💪','🙏','❤️','🔥','⭐','💯','✅','❌','🎉','💰','🚗'] },
];

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ onSelect, onClose }: EmojiPickerProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="absolute bottom-full mb-2 right-0 w-72 bg-surface-container-lowest rounded-2xl shadow-2xl ring-1 ring-outline-variant/10 overflow-hidden z-50 backdrop-blur-xl">
      {/* Tabs */}
      <div className="flex border-b border-outline-variant/8">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              activeTab === i ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant/40 hover:text-on-surface-variant/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="p-2.5 grid grid-cols-8 gap-0.5 max-h-44 overflow-y-auto">
        {EMOJI_CATEGORIES[activeTab].emojis.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onSelect(emoji); onClose(); }}
            className="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-container-high rounded-lg transition-all hover:scale-110 active:scale-95"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

// Quick reactions bar for messages
const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

export function QuickReactions({ onReact, onClose }: { onReact: (emoji: string) => void; onClose: () => void }) {
  return (
    <div className="absolute -top-11 left-1/2 -translate-x-1/2 flex gap-0.5 bg-surface-container-lowest rounded-2xl shadow-2xl ring-1 ring-outline-variant/10 px-2 py-1.5 z-50 backdrop-blur-xl">
      {QUICK_REACTIONS.map(emoji => (
        <button
          key={emoji}
          onClick={() => { onReact(emoji); onClose(); }}
          className="w-8 h-8 flex items-center justify-center text-lg hover:bg-surface-container-high rounded-xl transition-all hover:scale-125 active:scale-95"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
