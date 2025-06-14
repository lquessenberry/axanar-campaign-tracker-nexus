
import { useEffect } from 'react';
import { Explosion } from '../types/battleTypes';

interface ExplosionSystemProps {
  explosions: Explosion[];
  setExplosions: React.Dispatch<React.SetStateAction<Explosion[]>>;
}

const ExplosionSystem = ({ explosions, setExplosions }: ExplosionSystemProps) => {
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
  }, [setExplosions]);

  return (
    <>
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
    </>
  );
};

export default ExplosionSystem;
