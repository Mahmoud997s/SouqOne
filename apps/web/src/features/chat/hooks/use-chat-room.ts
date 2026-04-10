'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useMessages, useMarkRead, useUploadImage, useConversations, type Message } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';
import { connectSocket } from '@/lib/socket';

export function useChatRoom(conversationId: string) {
  const { user } = useAuth();
  const { data: msgData, isLoading, isError, refetch } = useMessages(conversationId);
  const markRead = useMarkRead(conversationId);
  const uploadImage = useUploadImage();
  const { data: allConversations } = useConversations();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(true);
  const [otherOnline, setOtherOnline] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingRef = useRef(0);

  const convInfo = allConversations?.find(c => c.id === conversationId) ?? null;
  const otherParticipant = convInfo?.participants?.find(p => p.id !== user?.id) ?? null;

  // Notification sound — short beep via AudioContext (no external file needed)
  const audioCtxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    try {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { audioCtxRef.current = null; }
  }, []);
  const playNotifSound = useCallback(() => {
    try {
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain).connect(ctx.destination);
      ctx.resume().then(() => { osc.start(); osc.stop(ctx.currentTime + 0.15); });
    } catch {}
  }, []);

  // Load initial messages from API
  useEffect(() => {
    if (msgData?.items) setMessages([...msgData.items].reverse());
  }, [msgData]);

  // Mark as read
  useEffect(() => {
    if (msgData) markRead.mutate();
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket
  useEffect(() => {
    if (!user) return;
    const socket = connectSocket();
    socket.emit('join-conversation', { conversationId });

    const onConnect = () => { setConnected(true); socket.emit('join-conversation', { conversationId }); };
    const onDisconnect = () => setConnected(false);

    const onMessage = (msg: Message) => {
      setMessages(prev => {
        const withoutTemp = prev.filter(
          m => !(m.id.startsWith('temp-') && m.content === msg.content && m.senderId === msg.senderId),
        );
        if (withoutTemp.some(m => m.id === msg.id)) return withoutTemp;
        return [...withoutTemp, msg];
      });
      if (msg.senderId !== user.id) {
        playNotifSound();
        markRead.mutate();
      }
    };

    const onTyping = (data: { userId: string }) => {
      if (data.userId === user.id) return;
      setIsTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => setIsTyping(false), 2500);
    };
    const onStopTyping = (data: { userId: string }) => {
      if (data.userId !== user.id) setIsTyping(false);
    };
    const onMessagesRead = (data: { userId: string }) => {
      if (data.userId !== user.id) {
        setMessages(prev => prev.map(m =>
          m.senderId === user.id ? { ...m, status: 'read' as const, isRead: true } : m
        ));
      }
    };
    const onMessageDeleted = (data: { messageId: string }) => {
      setMessages(prev => prev.map(m =>
        m.id === data.messageId ? { ...m, isDeleted: true, content: '' } : m
      ));
    };
    const onMessageReaction = (data: { messageId: string; emoji: string; action: string; userId: string; username: string }) => {
      setMessages(prev => prev.map(m => {
        if (m.id !== data.messageId) return m;
        const reactions = [...(m.reactions || [])];
        if (data.action === 'added') {
          reactions.push({ id: `r-${Date.now()}`, emoji: data.emoji, userId: data.userId, user: { id: data.userId, username: data.username, displayName: null } });
        } else {
          const idx = reactions.findIndex(r => r.emoji === data.emoji && r.userId === data.userId);
          if (idx !== -1) reactions.splice(idx, 1);
        }
        return { ...m, reactions };
      }));
    };
    const onOnlineStatus = (data: { userId: string; online: boolean }) => setOtherOnline(data.online);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);
    socket.on('user-typing', onTyping);
    socket.on('user-stop-typing', onStopTyping);
    socket.on('messages-read', onMessagesRead);
    socket.on('message-deleted', onMessageDeleted);
    socket.on('message-reaction', onMessageReaction);
    socket.on('online-status', onOnlineStatus);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      socket.off('user-typing', onTyping);
      socket.off('user-stop-typing', onStopTyping);
      socket.off('messages-read', onMessagesRead);
      socket.off('message-deleted', onMessageDeleted);
      socket.off('message-reaction', onMessageReaction);
      socket.off('online-status', onOnlineStatus);
      socket.emit('leave-conversation', { conversationId });
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, [conversationId, user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Check other participant's online status
  useEffect(() => {
    if (!convInfo || !user) return;
    const other = convInfo.participants?.find(p => p.id !== user.id);
    if (other) connectSocket().emit('check-online', { userId: other.id });
  }, [convInfo, user]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Handlers ──

  const handleSend = useCallback((text: string) => {
    if (!user) return;
    const optimistic: Message = {
      id: `temp-${Date.now()}`, content: text, type: 'TEXT', senderId: user.id,
      sender: { id: user.id, username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl },
      isRead: false, isDeleted: false, reactions: [], createdAt: new Date().toISOString(), status: 'sending',
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      connectSocket().emit('send-message', { conversationId, content: text });
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, status: 'sent' } : m));
      }, 300);
    } catch { setMessages(prev => prev.filter(m => m.id !== optimistic.id)); }
  }, [conversationId, user]);

  async function handleImageUpload(file: File) {
    if (!user) return;
    try {
      const result = await uploadImage.mutateAsync(file);
      connectSocket().emit('send-message', { conversationId, content: '', type: 'IMAGE', mediaUrl: result.url });
    } catch { /* toast */ }
  }

  async function handleVoiceSend(blob: Blob, _duration: number) {
    if (!user) return;
    try {
      const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
      const result = await uploadImage.mutateAsync(file);
      connectSocket().emit('send-message', { conversationId, content: '', type: 'AUDIO', mediaUrl: result.url });
    } catch { /* toast */ }
  }

  function handleTypingEmit() {
    const now = Date.now();
    if (now - lastTypingRef.current < 2000) return;
    lastTypingRef.current = now;
    connectSocket().emit('typing', { conversationId });
  }

  function handleDelete(messageId: string) {
    connectSocket().emit('delete-message', { messageId });
  }

  function handleReact(messageId: string, emoji: string) {
    connectSocket().emit('react-to-message', { messageId, emoji });
  }

  function toggleSearch() {
    setSearchMode(prev => !prev);
    setSearchQuery('');
  }

  // Filter messages by search
  const displayMessages = searchMode && searchQuery
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return {
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
  };
}
