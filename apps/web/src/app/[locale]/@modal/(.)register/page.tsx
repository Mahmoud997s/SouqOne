'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import AuthModal from '@/components/auth/auth-modal';
import RegisterForm from '../../register/register-form';

export default function RegisterModal() {
  const t = useTranslations('auth');
  return (
    <AuthModal
      title={t('registerTitle')}
      subtitle={t('registerSubtitle')}
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthModal>
  );
}
