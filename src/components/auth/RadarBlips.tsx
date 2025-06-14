
import { useState, useEffect } from 'react';
import FederationShipIcon from './FederationShipIcon';
import KlingonShipIcon from './KlingonShipIcon';

interface Blip {
  id: number;
  x: number;
  y: number;
  type: 'federation' | 'klingon';
  opacity: number;
  scale: number;
}

const RadarBlips = () => {
  const [blips, setBlips] = useState<Blip[]>([]);

  useEffect(() => {
    const generateBlips = () => {
      const newBlips: Blip[] = [];
      
      // Generate Federation ships
      for (let i = 0; i < 4; i++) {
        let x, y;
        do {
          x = Math.random() * 100;
          y = Math.random() * 100;
          // Keep away from the center area where auth card is (roughly 30-70% of screen)
        } while (x > 25 && x < 75 && y > 20 && y < 80);
        
        newBlips.push({
          id: i,
          x,
          y,
          type: 'federation',
          opacity: 0.3 + Math.random() * 0.4,
          scale: 0.8 + Math.random() * 0.3, // Increased size
        });
      }
      
      // Generate Klingon ships
      for (let i = 4; i < 8; i++) {
        let x, y;
        do {
          x = Math.random() * 100;
          y = Math.random() * 100;
          // Keep away from the center area where auth card is
        } while (x > 25 && x < 75 && y > 20 && y < 80);
        
        newBlips.push({
          id: i,
          x,
          y,
          type: 'klingon',
          opacity: 0.3 + Math.random() * 0.4,
          scale: 0.8 + Math.random() * 0.4, // Increased size
        });
      }
      
      setBlips(newBlips);
    };

    generateBlips();
    const interval = setInterval(generateBlips, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {blips.map((blip) => (
        <div
          key={blip.id}
          className="absolute transition-all duration-1000 ease-in-out"
          style={{
            left: `${blip.x}%`,
            top: `${blip.y}%`,
            opacity: blip.opacity,
            transform: `scale(${blip.scale})`,
          }}
        >
          {blip.type === 'federation' ? (
            <FederationShipIcon size={32} className="text-axanar-teal" />
          ) : (
            <KlingonShipIcon size={36} className="text-red-500" />
          )}
        </div>
      ))}
    </div>
  );
};

export default RadarBlips;
