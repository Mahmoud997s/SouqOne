import { Suspense } from 'react';
import AuthModal from '@/components/auth/auth-modal';
import RegisterForm from '../../register/register-form';

export default function RegisterModal() {
  return (
    <AuthModal
      title="إنشاء حساب"
      subtitle="أنشئ حسابك وابدأ تصفح المعرض"
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthModal>
  );
}
