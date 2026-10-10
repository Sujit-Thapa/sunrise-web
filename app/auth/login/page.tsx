import AuthShell from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/AuthForms';

export default function LoginPage() {
  return <AuthShell><LoginForm variant="page" /></AuthShell>;
}
