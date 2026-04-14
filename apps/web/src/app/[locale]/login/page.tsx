'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import AuthPage from '@/components/auth/auth-page';
import LoginForm from './login-form';

export default function LoginPage() {
  const t = useTranslations('auth');
  return (
    <AuthPage
      title={t('loginTitle')}
      subtitle={t('loginSubtitle')}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthPage>
  );
}
