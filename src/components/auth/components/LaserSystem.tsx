
import { Laser } from '../types/battleTypes';

interface LaserSystemProps {
  lasers: Laser[];
}

const LaserSystem = ({ lasers }: LaserSystemProps) => {
  return (
    <>
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
    </>
  );
};

export default LaserSystem;
