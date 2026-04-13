import { Suspense } from 'react';
import AuthPage from '@/components/auth/auth-page';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <AuthPage
      title="تسجيل الدخول"
      subtitle="أهلاً بك، سجّل دخولك للمتابعة"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthPage>
  );
}
