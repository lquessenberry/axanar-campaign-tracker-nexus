
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthFlowRenderer from "@/components/auth/AuthFlowRenderer";
import { useAuthFlow } from "@/hooks/useAuthFlow";

const Auth = () => {
  const [battleMode, setBattleMode] = useState(true);
  const { user } = useAuth();
  const {
    authFlow,
    recoveryEmail,
    ssoProvider,
    handleStartAccountLookup,
    handlePasswordReset,
    handleSSOLink,
    handleProceedToSignup,
    handleBackToMain,
    handleAuthSuccess,
  } = useAuthFlow();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <AuthLayout battleMode={battleMode} onBattleModeToggle={setBattleMode}>
      <AuthFlowRenderer
        authFlow={authFlow}
        recoveryEmail={recoveryEmail}
        ssoProvider={ssoProvider}
        onStartAccountLookup={handleStartAccountLookup}
        onPasswordReset={handlePasswordReset}
        onSSOLink={handleSSOLink}
        onProceedToSignup={handleProceedToSignup}
        onBackToMain={handleBackToMain}
        onAuthSuccess={handleAuthSuccess}
      />
    </AuthLayout>
  );
};

export default Auth;
