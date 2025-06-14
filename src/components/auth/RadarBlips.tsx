
import { useEffect, useState } from 'react';
import KlingonShipIcon from './KlingonShipIcon';

interface Blip {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  isAppearing: boolean;
}

const RadarBlips = () => {
  const [blips, setBlips] = useState<Blip[]>([]);

  useEffect(() => {
    const createBlip = () => {
      const newBlip: Blip = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        opacity: 0,
        size: Math.random() * 8 + 4, // 4-12px
        isAppearing: true,
      };

      setBlips(prev => [...prev, newBlip]);

      // Start fade in animation
      setTimeout(() => {
        setBlips(prev => 
          prev.map(blip => 
            blip.id === newBlip.id 
              ? { ...blip, opacity: 1 } 
              : blip
          )
        );

        // Start fade out after being visible
        setTimeout(() => {
          setBlips(prev => 
            prev.map(blip => 
              blip.id === newBlip.id 
                ? { ...blip, opacity: 0, isAppearing: false } 
                : blip
            )
          );

          // Remove blip after fade out
          setTimeout(() => {
            setBlips(prev => prev.filter(blip => blip.id !== newBlip.id));
          }, 1000);
        }, 2000 + Math.random() * 3000); // Visible for 2-5 seconds
      }, 100);
    };

    // Create initial blips
    const createInitialBlips = () => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => createBlip(), i * 1000);
      }
    };

    createInitialBlips();

    // Continue creating blips at random intervals
    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every interval
        createBlip();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {blips.map((blip) => (
        <div
          key={blip.id}
          className="absolute"
          style={{
            left: `${blip.x}%`,
            top: `${blip.y}%`,
            transition: 'opacity 1s ease-in-out',
            opacity: blip.opacity,
          }}
        >
          {/* Klingon ship icon */}
          <div 
            className="flex items-center justify-center animate-pulse"
            style={{
              width: `${blip.size * 2}px`,
              height: `${blip.size * 2}px`,
              filter: `drop-shadow(0 0 ${blip.size}px rgba(14, 165, 233, 0.6))`,
            }}
          >
            <KlingonShipIcon 
              size={blip.size * 2.25} 
              className="text-axanar-teal"
            />
          </div>
          
          {/* Radar sweep rings */}
          <div 
            className="absolute inset-0 border border-axanar-teal/40 rounded-full animate-ping"
            style={{
              width: `${blip.size * 4}px`,
              height: `${blip.size * 4}px`,
              left: `${-blip.size}px`,
              top: `${-blip.size}px`,
              animationDuration: '2s',
            }}
          />
          
          <div 
            className="absolute inset-0 border border-axanar-teal/20 rounded-full animate-ping"
            style={{
              width: `${blip.size * 6}px`,
              height: `${blip.size * 6}px`,
              left: `${-blip.size * 2}px`,
              top: `${-blip.size * 2}px`,
              animationDuration: '3s',
            }}
          />

          {/* Contact classification indicator */}
          <div 
            className="absolute bg-gray-900/80 border border-red-500/50 rounded px-2 py-1 text-xs text-red-400 font-mono backdrop-blur-sm"
            style={{
              left: `${blip.size * 2 + 10}px`,
              top: `${-blip.size / 2}px`,
              whiteSpace: 'nowrap',
            }}
          >
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
              KLINGON D7 BATTLECRUISER
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RadarBlips;
