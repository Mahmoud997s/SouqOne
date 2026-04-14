'use client';

import { useTranslations } from 'next-intl';
import AuthPage from '@/components/auth/auth-page';
import ForgotForm from './forgot-form';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  return (
    <AuthPage
      title={t('forgotPasswordTitle')}
      subtitle={t('forgotPasswordSubtitle')}
    >
      <ForgotForm />
    </AuthPage>
  );
}
