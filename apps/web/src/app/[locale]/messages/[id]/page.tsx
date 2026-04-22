'use client';

import { useParams } from 'next/navigation';
import { useChatRoom } from '@/features/chat/hooks/use-chat-room';
import { ChatHeader } from '@/features/chat/components/chat-header';
import { ChatBubble } from '@/features/chat/components/chat-bubble';
import { DateSeparator } from '@/features/chat/components/date-separator';
import { ChatInput } from '@/features/chat/components/chat-input';
import { WifiOff, Loader2, RefreshCw, MessageCircle, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ChatRoomPage() {
  const { id: conversationId } = useParams<{ id: string }>();

  const {
    user,
    isLoading,
    isError,
    refetch,
    connected,
    convInfo,
    otherParticipant,
    otherOnline,
    isTyping,
    searchMode,
    searchQuery,
    setSearchQuery,
    toggleSearch,
    displayMessages,
    messagesEndRef,
    handleSend,
    handleImageUpload,
    handleVoiceSend,
    handleTypingEmit,
    handleDelete,
    handleReact,
  } = useChatRoom(conversationId);
  const tp = useTranslations('pages');

  // ── Render ──

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-surface-container-low/20">
        <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
        <span className="text-[11px] text-on-surface-variant/40">{tp('msgChatLoading')}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface-container-low/20">
        <div className="text-center px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <WifiOff size={24} className="text-red-400" />
          </div>
          <p className="text-sm font-semibold text-on-surface/70 mb-1">{tp('msgChatError')}</p>
          <p className="text-[11px] text-on-surface-variant/40 mb-4">{tp('msgChatErrorDesc')}</p>
          <button
            onClick={() => refetch()}
            className="bg-primary text-on-primary hover:brightness-110 rounded-xl px-5 py-2.5 text-xs font-bold inline-flex items-center gap-2 active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw size={13} />
            {tp('msgChatRetry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Connection indicator */}
      {!connected && (
        <div className="bg-amber-500/90 backdrop-blur-sm text-white text-[11px] text-center py-2 flex items-center justify-center gap-2 font-medium">
          <WifiOff size={13} />
          <span>{tp('msgChatReconnecting')}</span>
          <Loader2 size={12} className="animate-spin" />
        </div>
      )}

      {/* Header */}
      <ChatHeader
        participant={otherParticipant}
        listing={convInfo?.listing ?? null}
        entityType={convInfo?.entityType}
        isOnline={otherOnline}
        isTyping={isTyping}
        searchMode={searchMode}
        onToggleSearch={toggleSearch}
      />

      {/* Search bar */}
      {searchMode && (
        <div className="px-4 py-2.5 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/8">
          <div className="relative">
            <Search size={14} className="absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant/35" />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder={tp('msgChatSearchPlaceholder')} autoFocus
              className="w-full pe-9 ps-3 py-2.5 bg-surface-container rounded-xl text-xs border-none focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-on-surface-variant/30 transition-shadow"
            />
          </div>
        </div>
      )}

      {/* Messages area */}
      <div
        className="flex-1 overflow-y-auto px-3 sm:px-5 py-4 flex flex-col bg-surface-container-low/20"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,74,198,0.015) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(0,74,198,0.01) 0%, transparent 40%),
                            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.015'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2l4 3-4 3z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {displayMessages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
              <MessageCircle size={28} className="text-primary/25" />
            </div>
            <p className="text-[12px] text-on-surface-variant/35 font-medium">{tp('msgChatStartConversation')}</p>
          </div>
        )}

        {displayMessages.map((msg, i) => {
          const showDate = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(displayMessages[i - 1].createdAt).toDateString();
          return (
            <div key={msg.id}>
              {showDate && <DateSeparator date={new Date(msg.createdAt)} />}
              <ChatBubble
                message={msg}
                isMine={msg.senderId === user?.id}
                onDelete={handleDelete}
                onReact={handleReact}
              />
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-end mb-1 px-1">
            <div className="bg-surface-container-lowest rounded-2xl rounded-bl-md px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ring-1 ring-outline-variant/[0.04]">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onImageUpload={handleImageUpload}
        onVoiceSend={handleVoiceSend}
        onTyping={handleTypingEmit}
      />
    </div>
  );
}
