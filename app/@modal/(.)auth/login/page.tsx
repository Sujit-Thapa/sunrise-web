import AuthModal from '@/components/auth/AuthModal';
import { LoginForm } from '@/components/auth/AuthForms';

export default function LoginFormModal() {
  return <AuthModal><LoginForm variant="modal" /></AuthModal>;
}
