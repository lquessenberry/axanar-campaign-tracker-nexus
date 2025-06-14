
import { useEffect, useState } from 'react';
import KlingonShipIcon from './KlingonShipIcon';
import FederationShipIcon from './FederationShipIcon';

interface Blip {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
  isAppearing: boolean;
}

interface FederationShip {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  opacity: number;
  size: number;
  isCombat: boolean;
  combatTarget?: number;
}

interface LaserBeam {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  opacity: number;
  isFederation: boolean;
}

const RadarBlips = () => {
  const [blips, setBlips] = useState<Blip[]>([]);
  const [federationShips, setFederationShips] = useState<FederationShip[]>([]);
  const [laserBeams, setLaserBeams] = useState<LaserBeam[]>([]);

  const generateSafePosition = () => {
    // Define the safe zones to avoid the center card area
    const cardAreaLeft = 25; // 25% from left
    const cardAreaRight = 75; // 75% from left
    const cardAreaTop = 25; // 25% from top
    const cardAreaBottom = 75; // 75% from top
    
    let x, y;
    let attempts = 0;
    const maxAttempts = 50;
    
    do {
      x = Math.random() * 100;
      y = Math.random() * 100;
      attempts++;
      
      // Check if position is outside the card area
      const isOutsideCardArea = (
        x < cardAreaLeft || 
        x > cardAreaRight || 
        y < cardAreaTop || 
        y > cardAreaBottom
      );
      
      if (isOutsideCardArea || attempts >= maxAttempts) {
        break;
      }
    } while (true);
    
    return { x, y };
  };

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const createLaserBeam = (fromX: number, fromY: number, toX: number, toY: number, isFederation: boolean) => {
    const beamId = Date.now() + Math.random();
    const newBeam: LaserBeam = {
      id: beamId,
      fromX,
      fromY,
      toX,
      toY,
      opacity: 1,
      isFederation
    };

    setLaserBeams(prev => [...prev, newBeam]);

    // Remove beam after animation
    setTimeout(() => {
      setLaserBeams(prev => prev.filter(beam => beam.id !== beamId));
    }, 300);
  };

  // Initialize Federation fleet
  useEffect(() => {
    const initialFleet: FederationShip[] = [];
    for (let i = 0; i < 5; i++) {
      const position = generateSafePosition();
      const targetPosition = generateSafePosition();
      initialFleet.push({
        id: i + 1,
        x: position.x,
        y: position.y,
        targetX: targetPosition.x,
        targetY: targetPosition.y,
        opacity: 1,
        size: 12,
        isCombat: false
      });
    }
    setFederationShips(initialFleet);
  }, []);

  // Federation ship movement and combat logic
  useEffect(() => {
    const moveShips = setInterval(() => {
      setFederationShips(prev => prev.map(ship => {
        let newX = ship.x;
        let newY = ship.y;
        let newTargetX = ship.targetX;
        let newTargetY = ship.targetY;
        let isCombat = false;
        let combatTarget = undefined;

        // Check for nearby Klingon ships
        const nearbyKlingon = blips.find(blip => {
          const distance = calculateDistance(ship.x, ship.y, blip.x, blip.y);
          return distance < 8; // Combat range
        });

        if (nearbyKlingon) {
          // Engage in combat
          isCombat = true;
          combatTarget = nearbyKlingon.id;
          newTargetX = nearbyKlingon.x;
          newTargetY = nearbyKlingon.y;

          // Fire lasers occasionally
          if (Math.random() < 0.3) {
            createLaserBeam(ship.x, ship.y, nearbyKlingon.x, nearbyKlingon.y, true);
          }
        } else {
          // Find nearest Klingon to pursue
          const nearestKlingon = blips.reduce((nearest, blip) => {
            const distance = calculateDistance(ship.x, ship.y, blip.x, blip.y);
            const nearestDistance = nearest ? calculateDistance(ship.x, ship.y, nearest.x, nearest.y) : Infinity;
            return distance < nearestDistance ? blip : nearest;
          }, null as Blip | null);

          if (nearestKlingon) {
            newTargetX = nearestKlingon.x;
            newTargetY = nearestKlingon.y;
          } else {
            // Patrol if no targets - use safe positioning for new patrol target
            const distanceToTarget = calculateDistance(ship.x, ship.y, ship.targetX, ship.targetY);
            if (distanceToTarget < 5) {
              const newTarget = generateSafePosition();
              newTargetX = newTarget.x;
              newTargetY = newTarget.y;
            }
          }
        }

        // Move towards target
        const dx = newTargetX - ship.x;
        const dy = newTargetY - ship.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
          const speed = isCombat ? 0.5 : 0.3;
          newX += (dx / distance) * speed;
          newY += (dy / distance) * speed;
        }

        return {
          ...ship,
          x: newX,
          y: newY,
          targetX: newTargetX,
          targetY: newTargetY,
          isCombat,
          combatTarget
        };
      }));
    }, 100);

    return () => clearInterval(moveShips);
  }, [blips]);

  // Klingon return fire
  useEffect(() => {
    const returnFire = setInterval(() => {
      federationShips.forEach(ship => {
        if (ship.isCombat && ship.combatTarget) {
          const target = blips.find(blip => blip.id === ship.combatTarget);
          if (target && Math.random() < 0.2) {
            createLaserBeam(target.x, target.y, ship.x, ship.y, false);
          }
        }
      });
    }, 200);

    return () => clearInterval(returnFire);
  }, [federationShips, blips]);

  useEffect(() => {
    const createBlip = () => {
      const position = generateSafePosition();
      const newBlip: Blip = {
        id: Date.now() + Math.random(),
        x: position.x,
        y: position.y,
        opacity: 0,
        size: Math.random() * 4 + 8, // 8-12px (increased from 4-12px)
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
      {/* Klingon D7 Battlecruisers */}
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
              width: `${blip.size * 3}px`,
              height: `${blip.size * 3}px`,
              filter: `drop-shadow(0 0 ${blip.size}px rgba(14, 165, 233, 0.6))`,
            }}
          >
            <KlingonShipIcon 
              size={blip.size * 3} 
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

      {/* Federation Ships */}
      {federationShips.map((ship) => (
        <div
          key={`fed-${ship.id}`}
          className="absolute"
          style={{
            left: `${ship.x}%`,
            top: `${ship.y}%`,
            transition: 'all 0.1s linear',
            opacity: ship.opacity,
          }}
        >
          {/* Federation ship icon */}
          <div 
            className={`flex items-center justify-center ${ship.isCombat ? 'animate-pulse' : ''}`}
            style={{
              width: `${ship.size * 2.5}px`,
              height: `${ship.size * 2.5}px`,
              filter: `drop-shadow(0 0 ${ship.size}px rgba(59, 130, 246, 0.6))`,
            }}
          >
            <FederationShipIcon 
              size={ship.size * 2.5} 
              className="text-blue-400"
            />
          </div>

          {/* Combat indicator */}
          {ship.isCombat && (
            <div 
              className="absolute bg-gray-900/80 border border-blue-500/50 rounded px-1 py-0.5 text-xs text-blue-400 font-mono backdrop-blur-sm"
              style={{
                left: `${ship.size * 1.5 + 8}px`,
                top: `${-ship.size / 3}px`,
                whiteSpace: 'nowrap',
              }}
            >
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                ENGAGING
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Laser Beams */}
      {laserBeams.map((beam) => (
        <div
          key={beam.id}
          className="absolute pointer-events-none"
          style={{
            left: `${beam.fromX}%`,
            top: `${beam.fromY}%`,
            width: `${Math.abs(beam.toX - beam.fromX)}%`,
            height: `${Math.abs(beam.toY - beam.fromY)}%`,
            opacity: beam.opacity,
          }}
        >
          <svg
            className="absolute inset-0 w-full h-full"
            style={{
              transform: beam.toX < beam.fromX || beam.toY < beam.fromY ? 'scale(-1, -1)' : 'none',
            }}
          >
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="100%"
              stroke={beam.isFederation ? '#3b82f6' : '#ef4444'}
              strokeWidth="2"
              className="animate-pulse"
              style={{
                filter: `drop-shadow(0 0 4px ${beam.isFederation ? '#3b82f6' : '#ef4444'})`,
              }}
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default RadarBlips;
