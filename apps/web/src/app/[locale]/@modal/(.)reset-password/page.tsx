import { Suspense } from 'react';
import AuthModal from '@/components/auth/auth-modal';
import ResetForm from '../../reset-password/reset-form';

export default function ResetPasswordModal() {
  return (
    <AuthModal
      title="إعادة تعيين كلمة المرور"
      subtitle="أدخل الرمز وكلمة المرور الجديدة"
    >
      <Suspense>
        <ResetForm />
      </Suspense>
    </AuthModal>
  );
}
