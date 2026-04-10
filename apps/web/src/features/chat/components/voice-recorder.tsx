'use client';

import { useState, useRef, useEffect } from 'react';
import { Square, Send, X } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopTimer();
      if (mediaRef.current && mediaRef.current.state === 'recording') {
        mediaRef.current.stop();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
        stopTimer();
      };

      recorder.start();
      setIsRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      onCancel();
    }
  }

  function stopRecording() {
    if (mediaRef.current && mediaRef.current.state === 'recording') {
      mediaRef.current.stop();
      setIsRecording(false);
    }
  }

  function handleSend() {
    if (audioBlob) {
      onSend(audioBlob, duration);
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex items-center gap-3 bg-red-50/80 rounded-2xl px-4 py-3 flex-1 ring-1 ring-red-200/30">
      {/* Cancel */}
      <button onClick={onCancel} className="w-8 h-8 rounded-xl hover:bg-red-100 flex items-center justify-center transition-colors">
        <X size={17} className="text-red-500" />
      </button>

      {/* Recording indicator */}
      <div className="flex items-center gap-2.5 flex-1">
        {isRecording && (
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
        )}
        <span className="text-sm font-bold text-red-600 tabular-nums">
          {formatTime(duration)}
        </span>
        {isRecording && (
          <div className="flex-1 flex items-center gap-[2px]">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="w-[3px] bg-red-400/50 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 18 + 4}px`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stop / Send */}
      {isRecording ? (
        <button
          onClick={stopRecording}
          className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center text-white hover:bg-red-600 active:scale-[0.92] transition-all shadow-sm"
        >
          <Square size={14} />
        </button>
      ) : audioBlob ? (
        <button
          onClick={handleSend}
          className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:brightness-110 active:scale-[0.92] transition-all shadow-sm"
        >
          <Send size={15} />
        </button>
      ) : null}
    </div>
  );
}

// Audio player for voice messages in chat
export function AudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  function formatTime(s: number) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="flex items-center gap-2.5 min-w-[190px]">
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a) setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button onClick={toggle} className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 transition-colors">
        <span className="material-symbols-outlined text-base">
          {playing ? 'pause' : 'play_arrow'}
        </span>
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <div className="h-[3px] bg-white/15 rounded-full overflow-hidden">
          <div className="h-full bg-current rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] opacity-60 tabular-nums">{formatTime((progress / 100) * duration)}</span>
      </div>
    </div>
  );
}
