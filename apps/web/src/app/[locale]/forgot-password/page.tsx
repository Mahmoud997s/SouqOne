'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthModal } from '@/providers/auth-modal-provider';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    router.replace('/');
    openAuth('forgot');
  }, [router, openAuth]);

  return null;
}
