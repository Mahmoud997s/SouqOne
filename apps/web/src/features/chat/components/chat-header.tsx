'use client';

import Image from 'next/image';
import { Link, useRouter } from '@/i18n/navigation';
import { ArrowRight, Search, X, MoreVertical, ExternalLink } from 'lucide-react';
import { getImageUrl } from '@/lib/image-utils';
import { useTranslations } from 'next-intl';

interface Participant {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface ListingInfo {
  id: string;
  title: string;
  price?: number;
  currency?: string;
  images?: { url: string }[];
}

interface ChatHeaderProps {
  participant: Participant | null;
  listing: ListingInfo | null;
  isOnline: boolean;
  isTyping: boolean;
  searchMode: boolean;
  onToggleSearch: () => void;
}

export function ChatHeader({
  participant,
  listing,
  isOnline,
  isTyping,
  searchMode,
  onToggleSearch,
}: ChatHeaderProps) {
  const router = useRouter();
  const tp = useTranslations('pages');
  const name = participant?.displayName || participant?.username || tp('chatDefaultUser');

  return (
    <div className="bg-surface-container-lowest/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between z-10 border-b border-outline-variant/8 shrink-0">
      {/* Left: back + avatar + info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => router.push('/messages')}
          className="lg:hidden w-8 h-8 rounded-xl hover:bg-surface-container-high flex items-center justify-center transition-colors shrink-0"
        >
          <ArrowRight size={18} className="text-on-surface-variant" />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          {participant?.avatarUrl ? (
            <Image src={getImageUrl(participant.avatarUrl) || ''} alt={name} width={44} height={44} className="w-11 h-11 rounded-2xl object-cover ring-2 ring-outline-variant/5" />
          ) : (
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-black text-sm">
              {name[0]?.toUpperCase() || '?'}
            </div>
          )}
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-[2.5px] border-surface-container-lowest rounded-full" />
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-black text-[14px] text-on-surface truncate leading-tight">{name}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isTyping ? (
              <span className="text-primary text-[11px] font-semibold flex items-center gap-1">
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                {tp('chatTyping')}
              </span>
            ) : isOnline ? (
              <span className="text-green-600 text-[11px] font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {tp('chatOnline')}
              </span>
            ) : (
              <span className="text-on-surface-variant/40 text-[11px]">{tp('chatOffline')}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleSearch}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${searchMode ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container-high text-on-surface-variant/40'}`}
        >
          {searchMode ? <X size={17} /> : <Search size={17} />}
        </button>
        {listing && (
          <Link
            href={`/cars/${listing.id}`}
            className="hidden md:flex items-center gap-1.5 text-primary hover:bg-primary/8 px-3 py-2 rounded-xl text-[11px] font-bold transition-all"
          >
            <ExternalLink size={13} />
            {tp('chatViewListing')}
          </Link>
        )}
        <button className="w-9 h-9 rounded-xl hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant/40 transition-colors">
          <MoreVertical size={17} />
        </button>
      </div>
    </div>
  );
}
