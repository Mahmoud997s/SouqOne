import { Suspense } from 'react';
import AuthModal from '@/components/auth/auth-modal';
import LoginForm from '../../login/login-form';

export default function LoginModal() {
  return (
    <AuthModal
      title="تسجيل الدخول"
      subtitle="أهلاً بك، سجّل دخولك للمتابعة"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthModal>
  );
}
