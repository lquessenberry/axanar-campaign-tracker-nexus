
import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthFlowRenderer from "@/components/auth/AuthFlowRenderer";
import { useAuthFlow } from "@/hooks/useAuthFlow";

const Auth = () => {
  const [battleMode, setBattleMode] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
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

  // Redirect if already authenticated, honoring return path
  if (user) {
    const from = (location.state as any)?.from || "/";
    return <Navigate to={from} replace />;
  }

  return (
    <AuthLayout 
      battleMode={battleMode} 
      onBattleModeToggle={setBattleMode}
      alertLevel="normal"
      onAlertCycle={() => {}}
    >
      <AuthFlowRenderer
        authFlow={authFlow}
        recoveryEmail={recoveryEmail}
        ssoProvider={ssoProvider}
        alertLevel="normal"
        isAlertActive={false}
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
