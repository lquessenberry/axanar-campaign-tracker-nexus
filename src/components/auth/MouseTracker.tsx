
import { useEffect, useState } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

const MouseTracker = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isTracking, setIsTracking] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [targetingMode, setTargetingMode] = useState(false);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      // Use viewport coordinates for more accurate tracking
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check if mouse is over a card element or interactive elements
      const target = e.target as Element;
      const isOverCard = target.closest('[data-card]') !== null;
      const isOverInteractive = target.closest('button, a, nav, footer') !== null;
      
      setIsHoveringCard(isOverCard || isOverInteractive);
      
      // Check if mouse is in targeting areas (not over interactive elements)
      const isInTargetingArea = !isOverCard && !isOverInteractive;
      setTargetingMode(isInTargetingArea);
      
      // Activate tracking when mouse moves
      if (!isTracking) {
        setIsTracking(true);
      }
    };

    const handleMouseLeave = () => {
      setIsTracking(false);
      setIsHoveringCard(false);
      setTargetingMode(false);
    };

    // Listen to mousemove on the entire document for better tracking
    document.addEventListener('mousemove', updateMousePosition);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isTracking]);

  if (!isTracking || isHoveringCard) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Main targeting reticle */}
      <div 
        className="absolute w-12 h-12 border-2 border-axanar-teal rounded-full animate-pulse"
        style={{ 
          left: mousePosition.x - 24, 
          top: mousePosition.y - 24,
          transition: 'all 0.05s ease-out'
        }}
      >
        {/* Inner crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1 h-6 bg-axanar-teal opacity-60"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-1 bg-axanar-teal opacity-60"></div>
        </div>
        
        {/* Corner brackets */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-axanar-teal"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-axanar-teal"></div>
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-axanar-teal"></div>
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-axanar-teal"></div>
      </div>

      {/* Secondary tracking rings */}
      <div 
        className="absolute w-20 h-20 border border-axanar-teal/40 rounded-full animate-ping"
        style={{ 
          left: mousePosition.x - 40, 
          top: mousePosition.y - 40,
          transition: 'all 0.1s ease-out',
          animationDuration: '2s'
        }}
      ></div>

      <div 
        className="absolute w-32 h-32 border border-axanar-teal/20 rounded-full animate-ping"
        style={{ 
          left: mousePosition.x - 64, 
          top: mousePosition.y - 64,
          transition: 'all 0.15s ease-out',
          animationDuration: '3s'
        }}
      ></div>

      {/* Scanning lines - full viewport */}
      <div 
        className="absolute w-0.5 h-full bg-gradient-to-b from-transparent via-axanar-teal/30 to-transparent animate-pulse"
        style={{ 
          left: mousePosition.x,
          transition: 'all 0.05s ease-out'
        }}
      ></div>

      <div 
        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-axanar-teal/30 to-transparent animate-pulse"
        style={{ 
          top: mousePosition.y,
          transition: 'all 0.05s ease-out'
        }}
      ></div>

      {/* Status indicator with hover state */}
      <div 
        className="absolute bg-gray-900/90 border border-axanar-teal/50 rounded px-3 py-1 text-xs text-axanar-teal font-mono backdrop-blur-sm transition-colors duration-200"
        style={{ 
          left: mousePosition.x + 30, 
          top: mousePosition.y - 30,
          transition: 'all 0.05s ease-out'
        }}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full animate-pulse transition-colors duration-200 ${
            targetingMode ? 'bg-red-400' : 'bg-green-400'
          }`}></div>
          {targetingMode ? 'TARGETING' : 'SCANNING SECTOR'}
        </div>
        <div className="text-xs text-axanar-teal/60">
          X: {Math.round(mousePosition.x)} Y: {Math.round(mousePosition.y)}
        </div>
      </div>
    </div>
  );
};

export default MouseTracker;
