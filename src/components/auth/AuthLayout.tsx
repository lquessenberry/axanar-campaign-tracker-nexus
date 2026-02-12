import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import StarField from "@/components/StarField";
import MorseCodeBanner from "@/components/auth/MorseCodeBanner";
import MouseTracker from "@/components/auth/MouseTracker";
import RadarBlips from "@/components/auth/RadarBlips";
import { useIsMobile } from "@/hooks/useMobile";
import { ReactNode } from "react";

import { AlertLevel } from "@/hooks/useAlertSystem";

interface AuthLayoutProps {
  children: ReactNode;
  battleMode: boolean;
  onBattleModeToggle: (value: boolean) => void;
  alertLevel?: AlertLevel;
  onAlertCycle?: () => void;
}

const AuthLayout = ({
  children,
  battleMode,
  onBattleModeToggle,
  alertLevel = "normal",
  onAlertCycle,
}: AuthLayoutProps) => {
  const isMobile = useIsMobile();

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

        {/* Morse Code Banner */}
        {battleMode && <MorseCodeBanner />}

        {/* Mobile navigation - compact and edge-to-edge */}
        <div className="relative z-50 flex-shrink-0">
          <Navigation
            battleMode={battleMode}
            onBattleModeToggle={onBattleModeToggle}
            alertLevel={alertLevel}
            onAlertCycle={onAlertCycle}
          />
        </div>

        {/* Mobile main content - absolutely no padding or margins */}
        <main className="flex-grow flex flex-col justify-center relative z-40 min-h-0">
          {/* Auth form container - completely edge-to-edge, no padding */}
          <div
            data-card
            className="relative z-50 w-full h-full flex flex-col justify-center"
          >
            {children}
          </div>
        </main>

        {/* Mobile footer - compact and edge-to-edge */}
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

      {/* Morse Code Banner */}
      {battleMode && <MorseCodeBanner />}

      {/* Navigation - top level */}
      <div className="relative z-50">
        <Navigation
          battleMode={battleMode}
          onBattleModeToggle={onBattleModeToggle}
          alertLevel={alertLevel}
          onAlertCycle={onAlertCycle}
        />
      </div>

      {/* Main content - top level */}
      <main className="flex-grow flex items-center justify-center px-4 py-16 relative z-40">
        <div data-card className="relative z-50">
          {children}
        </div>
      </main>

      {/* Footer - top level */}
      <div className="relative z-50">
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;
