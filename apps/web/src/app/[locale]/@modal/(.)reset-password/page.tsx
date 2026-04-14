'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import AuthModal from '@/components/auth/auth-modal';
import ResetForm from '../../reset-password/reset-form';

export default function ResetPasswordModal() {
  const t = useTranslations('auth');
  return (
    <AuthModal
      title={t('resetPasswordTitle')}
      subtitle={t('resetPasswordSubtitle')}
    >
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthModal>
  );
}
