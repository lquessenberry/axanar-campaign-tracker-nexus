
import { useState, useEffect, useCallback } from 'react';
import { Blip, Laser, Explosion, ReticleInfo } from '../types/battleTypes';
import { ATTACK_COMMANDS, BATTLE_CONFIG } from '../constants/battleConstants';
import { generateSafePosition, calculateDistance, clampToViewport, isOutsideAuthCard } from '../utils/battleUtils';

export const useBattleLogic = () => {
  const [blips, setBlips] = useState<Blip[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const [reticleInfo, setReticleInfo] = useState<ReticleInfo | null>(null);

  const createExplosion = (x: number, y: number) => {
    const particles = [];
    
    for (let i = 0; i < BATTLE_CONFIG.EXPLOSION_PARTICLES; i++) {
      const angle = (i / BATTLE_CONFIG.EXPLOSION_PARTICLES) * Math.PI * 2;
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

    setTimeout(() => {
      setExplosions(prev => prev.filter(exp => exp.id !== explosion.id));
    }, BATTLE_CONFIG.EXPLOSION_DURATION);
  };

  const fireLaser = (fromBlip: Blip, toBlip: Blip) => {
    const fromCenterX = fromBlip.x + BATTLE_CONFIG.SHIP_OFFSET;
    const fromCenterY = fromBlip.y + BATTLE_CONFIG.SHIP_OFFSET;
    const toCenterX = toBlip.x + BATTLE_CONFIG.SHIP_OFFSET;
    const toCenterY = toBlip.y + BATTLE_CONFIG.SHIP_OFFSET;

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

    if (Math.random() < BATTLE_CONFIG.EXPLOSION_CHANCE) {
      createExplosion(toCenterX, toCenterY);
      setBlips(prevBlips => prevBlips.filter(blip => blip.id !== toBlip.id));
    }

    setTimeout(() => {
      setLasers(prev => prev.filter(laser => laser.id !== newLaser.id));
    }, BATTLE_CONFIG.LASER_DURATION);
  };

  const showReticleInfo = (x: number, y: number) => {
    const randomCommand = ATTACK_COMMANDS[Math.floor(Math.random() * ATTACK_COMMANDS.length)];
    
    const newReticleInfo: ReticleInfo = {
      message: randomCommand,
      x,
      y,
      opacity: 1,
    };

    setReticleInfo(newReticleInfo);

    setTimeout(() => {
      setReticleInfo(prev => prev ? { ...prev, opacity: 0 } : null);
    }, BATTLE_CONFIG.RETICLE_DISPLAY_TIME);

    setTimeout(() => {
      setReticleInfo(null);
    }, BATTLE_CONFIG.RETICLE_FADE_TIME);
  };

  const handleMouseClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    const isInteractiveElement = target.closest('button, a, input, select, textarea, [role="button"]');
    
    if (isInteractiveElement) {
      return;
    }
    
    event.preventDefault();
    event.stopPropagation();
    
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;

    if (isOutsideAuthCard(clickX, clickY)) {
      showReticleInfo(clickX, clickY);
    }
  }, []);

  // Initialize battle
  useEffect(() => {
    const generateBlips = () => {
      const newBlips: Blip[] = [];
      
      // Generate Klingon ships
      for (let i = 0; i < BATTLE_CONFIG.KLINGON_SHIPS; i++) {
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
      
      // Generate Federation ships
      for (let i = BATTLE_CONFIG.KLINGON_SHIPS; i < BATTLE_CONFIG.KLINGON_SHIPS + BATTLE_CONFIG.FEDERATION_SHIPS; i++) {
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
  }, []);

  // Klingon behavior
  useEffect(() => {
    const klingonInterval = setInterval(() => {
      setBlips(prevBlips => 
        prevBlips.map(blip => {
          if (blip.type === 'klingon') {
            if (!blip.isVisible && Math.random() < BATTLE_CONFIG.KLINGON_FADE_CHANCE) {
              const { x, y } = generateSafePosition();
              return {
                ...blip,
                x,
                y,
                isVisible: true,
                opacity: 0.7 + Math.random() * 0.3,
              };
            } else if (blip.isVisible && Math.random() < BATTLE_CONFIG.KLINGON_CLOAK_CHANCE) {
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
    }, BATTLE_CONFIG.KLINGON_FADE_INTERVAL);

    return () => clearInterval(klingonInterval);
  }, []);

  // Combat and movement
  useEffect(() => {
    const chaseInterval = setInterval(() => {
      setBlips(prevBlips => {
        const klingons = prevBlips.filter(b => b.type === 'klingon' && b.isVisible);
        const federations = prevBlips.filter(b => b.type === 'federation');
        
        // Combat logic
        federations.forEach(fed => {
          klingons.forEach(klingon => {
            const distance = calculateDistance(fed.x, fed.y, klingon.x, klingon.y);
            
            if (distance < BATTLE_CONFIG.COMBAT_RANGE && Math.random() < BATTLE_CONFIG.FEDERATION_FIRE_CHANCE) {
              fireLaser(fed, klingon);
            }
          });
        });

        klingons.forEach(klingon => {
          federations.forEach(fed => {
            const distance = calculateDistance(klingon.x, klingon.y, fed.x, fed.y);
            
            if (distance < BATTLE_CONFIG.KLINGON_COMBAT_RANGE && Math.random() < BATTLE_CONFIG.KLINGON_FIRE_CHANCE) {
              fireLaser(klingon, fed);
            }
          });
        });
        
        // Movement logic
        return prevBlips.map(blip => {
          if (blip.type === 'federation') {
            let targetX, targetY;
            
            if (klingons.length > 0) {
              const nearestKlingon = klingons.reduce((nearest, klingon) => {
                const distToCurrent = calculateDistance(blip.x, blip.y, klingon.x, klingon.y);
                const distToNearest = calculateDistance(blip.x, blip.y, nearest.x, nearest.y);
                return distToCurrent < distToNearest ? klingon : nearest;
              });
              targetX = nearestKlingon.x;
              targetY = nearestKlingon.y;
            } else {
              if (!blip.targetX || !blip.targetY || Math.random() < BATTLE_CONFIG.PATROL_CHANGE_CHANCE) {
                const { x, y } = generateSafePosition();
                targetX = x;
                targetY = y;
              } else {
                targetX = blip.targetX;
                targetY = blip.targetY;
              }
            }

            const deltaX = targetX - blip.x;
            const deltaY = targetY - blip.y;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > BATTLE_CONFIG.PATROL_DISTANCE) {
              let newX = blip.x + (deltaX / distance) * BATTLE_CONFIG.SHIP_SPEED;
              let newY = blip.y + (deltaY / distance) * BATTLE_CONFIG.SHIP_SPEED;

              if (newX > 25 && newX < 75 && newY > 20 && newY < 80) {
                if (newX < 50) {
                  newX = Math.max(5, newX - 2);
                } else {
                  newX = Math.min(95, newX + 2);
                }
              }

              newX = clampToViewport(newX);
              newY = clampToViewport(newY);

              return {
                ...blip,
                x: newX,
                y: newY,
                targetX,
                targetY,
              };
            }
          }
          return blip;
        });
      });
    }, BATTLE_CONFIG.CHASE_INTERVAL);

    return () => clearInterval(chaseInterval);
  }, []);

  return {
    blips,
    lasers,
    explosions,
    reticleInfo,
    setExplosions,
    handleMouseClick
  };
};
