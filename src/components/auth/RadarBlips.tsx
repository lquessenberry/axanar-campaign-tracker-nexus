import { useState, useEffect, useCallback } from 'react';
import FederationShipIcon from './FederationShipIcon';
import KlingonShipIcon from './KlingonShipIcon';
import { Waypoints } from 'lucide-react';

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
  formationIndex?: number;
}

interface Waypoint {
  id: number;
  x: number;
  y: number;
  opacity: number;
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

interface Explosion {
  id: number;
  x: number;
  y: number;
  particles: Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    maxLife: number;
  }>;
}

const RadarBlips = () => {
  const [blips, setBlips] = useState<Blip[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [userCommandActive, setUserCommandActive] = useState(false);

  const generateSafePosition = () => {
    let x, y;
    do {
      x = Math.random() * 100;
      y = Math.random() * 100;
      // Keep away from the center area where auth card is (roughly 30-70% of screen)
    } while (x > 25 && x < 75 && y > 20 && y < 80);
    return { x, y };
  };

  const createExplosion = (x: number, y: number) => {
    const particles = [];
    const particleCount = 12;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 3;
      particles.push({
        id: i,
        x: 0,
        y: 0,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.5 ? '#ff4444' : '#ff8800',
        life: 60,
        maxLife: 60,
      });
    }

    const explosion: Explosion = {
      id: Date.now() + Math.random(),
      x,
      y,
      particles,
    };

    setExplosions(prev => [...prev, explosion]);

    // Remove explosion after animation completes
    setTimeout(() => {
      setExplosions(prev => prev.filter(exp => exp.id !== explosion.id));
    }, 1000);
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

    // Occasionally create explosion when laser hits (10% chance)
    if (Math.random() < 0.1) {
      createExplosion(toCenterX, toCenterY);
      
      // Remove the target ship if it explodes
      setBlips(prevBlips => prevBlips.filter(blip => blip.id !== toBlip.id));
    }

    // Remove laser after animation
    setTimeout(() => {
      setLasers(prev => prev.filter(laser => laser.id !== newLaser.id));
    }, 300);
  };

  const createWaypoint = (x: number, y: number) => {
    const waypoint: Waypoint = {
      id: Date.now(),
      x,
      y,
      opacity: 1,
    };

    setWaypoints([waypoint]); // Only one waypoint at a time - stays until replaced
    console.log(`Waypoint created at: ${x.toFixed(1)}%, ${y.toFixed(1)}%`);
    console.log(`Current waypoints:`, [waypoint]);
  };

  const calculateVFormationPosition = (targetX: number, targetY: number, index: number, totalShips: number) => {
    // V formation parameters
    const wingSpan = 15; // Distance between ships in the formation
    const depth = 8; // How far back the wings extend
    
    if (index === 0) {
      // Lead ship at the point of the V
      return { x: targetX, y: targetY };
    }
    
    // Calculate wing positions
    const isLeftWing = index % 2 === 1;
    const wingPosition = Math.floor((index + 1) / 2);
    
    const offsetX = isLeftWing ? -wingSpan * wingPosition : wingSpan * wingPosition;
    const offsetY = depth * wingPosition;
    
    return {
      x: targetX + offsetX,
      y: targetY + offsetY
    };
  };

  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    console.log('Click detected!', event);
    
    // Prevent event bubbling
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;

    console.log(`Click coordinates: ${clickX.toFixed(1)}%, ${clickY.toFixed(1)}%`);

    // Always create waypoint at click position
    createWaypoint(clickX, clickY);
    
    // Command Federation ships to form V formation at the waypoint
    setBlips(prevBlips => 
      prevBlips.map((blip, index) => {
        if (blip.type === 'federation') {
          const fedShips = prevBlips.filter(b => b.type === 'federation');
          const formationIndex = fedShips.findIndex(f => f.id === blip.id);
          const formationPos = calculateVFormationPosition(clickX, clickY, formationIndex, fedShips.length);
          
          console.log(`Commanding ship ${blip.id} to position:`, formationPos);
          
          return {
            ...blip,
            targetX: formationPos.x,
            targetY: formationPos.y,
            formationIndex,
          };
        }
        return blip;
      })
    );
    
    // Set user command active
    setUserCommandActive(true);
    
    console.log(`Federation ships commanded to V formation at: ${clickX.toFixed(1)}%, ${clickY.toFixed(1)}%`);
  }, []);

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

    // Klingon blip animation (fade in/out) - but not during user commands
    const klingonInterval = setInterval(() => {
      if (!userCommandActive) {
        setBlips(prevBlips => 
          prevBlips.map(blip => {
            if (blip.type === 'klingon') {
              if (!blip.isVisible && Math.random() < 0.3) {
                // Fade in at new position (cloaking technology)
                const { x, y } = generateSafePosition();
                return {
                  ...blip,
                  x,
                  y,
                  isVisible: true,
                  opacity: 0.7 + Math.random() * 0.3,
                };
              } else if (blip.isVisible && Math.random() < 0.2) {
                // Cloak (fade out)
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
      }
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
          if (blip.type === 'federation') {
            let targetX, targetY;
            
            // If user has given a command, use that target
            if (userCommandActive && blip.targetX !== undefined && blip.targetY !== undefined) {
              targetX = blip.targetX;
              targetY = blip.targetY;
            } else if (waypoints.length > 0) {
              // If there's a waypoint but no active user command, go to waypoint
              const waypoint = waypoints[0];
              const fedShips = prevBlips.filter(b => b.type === 'federation');
              const formationIndex = fedShips.findIndex(f => f.id === blip.id);
              const formationPos = calculateVFormationPosition(waypoint.x, waypoint.y, formationIndex, fedShips.length);
              targetX = formationPos.x;
              targetY = formationPos.y;
            } else if (klingons.length > 0) {
              // Otherwise, find nearest visible Klingon
              const nearestKlingon = klingons.reduce((nearest, klingon) => {
                const distToCurrent = Math.sqrt(
                  Math.pow(blip.x - klingon.x, 2) + Math.pow(blip.y - klingon.y, 2)
                );
                const distToNearest = Math.sqrt(
                  Math.pow(blip.x - nearest.x, 2) + Math.pow(blip.y - nearest.y, 2)
                );
                return distToCurrent < distToNearest ? klingon : nearest;
              });
              targetX = nearestKlingon.x;
              targetY = nearestKlingon.y;
            } else {
              return blip; // No target, don't move
            }

            // Move towards target but stay in safe zone
            const deltaX = targetX - blip.x;
            const deltaY = targetY - blip.y;
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
  }, [userCommandActive]);

  // Animation loop for explosion particles
  useEffect(() => {
    const animateExplosions = () => {
      setExplosions(prevExplosions => 
        prevExplosions.map(explosion => ({
          ...explosion,
          particles: explosion.particles.map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            life: particle.life - 1,
            vx: particle.vx * 0.98, // Slow down over time
            vy: particle.vy * 0.98,
          })).filter(particle => particle.life > 0)
        })).filter(explosion => explosion.particles.length > 0)
      );
    };

    const explosionInterval = setInterval(animateExplosions, 16); // ~60fps

    return () => clearInterval(explosionInterval);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-0 cursor-crosshair"
      onClick={handleMouseClick}
      style={{ 
        pointerEvents: 'auto',
        backgroundColor: 'transparent'
      }}
    >
      {/* Render ships */}
      {blips.map((blip) => (
        <div
          key={blip.id}
          className="absolute transition-all duration-500 ease-in-out pointer-events-none"
          style={{
            left: `${blip.x}%`,
            top: `${blip.y}%`,
            opacity: blip.opacity,
            transform: `scale(${blip.scale})`,
            zIndex: 5,
          }}
        >
          {blip.type === 'federation' ? (
            <FederationShipIcon size={32} className="text-axanar-teal" />
          ) : (
            <KlingonShipIcon size={36} className="text-red-500" />
          )}
        </div>
      ))}
      
      {/* Render waypoints - now persistent until replaced */}
      {waypoints.map((waypoint) => (
        <div
          key={waypoint.id}
          className="absolute pointer-events-none"
          style={{
            left: `${waypoint.x}%`,
            top: `${waypoint.y}%`,
            opacity: waypoint.opacity,
            transform: 'translate(-50%, -50%)',
            zIndex: 20,
          }}
        >
          <div className="relative">
            <Waypoints size={32} className="text-axanar-teal animate-pulse drop-shadow-lg filter drop-shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            <div className="absolute inset-0 animate-ping">
              <Waypoints size={32} className="text-axanar-teal opacity-40" />
            </div>
            {/* Add a background circle for better visibility */}
            <div className="absolute inset-0 -z-10 w-8 h-8 bg-axanar-teal/20 rounded-full blur-sm animate-pulse" />
          </div>
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
            zIndex: 15,
          }}
        />
      ))}

      {/* Render explosions */}
      {explosions.map((explosion) => (
        <div
          key={explosion.id}
          className="absolute pointer-events-none"
          style={{
            left: `${explosion.x}%`,
            top: `${explosion.y}%`,
            zIndex: 10,
          }}
        >
          {explosion.particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                backgroundColor: particle.color,
                opacity: particle.life / particle.maxLife,
                boxShadow: `0 0 4px ${particle.color}`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default RadarBlips;
