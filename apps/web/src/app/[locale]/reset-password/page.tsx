'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthModal } from '@/providers/auth-modal-provider';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    router.replace('/');
    openAuth('reset');
  }, [router, openAuth]);

  return null;
}
