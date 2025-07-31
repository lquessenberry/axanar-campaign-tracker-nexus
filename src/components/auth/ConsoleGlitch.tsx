import React from 'react';
import { AlertLevel } from '@/hooks/useAlertSystem';

interface ConsoleGlitchProps {
  alertLevel: AlertLevel;
  isActive: boolean;
  children: React.ReactNode;
}

const ConsoleGlitch = ({ alertLevel, isActive, children }: ConsoleGlitchProps) => {
  if (!isActive) {
    return <>{children}</>;
  }

  const getGlitchClasses = () => {
    switch (alertLevel) {
      case 'warning':
        return 'animate-pulse border-yellow-500/50 shadow-yellow-500/20';
      case 'red-alert':
        return 'animate-pulse border-red-500/70 shadow-red-500/40 shadow-2xl';
      default:
        return '';
    }
  };

  const getSparks = () => {
    if (alertLevel !== 'red-alert') return null;
    
    return (
      <>
        {/* Flying sparks */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `spark-fly-${i + 1} 0.8s ease-out infinite`,
            }}
          >
            <div className="w-1 h-1 bg-yellow-400 rounded-full shadow-yellow-400/60 shadow-md" />
          </div>
        ))}
      </>
    );
  };

  const getScreenFlicker = () => {
    if (alertLevel === 'red-alert') {
      return (
        <div 
          className="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse"
          style={{
            animation: 'screen-flicker 0.3s ease-in-out infinite alternate'
          }}
        />
      );
    }
    return null;
  };

  return (
    <div className={`relative ${getGlitchClasses()}`}>
      {/* Screen flicker overlay */}
      {getScreenFlicker()}
      
      {/* Sparks */}
      {getSparks()}
      
      {/* Console static lines */}
      {alertLevel === 'red-alert' && (
        <div className="absolute inset-0 pointer-events-none opacity-20">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-px bg-red-400"
              style={{
                top: `${20 + i * 30}%`,
                animation: `static-line ${0.5 + i * 0.2}s linear infinite`,
              }}
            />
          ))}
        </div>
      )}
      
      {children}
      
      <style>{`
        @keyframes screen-flicker {
          0% { opacity: 0.05; }
          100% { opacity: 0.15; }
        }
        
        @keyframes static-line {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes spark-fly-1 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(20px, -30px) scale(0); opacity: 0; }
        }
        
        @keyframes spark-fly-2 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-25px, -20px) scale(0); opacity: 0; }
        }
        
        @keyframes spark-fly-3 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(30px, 15px) scale(0); opacity: 0; }
        }
        
        @keyframes spark-fly-4 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-15px, 25px) scale(0); opacity: 0; }
        }
        
        @keyframes spark-fly-5 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(35px, -10px) scale(0); opacity: 0; }
        }
        
        @keyframes spark-fly-6 {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(-20px, -35px) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ConsoleGlitch;