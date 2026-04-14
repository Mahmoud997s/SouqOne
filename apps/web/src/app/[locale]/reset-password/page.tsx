'use client';

import { useTranslations } from 'next-intl';
import AuthPage from '@/components/auth/auth-page';
import ResetForm from './reset-form';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  return (
    <AuthPage
      title={t('resetPasswordTitle')}
      subtitle={t('resetPasswordSubtitle')}
    >
      <ResetForm />
    </AuthPage>
  );
}
