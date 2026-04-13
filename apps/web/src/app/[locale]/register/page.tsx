import AuthPage from '@/components/auth/auth-page';
import RegisterForm from './register-form';

export default function RegisterPage() {
  return (
    <AuthPage
      title="إنشاء حساب"
      subtitle="أنشئ حسابك وابدأ تصفح المعرض"
    >
      <RegisterForm />
    </AuthPage>
  );
}
