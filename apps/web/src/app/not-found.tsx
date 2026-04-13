import Link from 'next/link';

export default function RootNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem' }}>404</h1>
          <p style={{ fontSize: '1.25rem', marginBottom: '2rem', color: '#666' }}>Page not found</p>
          <Link href="/" style={{ padding: '0.75rem 2rem', background: '#004ac6', color: '#fff', borderRadius: '0.75rem', fontWeight: 700, textDecoration: 'none' }}>
            Home
          </Link>
        </div>
      </body>
    </html>
  );
}
