
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
import { useIsMobile } from "@/hooks/use-mobile";

type AuthFlow = 'main' | 'lookup' | 'password-reset' | 'sso-linking' | 'signup-confirmed';

const Auth = () => {
  const [authFlow, setAuthFlow] = useState<AuthFlow>('main');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [ssoProvider, setSsoProvider] = useState('');
  const [battleMode, setBattleMode] = useState(true);
  const { user } = useAuth();
  const isMobile = useIsMobile();

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

  // Mobile layout with Trek-inspired design - edge to edge
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-black relative overflow-hidden">
        {/* Star field backdrop */}
        <StarField />

        {/* Mobile Trek interface grid */}
        <div className="absolute inset-0 opacity-10 z-10">
          <div className="grid grid-cols-6 grid-rows-12 h-full w-full">
            {Array.from({ length: 72 }).map((_, i) => (
              <div key={i} className="border border-axanar-teal/10"></div>
            ))}
          </div>
        </div>

        {/* Battle effects layer - reduced for mobile */}
        {battleMode && (
          <div className="absolute inset-0 z-20 pointer-events-none opacity-40">
            <MouseTracker />
            <RadarBlips />
          </div>
        )}

        {/* Mobile navigation - compact */}
        <div className="relative z-50 flex-shrink-0">
          <Navigation 
            battleMode={battleMode} 
            onBattleModeToggle={setBattleMode} 
          />
        </div>
        
        {/* Mobile main content - NO padding, edge-to-edge */}
        <main className="flex-grow flex flex-col justify-center relative z-40 min-h-0">
          {/* Mobile Trek-style header - compact, no margin */}
          <div className="text-center mb-2 px-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/70 border border-axanar-teal/50 rounded backdrop-blur-sm">
              <div className="w-1.5 h-1.5 bg-axanar-teal rounded-full animate-pulse"></div>
              <span className="text-axanar-teal text-xs font-mono tracking-wider">STARFLEET COMMAND</span>
              <div className="w-1.5 h-1.5 bg-axanar-teal rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Auth form container - truly edge-to-edge */}
          <div data-card className="relative z-50 w-full px-2">
            {renderAuthFlow()}
          </div>

          {/* Mobile Trek-style status bar - compact, no margin */}
          <div className="mt-2 text-center px-2">
            <div className="inline-flex items-center gap-2 px-2 py-1 bg-black/50 border border-axanar-teal/30 rounded text-xs font-mono text-axanar-teal/80">
              <span className="text-xs">SYS: ONLINE</span>
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs">AUTH: READY</span>
            </div>
          </div>
        </main>
        
        {/* Mobile footer - compact */}
        <div className="relative z-50 flex-shrink-0">
          <Footer />
        </div>
      </div>
    );
  }

  // Desktop/Tablet layout - existing viewscreen design
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
