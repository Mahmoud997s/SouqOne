'use client';

import { useTranslations } from 'next-intl';
import AuthPage from '@/components/auth/auth-page';
import RegisterForm from './register-form';

export default function RegisterPage() {
  const t = useTranslations('auth');
  return (
    <AuthPage
      title={t('registerTitle')}
      subtitle={t('registerSubtitle')}
    >
      <RegisterForm />
    </AuthPage>
  );
}
