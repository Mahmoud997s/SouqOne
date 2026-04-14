'use client';

import { useRouter } from '@/i18n/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

interface AuthModalProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthModal({ children, title, subtitle }: AuthModalProps) {
  const router = useRouter();
  const hasPrevRef = useRef(false);
  const [fromApp, setFromApp] = useState(false);

  useEffect(() => {
    const prev = window.history.length > 1;
    hasPrevRef.current = prev;
    setFromApp(prev);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleClose = useCallback(() => {
    if (hasPrevRef.current) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  return (
    <div
     
      className="auth-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: fromApp
          ? 'rgba(10, 20, 60, 0.45)'
          : 'rgba(10, 20, 60, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'background 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '100%' }}
      >
        {/* Logo + Name — above the card */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 14 }}>
          <img src="/logo.png" alt="SouqOne" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
          <img src="/name.png" alt="SouqOne" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Card */}
        <div className="auth-sheet">
          {/* Drag handle — mobile only */}
          <div className="auth-drag-handle" />

          {/* Title */}
          <div style={{ padding: '10px 0 8px', textAlign: 'center', borderBottom: '0.5px solid #f0f0f0' }}>
            <h2 className="text-on-surface" style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>
              {title}
            </h2>
            <p className="text-on-surface-variant" style={{ fontSize: 11, margin: 0 }}>
              {subtitle}
            </p>
          </div>

          {/* Body */}
          <div style={{ paddingTop: 10 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
