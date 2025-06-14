
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

interface Laser {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  opacity: number;
}

const RadarBlips = () => {
  const [blips, setBlips] = useState<Blip[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);

  const generateSafePosition = () => {
    let x, y;
    do {
      x = Math.random() * 100;
      y = Math.random() * 100;
      // Keep away from the center area where auth card is (roughly 30-70% of screen)
    } while (x > 25 && x < 75 && y > 20 && y < 80);
    return { x, y };
  };

  const fireLaser = (fromBlip: Blip, toBlip: Blip) => {
    // Calculate center positions of ships (accounting for ship size)
    const shipOffset = 1.5; // Approximate center offset for ship icons
    const fromCenterX = fromBlip.x + shipOffset;
    const fromCenterY = fromBlip.y + shipOffset;
    const toCenterX = toBlip.x + shipOffset;
    const toCenterY = toBlip.y + shipOffset;

    const newLaser: Laser = {
      id: Date.now() + Math.random(),
      fromX: fromCenterX,
      fromY: fromCenterY,
      toX: toCenterX,
      toY: toCenterY,
      color: fromBlip.type === 'federation' ? '#14b8a6' : '#ef4444',
      opacity: 1,
    };

    setLasers(prev => [...prev, newLaser]);

    // Remove laser after animation
    setTimeout(() => {
      setLasers(prev => prev.filter(laser => laser.id !== newLaser.id));
    }, 300);
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

    // Federation chase animation and laser combat
    const chaseInterval = setInterval(() => {
      setBlips(prevBlips => {
        const klingons = prevBlips.filter(b => b.type === 'klingon' && b.isVisible);
        const federations = prevBlips.filter(b => b.type === 'federation');
        
        // Check for laser combat opportunities
        federations.forEach(fed => {
          klingons.forEach(klingon => {
            const distance = Math.sqrt(
              Math.pow(fed.x - klingon.x, 2) + Math.pow(fed.y - klingon.y, 2)
            );
            
            // Fire lasers when close enough
            if (distance < 15 && Math.random() < 0.3) {
              fireLaser(fed, klingon);
            }
          });
        });

        // Klingons fire back at Federation ships
        klingons.forEach(klingon => {
          federations.forEach(fed => {
            const distance = Math.sqrt(
              Math.pow(klingon.x - fed.x, 2) + Math.pow(klingon.y - fed.y, 2)
            );
            
            // Klingons fire back when close
            if (distance < 12 && Math.random() < 0.2) {
              fireLaser(klingon, fed);
            }
          });
        });
        
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
      {/* Render ships */}
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
      
      {/* Render laser beams */}
      {lasers.map((laser) => (
        <div
          key={laser.id}
          className="absolute pointer-events-none"
          style={{
            left: `${laser.fromX}%`,
            top: `${laser.fromY}%`,
            width: `${Math.sqrt(Math.pow(laser.toX - laser.fromX, 2) + Math.pow(laser.toY - laser.fromY, 2))}%`,
            height: '2px',
            background: `linear-gradient(90deg, ${laser.color} 0%, transparent 100%)`,
            opacity: laser.opacity,
            transformOrigin: '0 50%',
            transform: `rotate(${Math.atan2(laser.toY - laser.fromY, laser.toX - laser.fromX) * 180 / Math.PI}deg)`,
            animation: 'fade-out 0.3s ease-out forwards',
          }}
        />
      ))}
    </div>
  );
};

export default RadarBlips;
