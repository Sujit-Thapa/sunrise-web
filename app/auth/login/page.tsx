import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import { LoginForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = { title: 'Sign In' };

export default function LoginPage() {
  return <AuthShell><LoginForm variant="page" /></AuthShell>;
}
