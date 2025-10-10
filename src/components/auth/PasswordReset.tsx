
import PasswordResetRequest from './PasswordResetRequest';
import PasswordResetConfirmation from './PasswordResetConfirmation';
import { usePasswordReset } from '@/hooks/usePasswordReset';

interface PasswordResetProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
  emailAlreadySent?: boolean;
}

const PasswordReset = ({ email, onBack, onSuccess, emailAlreadySent = false }: PasswordResetProps) => {
  const {
    isLoading,
    isEmailSent,
    handleResetRequest,
  } = usePasswordReset(email, onSuccess);

  if (!isEmailSent && !emailAlreadySent) {
    return (
      <PasswordResetRequest
        email={email}
        isLoading={isLoading}
        onResetRequest={handleResetRequest}
        onBack={onBack}
      />
    );
  }

  return (
    <PasswordResetConfirmation
      email={email}
      onBack={onBack}
    />
  );
};

export default PasswordReset;
