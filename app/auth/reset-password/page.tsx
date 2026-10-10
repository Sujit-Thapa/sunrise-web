'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthShell from '@/components/auth/AuthShell';
import { ResetPasswordForm } from '@/components/auth/AuthForms';

function ResetPassword() {
  return <ResetPasswordForm token={useSearchParams().get('token')} />;
}

export default function ResetPasswordPage() {
  return <AuthShell><Suspense><ResetPassword /></Suspense></AuthShell>;
}
