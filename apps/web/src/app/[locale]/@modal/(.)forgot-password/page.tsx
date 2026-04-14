'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import AuthModal from '@/components/auth/auth-modal';
import ForgotForm from '../../forgot-password/forgot-form';

export default function ForgotPasswordModal() {
  const t = useTranslations('auth');
  return (
    <AuthModal
      title={t('forgotPasswordTitle')}
      subtitle={t('forgotPasswordSubtitle')}
    >
      <Suspense>
        <ForgotForm />
      </Suspense>
    </AuthModal>
  );
}
