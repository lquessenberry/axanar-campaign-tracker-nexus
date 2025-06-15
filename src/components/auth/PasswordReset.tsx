
import PasswordResetRequest from './PasswordResetRequest';
import PasswordResetConfirmation from './PasswordResetConfirmation';
import { usePasswordReset } from '@/hooks/usePasswordReset';

interface PasswordResetProps {
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}

const PasswordReset = ({ email, onBack, onSuccess }: PasswordResetProps) => {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    isEmailSent,
    handleResetRequest,
    handlePasswordUpdate,
  } = usePasswordReset(email, onSuccess);

  if (!isEmailSent) {
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
      password={password}
      confirmPassword={confirmPassword}
      isLoading={isLoading}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onPasswordUpdate={handlePasswordUpdate}
      onBack={onBack}
    />
  );
};

export default PasswordReset;
