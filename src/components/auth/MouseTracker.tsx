
import { useEffect, useState } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface ShipInfo {
  type: 'federation' | 'klingon';
  registry?: string;
  distance: number;
}

const MouseTracker = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [isTracking, setIsTracking] = useState(false);
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [targetingMode, setTargetingMode] = useState(false);
  const [hoveredShip, setHoveredShip] = useState<ShipInfo | null>(null);

  // Federation ship registries for identification
  const federationRegistries = ['NCC-1650', 'NCC-1657', 'NCC-1653', 'NCC-1651', 'NCC-1668'];

  const detectShipAtPosition = (x: number, y: number): ShipInfo | null => {
    // Convert screen coordinates to viewport percentages
    const viewportX = (x / window.innerWidth) * 100;
    const viewportY = (y / window.innerHeight) * 100;
    
    // Find all ship elements and check if mouse is over any of them
    const shipElements = document.querySelectorAll('[data-ship-type]');
    
    for (const shipElement of shipElements) {
      const rect = shipElement.getBoundingClientRect();
      const shipCenterX = rect.left + rect.width / 2;
      const shipCenterY = rect.top + rect.height / 2;
      
      // Check if mouse is within ship bounds (with some tolerance for easier targeting)
      const tolerance = 25; // pixels
      if (Math.abs(x - shipCenterX) < tolerance && Math.abs(y - shipCenterY) < tolerance) {
        const shipType = shipElement.getAttribute('data-ship-type') as 'federation' | 'klingon';
        const shipIndex = parseInt(shipElement.getAttribute('data-ship-index') || '0');
        
        // Calculate distance from center of screen
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const distanceInKm = Math.round(distance * 10); // Convert to fictional km
        
        return {
          type: shipType,
          registry: shipType === 'federation' ? federationRegistries[shipIndex % federationRegistries.length] : undefined,
          distance: distanceInKm
        };
      }
    }
    
    return null;
  };

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      // Use viewport coordinates for more accurate tracking
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Check if mouse is over a card element or interactive elements
      const target = e.target as Element;
      const isOverCard = target.closest('[data-card]') !== null;
      const isOverInteractive = target.closest('button, a, nav, footer') !== null;
      
      setIsHoveringCard(isOverCard || isOverInteractive);
      
      // Check for ship detection
      const shipInfo = detectShipAtPosition(e.clientX, e.clientY);
      setHoveredShip(shipInfo);
      
      // Check if mouse is in targeting areas (not over interactive elements)
      const isInTargetingArea = !isOverCard && !isOverInteractive;
      setTargetingMode(isInTargetingArea && !shipInfo); // Don't show targeting when over ship
      
      // Activate tracking when mouse moves
      if (!isTracking) {
        setIsTracking(true);
      }
    };

    const handleMouseLeave = () => {
      setIsTracking(false);
      setIsHoveringCard(false);
      setTargetingMode(false);
      setHoveredShip(null);
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
        className={`absolute w-12 h-12 border-2 rounded-full animate-pulse transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'border-blue-400' : 'border-red-500')
            : 'border-axanar-teal'
        }`}
        style={{ 
          left: mousePosition.x - 24, 
          top: mousePosition.y - 24,
          transition: 'all 0.05s ease-out'
        }}
      >
        {/* Inner crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-1 h-6 opacity-60 transition-colors duration-200 ${
            hoveredShip 
              ? (hoveredShip.type === 'federation' ? 'bg-blue-400' : 'bg-red-500')
              : 'bg-axanar-teal'
          }`}></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-6 h-1 opacity-60 transition-colors duration-200 ${
            hoveredShip 
              ? (hoveredShip.type === 'federation' ? 'bg-blue-400' : 'bg-red-500')
              : 'bg-axanar-teal'
          }`}></div>
        </div>
        
        {/* Corner brackets */}
        <div className={`absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'border-blue-400' : 'border-red-500')
            : 'border-axanar-teal'
        }`}></div>
        <div className={`absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'border-blue-400' : 'border-red-500')
            : 'border-axanar-teal'
        }`}></div>
        <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'border-blue-400' : 'border-red-500')
            : 'border-axanar-teal'
        }`}></div>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'border-blue-400' : 'border-red-500')
            : 'border-axanar-teal'
        }`}></div>
      </div>

      {/* Secondary tracking rings */}
      <div 
        className={`absolute w-20 h-20 border rounded-full animate-ping transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'border-blue-400/40' : 'border-red-500/40')
            : 'border-axanar-teal/40'
        }`}
        style={{ 
          left: mousePosition.x - 40, 
          top: mousePosition.y - 40,
          transition: 'all 0.1s ease-out',
          animationDuration: '2s'
        }}
      ></div>

      <div 
        className={`absolute w-32 h-32 border rounded-full animate-ping transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'border-blue-400/20' : 'border-red-500/20')
            : 'border-axanar-teal/20'
        }`}
        style={{ 
          left: mousePosition.x - 64, 
          top: mousePosition.y - 64,
          transition: 'all 0.15s ease-out',
          animationDuration: '3s'
        }}
      ></div>

      {/* Scanning lines - full viewport */}
      <div 
        className={`absolute w-0.5 h-full bg-gradient-to-b from-transparent to-transparent animate-pulse transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'via-blue-400/30' : 'via-red-500/30')
            : 'via-axanar-teal/30'
        }`}
        style={{ 
          left: mousePosition.x,
          transition: 'all 0.05s ease-out'
        }}
      ></div>

      <div 
        className={`absolute w-full h-0.5 bg-gradient-to-r from-transparent to-transparent animate-pulse transition-colors duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' ? 'via-blue-400/30' : 'via-red-500/30')
            : 'via-axanar-teal/30'
        }`}
        style={{ 
          top: mousePosition.y,
          transition: 'all 0.05s ease-out'
        }}
      ></div>

      {/* Status indicator with ship identification */}
      <div 
        className={`absolute bg-gray-900/90 border rounded px-3 py-1 text-xs font-mono backdrop-blur-sm transition-all duration-200 ${
          hoveredShip 
            ? (hoveredShip.type === 'federation' 
                ? 'border-blue-400/50 text-blue-400' 
                : 'border-red-500/50 text-red-400')
            : 'border-axanar-teal/50 text-axanar-teal'
        }`}
        style={{ 
          left: mousePosition.x + 30, 
          top: mousePosition.y - 30,
          transition: 'all 0.05s ease-out'
        }}
      >
        {hoveredShip ? (
          <div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                hoveredShip.type === 'federation' ? 'bg-blue-400' : 'bg-red-500'
              }`}></div>
              {hoveredShip.type === 'federation' ? 'FRIEND' : 'FOE'}
            </div>
            <div className="text-xs opacity-80">
              {hoveredShip.type === 'federation' 
                ? hoveredShip.registry 
                : 'Unknown Klingon Vessel'}
            </div>
            <div className="text-xs opacity-60">
              Range: {hoveredShip.distance} km
            </div>
          </div>
        ) : (
          <div>
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
        )}
      </div>
    </div>
  );
};

export default MouseTracker;
