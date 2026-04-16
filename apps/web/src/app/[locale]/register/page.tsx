'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useAuthModal } from '@/providers/auth-modal-provider';

export default function RegisterPage() {
  const router = useRouter();
  const { openAuth } = useAuthModal();

  useEffect(() => {
    router.replace('/');
    openAuth('register');
  }, [router, openAuth]);

  return null;
}
