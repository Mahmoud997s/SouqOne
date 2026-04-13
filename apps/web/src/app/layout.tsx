import './globals.css';

// Minimal outer shell — locale-specific layout lives in [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
