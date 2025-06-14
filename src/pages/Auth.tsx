
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import AccountLookup from "@/components/auth/AccountLookup";
import PasswordReset from "@/components/auth/PasswordReset";
import SSOLinking from "@/components/auth/SSOLinking";
import MouseTracker from "@/components/auth/MouseTracker";
import RadarBlips from "@/components/auth/RadarBlips";
import MainAuthForm from "@/components/auth/MainAuthForm";
import SignupForm from "@/components/auth/SignupForm";
import StarField from "@/components/StarField";

type AuthFlow = 'main' | 'lookup' | 'password-reset' | 'sso-linking' | 'signup-confirmed';

const Auth = () => {
  const [authFlow, setAuthFlow] = useState<AuthFlow>('main');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [ssoProvider, setSsoProvider] = useState('');
  const [battleMode, setBattleMode] = useState(true);
  const { user } = useAuth();

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

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

  const renderAuthFlow = () => {
    switch (authFlow) {
      case 'main':
        return <MainAuthForm onStartAccountLookup={handleStartAccountLookup} />;
      case 'lookup':
        return (
          <AccountLookup
            onPasswordReset={handlePasswordReset}
            onSSOLink={handleSSOLink}
            onProceedToSignup={handleProceedToSignup}
            onCancel={handleBackToMain}
          />
        );
      case 'password-reset':
        return (
          <PasswordReset
            email={recoveryEmail}
            onBack={handleBackToMain}
            onSuccess={handleAuthSuccess}
          />
        );
      case 'sso-linking':
        return (
          <SSOLinking
            email={recoveryEmail}
            provider={ssoProvider}
            onBack={handleBackToMain}
            onSuccess={handleAuthSuccess}
          />
        );
      case 'signup-confirmed':
        return <SignupForm recoveryEmail={recoveryEmail} onBack={handleBackToMain} />;
      default:
        return <MainAuthForm onStartAccountLookup={handleStartAccountLookup} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
      {/* Star field backdrop - lowest layer */}
      <StarField />

      {/* Background grid effect - above starfield */}
      <div className="absolute inset-0 opacity-3 z-10">
        <div className="grid grid-cols-20 grid-rows-12 h-full w-full">
          {Array.from({ length: 240 }).map((_, i) => (
            <div key={i} className="border border-axanar-teal/10"></div>
          ))}
        </div>
      </div>

      {/* Battle effects layer - background only */}
      {battleMode && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <MouseTracker />
          <RadarBlips />
        </div>
      )}

      {/* Navigation - top level */}
      <div className="relative z-50">
        <Navigation 
          battleMode={battleMode} 
          onBattleModeToggle={setBattleMode} 
        />
      </div>
      
      {/* Main content - top level */}
      <main className="flex-grow flex items-center justify-center px-4 py-16 relative z-40">
        <div data-card className="relative z-50">
          {renderAuthFlow()}
        </div>
      </main>
      
      {/* Footer - top level */}
      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
};

export default Auth;
