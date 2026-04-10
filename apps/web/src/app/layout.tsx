import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { QueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { ToastProvider } from '@/components/toast';
import { AuthModalProvider } from '@/providers/auth-modal-provider';
import { LoginModal } from '@/components/auth/login-modal';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ســــوق وان | سوق السيارات في سلطنة عمان',
  description:
    'ســــوق وان — المعرض الرقمي الأول لبيع وشراء السيارات في سلطنة عمان. اكتشف سيارات فاخرة ومستعملة بأفضل الأسعار.',
  keywords: ['سيارات', 'عمان', 'بيع', 'شراء', 'مستعملة', 'ســــوق وان', 'SouqOne'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          body { opacity: 0; }
          body.ready { opacity: 1; transition: opacity 0.1s ease; }
        `}} />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <script src="https://accounts.google.com/gsi/client" async defer />
        <script dangerouslySetInnerHTML={{ __html: `
          document.fonts.ready.then(function() { document.body.classList.add('ready'); });
          setTimeout(function() { document.body.classList.add('ready'); }, 2000);
        `}} />
      </head>
      <body className="bg-surface text-on-surface antialiased">
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <AuthModalProvider>
                <ToastProvider>{children}</ToastProvider>
                <LoginModal />
              </AuthModalProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
