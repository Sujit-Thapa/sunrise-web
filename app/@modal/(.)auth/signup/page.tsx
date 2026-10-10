import AuthModal from '@/components/auth/AuthModal';
import { SignupForm } from '@/components/auth/AuthForms';

export default function SignupFormModal() {
  return <AuthModal><SignupForm variant="modal" /></AuthModal>;
}
