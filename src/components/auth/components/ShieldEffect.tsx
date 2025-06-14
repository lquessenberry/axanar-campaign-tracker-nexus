
import React from 'react';

interface ShieldEffectProps {
  isActive: boolean;
  shieldStrength: number;
  isHit: boolean;
}

const ShieldEffect = ({ isActive, shieldStrength, isHit }: ShieldEffectProps) => {
  if (!isActive) return null;

  const opacity = Math.max(0.1, shieldStrength / 100);
  const shimmerIntensity = isHit ? 0.8 : 0.3;

  return (
    <>
      <style>{`
        @keyframes shield-shimmer {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes shield-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shield-hit {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          width: '60px',
          height: '60px',
          left: '-14px',
          top: '-14px',
          zIndex: 3,
        }}
      >
        {/* Main shield bubble */}
        <div 
          className={`w-full h-full rounded-full border-2 border-axanar-teal transition-all duration-300 ${
            isHit ? 'animate-pulse' : ''
          }`}
          style={{
            opacity: opacity,
            background: `radial-gradient(circle, rgba(20, 184, 166, ${shimmerIntensity * 0.1}) 0%, rgba(20, 184, 166, ${shimmerIntensity * 0.05}) 50%, transparent 70%)`,
            boxShadow: `0 0 20px rgba(20, 184, 166, ${shimmerIntensity})`,
            animation: isHit ? 'shield-hit 0.5s ease-out' : 'shield-shimmer 3s ease-in-out infinite',
          }}
        />
        
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, rgba(20, 184, 166, ${shimmerIntensity * 0.3}) 60deg, transparent 120deg)`,
            animation: 'shield-rotate 2s linear infinite',
            opacity: opacity * 0.7,
          }}
        />
      </div>
    </>
  );
};

export default ShieldEffect;
