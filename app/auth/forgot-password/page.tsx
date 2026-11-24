import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import { ForgotPasswordForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = { title: 'Reset Password' };

export default function ForgotPasswordPage() {
  return <AuthShell><ForgotPasswordForm variant="page" /></AuthShell>;
}
