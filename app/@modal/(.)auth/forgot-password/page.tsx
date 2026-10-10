import AuthModal from '@/components/auth/AuthModal';
import { ForgotPasswordForm } from '@/components/auth/AuthForms';

export default function ForgotPasswordFormModal() {
  return <AuthModal><ForgotPasswordForm variant="modal" /></AuthModal>;
}
