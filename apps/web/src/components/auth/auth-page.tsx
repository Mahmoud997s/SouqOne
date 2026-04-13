'use client';

interface AuthPageProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthPage({ children, title, subtitle }: AuthPageProps) {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(10, 20, 60, 0.85)',
        padding: '24px 0',
      }}
    >
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '100%' }}
      >
        {/* Logo + Name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 14 }}>
          <img src="/logo.png" alt="SouqOne" style={{ height: 52, width: 'auto', objectFit: 'contain' }} />
          <img src="/name.png" alt="سوق وان" style={{ height: 22, width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Card */}
        <div className="auth-sheet">
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
