import { ReactNode, useEffect, useState } from "react";
import { DescrambleState } from "@/hooks/useDescrambleEffect";

interface ViewscreenDescramblerProps {
  children: ReactNode;
  descramblerState: DescrambleState;
  isVisible: boolean;
}

const ViewscreenDescrambler = ({ children, descramblerState, isVisible }: ViewscreenDescramblerProps) => {
  const [scanlinePosition, setScanlinePosition] = useState(0);
  const [redAlert, setRedAlert] = useState(false);
  const [klingonGlitch, setKlingonGlitch] = useState(false);

  useEffect(() => {
    if (!descramblerState.isActive) return;

    const interval = setInterval(() => {
      setScanlinePosition(prev => (prev + 2) % 100);
    }, 50);

    return () => clearInterval(interval);
  }, [descramblerState.isActive]);

  // Random Klingon intrusion effects
  useEffect(() => {
    if (!isVisible) return;

    const triggerKlingonGlitch = () => {
      if (Math.random() < 0.3) { // 30% chance
        setRedAlert(true);
        setKlingonGlitch(true);
        
        setTimeout(() => {
          setRedAlert(false);
          setKlingonGlitch(false);
        }, 150 + Math.random() * 200); // 150-350ms duration
      }
      
      // Schedule next potential glitch
      setTimeout(triggerKlingonGlitch, 800 + Math.random() * 2200); // 0.8-3s interval
    };

    const timeout = setTimeout(triggerKlingonGlitch, 500 + Math.random() * 1000);
    return () => clearTimeout(timeout);
  }, [isVisible]);

  if (!isVisible) return <>{children}</>;

  const getPhaseStyles = () => {
    const { phase, staticIntensity } = descramblerState;
    
    switch (phase) {
      case 'scrambling':
        return {
          filter: `contrast(${1 + staticIntensity * 0.5}) brightness(${0.8 + staticIntensity * 0.3}) hue-rotate(${staticIntensity * 20}deg)`,
          opacity: 0.7 + staticIntensity * 0.3,
        };
      case 'tuningIn':
        return {
          filter: `contrast(${1 + staticIntensity * 0.3}) brightness(${0.9 + staticIntensity * 0.2}) hue-rotate(${staticIntensity * 10}deg)`,
          opacity: 0.8 + staticIntensity * 0.2,
        };
      case 'signalLock':
        return {
          filter: `contrast(${1 + staticIntensity * 0.1}) brightness(${0.95 + staticIntensity * 0.1})`,
          opacity: 0.9 + staticIntensity * 0.1,
        };
      default:
        return {
          filter: 'none',
          opacity: 1,
        };
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Klingon Red Alert Overlay */}
      {redAlert && (
        <div 
          className="absolute inset-0 z-50 pointer-events-none animate-pulse"
          style={{
            background: `
              radial-gradient(circle at center, rgba(220, 38, 38, ${klingonGlitch ? 0.4 : 0.2}) 0%, transparent 70%),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 1px,
                rgba(220, 38, 38, 0.1) 1px,
                rgba(220, 38, 38, 0.1) 2px
              )
            `,
            animation: klingonGlitch ? 'none' : 'pulse 0.1s infinite',
            filter: klingonGlitch ? 'contrast(2) brightness(1.5) hue-rotate(10deg)' : 'none',
          }}
        />
      )}

      {/* Klingon Intrusion Warning */}
      {redAlert && (
        <div className="absolute top-4 left-4 z-50 text-red-400 text-xs font-mono opacity-90 animate-pulse">
          ⚠ UNAUTHORIZED ACCESS DETECTED
        </div>
      )}

      {/* Static Noise Overlay */}
      {descramblerState.staticIntensity > 0 && (
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(59, 130, 246, ${descramblerState.staticIntensity * 0.1}) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(239, 68, 68, ${descramblerState.staticIntensity * 0.1}) 0%, transparent 50%),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, ${descramblerState.staticIntensity * 0.03}) 2px,
                rgba(255, 255, 255, ${descramblerState.staticIntensity * 0.03}) 4px
              )
            `,
            opacity: descramblerState.staticIntensity,
          }}
        />
      )}

      {/* Scanning Line */}
      {descramblerState.isActive && (
        <div 
          className="absolute inset-0 z-30 pointer-events-none"
          style={{
            background: `linear-gradient(
              to bottom,
              transparent ${scanlinePosition}%,
              rgba(0, 255, 255, 0.3) ${scanlinePosition + 1}%,
              rgba(0, 255, 255, 0.1) ${scanlinePosition + 2}%,
              transparent ${scanlinePosition + 3}%
            )`,
          }}
        />
      )}

      {/* Frequency Tuning Bars */}
      {descramblerState.phase === 'tuningIn' && (
        <div className="absolute top-2 left-2 z-40 flex space-x-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-green-400 opacity-60"
              style={{
                height: `${Math.random() * 20 + 5}px`,
                animation: `pulse ${0.5 + Math.random() * 0.5}s infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Signal Strength Indicator */}
      {descramblerState.phase === 'signalLock' && (
        <div className="absolute top-2 right-2 z-40 text-green-400 text-xs font-mono opacity-80">
          SIGNAL LOCK: {Math.round(descramblerState.progress * 100)}%
        </div>
      )}

      {/* Content with Phase Effects */}
      <div 
        className="relative z-10 w-full h-full transition-all duration-100"
        style={getPhaseStyles()}
      >
        {children}
      </div>

      {/* RGB Separation Effect */}
      {descramblerState.staticIntensity > 0.5 && (
        <div 
          className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
          style={{
            background: `
              radial-gradient(circle at 30% 40%, rgba(255, 0, 0, ${descramblerState.staticIntensity * 0.1}) 0%, transparent 50%),
              radial-gradient(circle at 70% 60%, rgba(0, 255, 0, ${descramblerState.staticIntensity * 0.1}) 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, rgba(0, 0, 255, ${descramblerState.staticIntensity * 0.1}) 0%, transparent 50%)
            `,
          }}
        />
      )}
    </div>
  );
};

export default ViewscreenDescrambler;