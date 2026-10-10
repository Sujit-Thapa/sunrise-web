import AuthShell from '@/components/auth/AuthShell';
import { ForgotPasswordForm } from '@/components/auth/AuthForms';

export default function ForgotPasswordPage() {
  return <AuthShell><ForgotPasswordForm variant="page" /></AuthShell>;
}
