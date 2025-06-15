
import { AuthFlow } from '@/hooks/useAuthFlow';
import MainAuthForm from '@/components/auth/MainAuthForm';
import AccountLookup from '@/components/auth/AccountLookup';
import PasswordReset from '@/components/auth/PasswordReset';
import SSOLinking from '@/components/auth/SSOLinking';
import SignupForm from '@/components/auth/SignupForm';

interface AuthFlowRendererProps {
  authFlow: AuthFlow;
  recoveryEmail: string;
  ssoProvider: string;
  onStartAccountLookup: () => void;
  onPasswordReset: (email: string) => void;
  onSSOLink: (email: string, provider: string) => void;
  onProceedToSignup: (email: string) => void;
  onBackToMain: () => void;
  onAuthSuccess: () => void;
}

const AuthFlowRenderer = ({
  authFlow,
  recoveryEmail,
  ssoProvider,
  onStartAccountLookup,
  onPasswordReset,
  onSSOLink,
  onProceedToSignup,
  onBackToMain,
  onAuthSuccess,
}: AuthFlowRendererProps) => {
  switch (authFlow) {
    case 'main':
      return <MainAuthForm onStartAccountLookup={onStartAccountLookup} />;
    case 'lookup':
      return (
        <AccountLookup
          onPasswordReset={onPasswordReset}
          onSSOLink={onSSOLink}
          onProceedToSignup={onProceedToSignup}
          onCancel={onBackToMain}
        />
      );
    case 'password-reset':
      return (
        <PasswordReset
          email={recoveryEmail}
          onBack={onBackToMain}
          onSuccess={onAuthSuccess}
        />
      );
    case 'sso-linking':
      return (
        <SSOLinking
          email={recoveryEmail}
          provider={ssoProvider}
          onBack={onBackToMain}
          onSuccess={onAuthSuccess}
        />
      );
    case 'signup-confirmed':
      return <SignupForm recoveryEmail={recoveryEmail} onBack={onBackToMain} />;
    default:
      return <MainAuthForm onStartAccountLookup={onStartAccountLookup} />;
  }
};

export default AuthFlowRenderer;
