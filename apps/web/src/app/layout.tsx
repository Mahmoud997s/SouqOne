import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/components/toast';
import { AuthModalProvider } from '@/providers/auth-modal-provider';
import { LoginModal } from '@/components/auth/login-modal';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SearchProvider } from '@/providers/search-provider';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'سوق وان | سوق السيارات في سلطنة عمان',
    template: '%s | سوق وان',
  },
  description:
    'سوق وان — المعرض الرقمي الأول لبيع وشراء السيارات في سلطنة عمان. اكتشف سيارات فاخرة ومستعملة بأفضل الأسعار.',
  keywords: ['سيارات', 'عمان', 'بيع', 'شراء', 'مستعملة', 'سوق وان', 'SouqOne', 'car marketplace oman'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'ar_OM',
    siteName: 'سوق وان',
    title: 'سوق وان | سوق السيارات في سلطنة عمان',
    description: 'المعرض الرقمي الأول لبيع وشراء السيارات في سلطنة عمان',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'سوق وان | سوق السيارات في سلطنة عمان',
    description: 'المعرض الرقمي الأول لبيع وشراء السيارات في سلطنة عمان',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <head>
        {/* Non-render-blocking Material Symbols loading */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          as="style"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var l = document.createElement('link');
              l.rel = 'stylesheet';
              l.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap';
              document.head.appendChild(l);
            `,
          }}
        />
      </head>
      <body className="bg-surface text-on-surface antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AuthModalProvider>
                <ToastProvider>
                  <SearchProvider>
                    {children}
                    <BottomNav />
                  </SearchProvider>
                </ToastProvider>
                <LoginModal />
              </AuthModalProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
