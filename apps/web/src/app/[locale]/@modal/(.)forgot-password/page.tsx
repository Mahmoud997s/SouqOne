import { Suspense } from 'react';
import AuthModal from '@/components/auth/auth-modal';
import ForgotForm from '../../forgot-password/forgot-form';

export default function ForgotPasswordModal() {
  return (
    <AuthModal
      title="نسيت كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز الاستعادة"
    >
      <Suspense>
        <ForgotForm />
      </Suspense>
    </AuthModal>
  );
}
