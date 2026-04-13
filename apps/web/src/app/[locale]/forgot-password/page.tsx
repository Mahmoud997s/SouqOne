import AuthPage from '@/components/auth/auth-page';
import ForgotForm from './forgot-form';

export default function ForgotPasswordPage() {
  return (
    <AuthPage
      title="نسيت كلمة المرور"
      subtitle="أدخل بريدك الإلكتروني وسنرسل لك رمز الاستعادة"
    >
      <ForgotForm />
    </AuthPage>
  );
}
