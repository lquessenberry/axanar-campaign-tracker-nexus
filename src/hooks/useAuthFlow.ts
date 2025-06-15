
import { useState } from 'react';

export type AuthFlow = 'main' | 'lookup' | 'password-reset' | 'sso-linking' | 'signup-confirmed';

export const useAuthFlow = () => {
  const [authFlow, setAuthFlow] = useState<AuthFlow>('main');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [ssoProvider, setSsoProvider] = useState('');

  const handleStartAccountLookup = () => {
    setAuthFlow('lookup');
  };

  const handlePasswordReset = (email: string) => {
    setRecoveryEmail(email);
    setAuthFlow('password-reset');
  };

  const handleSSOLink = (email: string, provider: string) => {
    setRecoveryEmail(email);
    setSsoProvider(provider);
    setAuthFlow('sso-linking');
  };

  const handleProceedToSignup = (email: string) => {
    setRecoveryEmail(email);
    setAuthFlow('signup-confirmed');
  };

  const handleBackToMain = () => {
    setAuthFlow('main');
    setRecoveryEmail('');
    setSsoProvider('');
  };

  const handleAuthSuccess = () => {
    // User should be redirected automatically by the auth context
    setAuthFlow('main');
  };

  return {
    authFlow,
    recoveryEmail,
    ssoProvider,
    handleStartAccountLookup,
    handlePasswordReset,
    handleSSOLink,
    handleProceedToSignup,
    handleBackToMain,
    handleAuthSuccess,
  };
};
