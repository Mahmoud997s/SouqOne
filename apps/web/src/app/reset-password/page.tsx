import AuthPage from '@/components/auth/auth-page';
import ResetForm from './reset-form';

export default function ResetPasswordPage() {
  return (
    <AuthPage
      title="إعادة تعيين كلمة المرور"
      subtitle="أدخل الرمز وكلمة المرور الجديدة"
    >
      <ResetForm />
    </AuthPage>
  );
}
