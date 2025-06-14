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
  targetX?: number;
  targetY?: number;
  isVisible?: boolean;
}

const RadarBlips = () => {
  const [blips, setBlips] = useState<Blip[]>([]);

  const generateSafePosition = () => {
    let x, y;
    do {
      x = Math.random() * 100;
      y = Math.random() * 100;
      // Keep away from the center area where auth card is (roughly 30-70% of screen)
    } while (x > 25 && x < 75 && y > 20 && y < 80);
    return { x, y };
  };

  useEffect(() => {
    const generateBlips = () => {
      const newBlips: Blip[] = [];
      
      // Generate Klingon ships (blips that fade in/out)
      for (let i = 0; i < 4; i++) {
        const { x, y } = generateSafePosition();
        
        newBlips.push({
          id: i,
          x,
          y,
          type: 'klingon',
          opacity: 0,
          scale: 0.8 + Math.random() * 0.4,
          isVisible: false,
        });
      }
      
      // Generate Federation ships (chasers)
      for (let i = 4; i < 8; i++) {
        const { x, y } = generateSafePosition();
        
        newBlips.push({
          id: i,
          x,
          y,
          type: 'federation',
          opacity: 0.6 + Math.random() * 0.3,
          scale: 0.8 + Math.random() * 0.3,
          targetX: x,
          targetY: y,
        });
      }
      
      setBlips(newBlips);
    };

    generateBlips();

    // Klingon blip animation (fade in/out)
    const klingonInterval = setInterval(() => {
      setBlips(prevBlips => 
        prevBlips.map(blip => {
          if (blip.type === 'klingon') {
            if (!blip.isVisible && Math.random() < 0.3) {
              // Fade in
              const { x, y } = generateSafePosition();
              return {
                ...blip,
                x,
                y,
                isVisible: true,
                opacity: 0.7 + Math.random() * 0.3,
              };
            } else if (blip.isVisible && Math.random() < 0.2) {
              // Fade out
              return {
                ...blip,
                isVisible: false,
                opacity: 0,
              };
            }
          }
          return blip;
        })
      );
    }, 1000);

    // Federation chase animation
    const chaseInterval = setInterval(() => {
      setBlips(prevBlips => {
        const klingons = prevBlips.filter(b => b.type === 'klingon' && b.isVisible);
        
        return prevBlips.map(blip => {
          if (blip.type === 'federation' && klingons.length > 0) {
            // Find nearest visible Klingon
            const nearestKlingon = klingons.reduce((nearest, klingon) => {
              const distToCurrent = Math.sqrt(
                Math.pow(blip.x - klingon.x, 2) + Math.pow(blip.y - klingon.y, 2)
              );
              const distToNearest = Math.sqrt(
                Math.pow(blip.x - nearest.x, 2) + Math.pow(blip.y - nearest.y, 2)
              );
              return distToCurrent < distToNearest ? klingon : nearest;
            });

            // Move towards Klingon but stay in safe zone
            const deltaX = nearestKlingon.x - blip.x;
            const deltaY = nearestKlingon.y - blip.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > 5) {
              const speed = 0.5;
              let newX = blip.x + (deltaX / distance) * speed;
              let newY = blip.y + (deltaY / distance) * speed;

              // Keep in safe zone (avoid center)
              if (newX > 25 && newX < 75 && newY > 20 && newY < 80) {
                // If moving into center, move around the edges
                if (newX < 50) {
                  newX = Math.max(5, newX - 2);
                } else {
                  newX = Math.min(95, newX + 2);
                }
              }

              // Keep within viewport bounds
              newX = Math.max(5, Math.min(95, newX));
              newY = Math.max(5, Math.min(95, newY));

              return {
                ...blip,
                x: newX,
                y: newY,
              };
            }
          }
          return blip;
        });
      });
    }, 100);

    return () => {
      clearInterval(klingonInterval);
      clearInterval(chaseInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {blips.map((blip) => (
        <div
          key={blip.id}
          className="absolute transition-all duration-500 ease-in-out"
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
