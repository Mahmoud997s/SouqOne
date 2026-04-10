'use client';

import { useRef, useState } from 'react';
import { Send, Smile, Paperclip, Mic, X } from 'lucide-react';
import EmojiPicker from './emoji-picker';
import VoiceRecorder from './voice-recorder';

interface ChatInputProps {
  onSend: (text: string) => void;
  onImageUpload: (file: File) => void;
  onVoiceSend: (blob: Blob, duration: number) => void;
  onTyping: () => void;
}

export function ChatInput({ onSend, onImageUpload, onVoiceSend, onTyping }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput('');
    setShowEmoji(false);
    inputRef.current?.focus();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    pendingFileRef.current = file;
    setImagePreview(URL.createObjectURL(file));
    e.target.value = '';
  }

  function confirmImage() {
    if (pendingFileRef.current) {
      onImageUpload(pendingFileRef.current);
      pendingFileRef.current = null;
      setImagePreview(null);
    }
  }

  function cancelImage() {
    pendingFileRef.current = null;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (showVoice) {
    return (
      <div className="px-3 py-2.5 bg-surface-container-lowest border-t border-outline-variant/10 shrink-0">
        <VoiceRecorder
          onSend={(blob, dur) => { onVoiceSend(blob, dur); setShowVoice(false); }}
          onCancel={() => setShowVoice(false)}
        />
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/8 shrink-0">
      {/* Image preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-3 bg-surface-container rounded-2xl p-3">
          <img src={imagePreview} alt="preview" className="w-16 h-16 rounded-xl object-cover ring-1 ring-outline-variant/10" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-on-surface mb-0.5">صورة جاهزة للإرسال</p>
            <p className="text-[10px] text-on-surface-variant/40">اضغط إرسال للمتابعة</p>
          </div>
          <button onClick={cancelImage} className="w-8 h-8 rounded-xl hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <X size={16} className="text-on-surface-variant/50" />
          </button>
          <button onClick={confirmImage} className="bg-primary text-on-primary px-4 py-2 rounded-xl text-[11px] font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm">
            إرسال
          </button>
        </div>
      )}

      <div className="flex items-end gap-2.5">
        {/* Attachment & emoji buttons */}
        <div className="flex items-center gap-0.5 shrink-0 pb-[5px]">
          <div className="relative">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${showEmoji ? 'bg-primary/10 text-primary' : 'text-on-surface-variant/35 hover:text-on-surface-variant/60 hover:bg-surface-container-high'}`}
            >
              <Smile size={21} />
            </button>
            {showEmoji && (
              <EmojiPicker
                onSelect={(emoji) => setInput(prev => prev + emoji)}
                onClose={() => setShowEmoji(false)}
              />
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant/35 hover:text-on-surface-variant/60 hover:bg-surface-container-high transition-all duration-200"
          >
            <Paperclip size={20} className="rotate-45" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Text input */}
        <div className="flex-1 bg-surface-container rounded-2xl px-4 py-2 min-h-[44px] flex items-center ring-1 ring-outline-variant/[0.04] focus-within:ring-primary/20 transition-shadow">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); onTyping(); }}
            onKeyDown={handleKeyDown}
            placeholder="اكتب رسالة..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-[13.5px] resize-none max-h-28 py-1 focus:outline-none placeholder:text-on-surface-variant/30 leading-relaxed"
          />
        </div>

        {/* Send / Mic button */}
        <div className="shrink-0 pb-[3px]">
          {input.trim() ? (
            <button
              onClick={handleSend}
              className="bg-primary text-on-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-sm hover:shadow-md active:scale-[0.92] transition-all duration-200"
            >
              <Send size={17} />
            </button>
          ) : (
            <button
              onClick={() => setShowVoice(true)}
              className="bg-surface-container-high text-on-surface-variant/60 hover:bg-primary hover:text-on-primary w-10 h-10 rounded-xl flex items-center justify-center active:scale-[0.92] transition-all duration-200"
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
