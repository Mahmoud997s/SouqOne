'use client';

import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import AuthModal from '@/components/auth/auth-modal';
import LoginForm from '../../login/login-form';

export default function LoginModal() {
  const t = useTranslations('auth');
  return (
    <AuthModal
      title={t('loginTitle')}
      subtitle={t('loginSubtitle')}
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthModal>
  );
}
