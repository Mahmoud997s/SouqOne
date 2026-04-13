import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/components/toast';
import { AuthModalProvider } from '@/providers/auth-modal-provider';
import { LoginModal } from '@/components/auth/login-modal';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SearchProvider } from '@/providers/search-provider';
import { PageTransition } from '@/components/page-transition';

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Validate locale
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages for the current locale
  const messages = await getMessages();

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={tajawal.variable} suppressHydrationWarning>
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
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <QueryProvider>
              <AuthProvider>
                <AuthModalProvider>
                  <ToastProvider>
                    <SearchProvider>
                      <PageTransition>
                        {children}
                      </PageTransition>
                      <BottomNav />
                    </SearchProvider>
                  </ToastProvider>
                  <LoginModal />
                  {modal}
                </AuthModalProvider>
              </AuthProvider>
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
