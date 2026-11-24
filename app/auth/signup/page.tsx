import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import { SignupForm } from '@/components/auth/AuthForms';

export const metadata: Metadata = { title: 'Create Account' };

export default function SignupPage() {
  return <AuthShell><SignupForm variant="page" /></AuthShell>;
}
