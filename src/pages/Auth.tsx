
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthFlowRenderer from "@/components/auth/AuthFlowRenderer";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { useAlertSystem } from "@/hooks/useAlertSystem";
import { useTimedPrompt } from "@/hooks/useTimedPrompt";
import TimedPrompt from "@/components/auth/TimedPrompt";

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
  
  const {
    alertLevel,
    isAlertActive,
    cycleAlert,
  } = useAlertSystem();

  const {
    isPromptVisible,
    promptMessage,
    dismissPrompt
  } = useTimedPrompt(alertLevel);

  // Update battle mode based on alert level
  useEffect(() => {
    setBattleMode(alertLevel !== 'normal');
  }, [alertLevel]);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <AuthLayout 
        battleMode={battleMode} 
        onBattleModeToggle={setBattleMode}
        alertLevel={alertLevel}
        onAlertCycle={cycleAlert}
      >
        <AuthFlowRenderer
          authFlow={authFlow}
          recoveryEmail={recoveryEmail}
          ssoProvider={ssoProvider}
          alertLevel={alertLevel}
          isAlertActive={isAlertActive}
          onStartAccountLookup={handleStartAccountLookup}
          onPasswordReset={handlePasswordReset}
          onSSOLink={handleSSOLink}
          onProceedToSignup={handleProceedToSignup}
          onBackToMain={handleBackToMain}
          onAuthSuccess={handleAuthSuccess}
        />
      </AuthLayout>
      
      <TimedPrompt 
        isVisible={isPromptVisible}
        message={promptMessage}
        onDismiss={dismissPrompt}
      />
    </>
  );
};

export default Auth;
