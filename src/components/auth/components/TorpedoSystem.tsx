
import React from 'react';
import { Torpedo } from '../types/battleTypes';

interface TorpedoSystemProps {
  torpedoes: Torpedo[];
}

const TorpedoSystem = ({ torpedoes }: TorpedoSystemProps) => {
  return (
    <>
      {torpedoes.map((torpedo) => (
        <div
          key={torpedo.id}
          className="absolute pointer-events-none"
          style={{
            left: `${torpedo.x}%`,
            top: `${torpedo.y}%`,
            opacity: torpedo.opacity,
            zIndex: 4,
          }}
        >
          {/* Torpedo visual */}
          <div 
            className={`w-2 h-6 rounded-full ${
              torpedo.type === 'klingon' ? 'bg-red-500' : 'bg-blue-400'
            } shadow-lg`}
            style={{
              boxShadow: `0 0 8px ${torpedo.color}`,
              transform: 'rotate(45deg)'
            }}
          />
          
          {/* Torpedo trail */}
          <div 
            className="absolute top-1/2 left-1/2 w-8 h-0.5 opacity-60"
            style={{
              background: `linear-gradient(90deg, ${torpedo.color}, transparent)`,
              transform: 'translate(-50%, -50%) rotate(45deg)',
              zIndex: -1
            }}
          />
        </div>
      ))}
    </>
  );
};

export default TorpedoSystem;
