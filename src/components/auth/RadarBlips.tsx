
import React from 'react';
import { useBattleLogic } from './hooks/useBattleLogic';
import ShipSystem from './components/ShipSystem';
import LaserSystem from './components/LaserSystem';
import TorpedoSystem from './components/TorpedoSystem';
import ExplosionSystem from './components/ExplosionSystem';
import ReticleInfo from './components/ReticleInfo';

const RadarBlips = () => {
  const {
    blips,
    lasers,
    torpedoes,
    explosions,
    reticleInfo,
    setExplosions,
    handleMouseClick
  } = useBattleLogic();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle clicks if they're not on interactive elements
    const target = e.target as Element;
    if (target.closest('[data-card]') || target.closest('button') || target.closest('a')) {
      return;
    }
    handleMouseClick(e);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Click handler only for the main area where battle effects should work */}
      <div 
        className="absolute inset-0 pointer-events-auto cursor-crosshair"
        onClick={handleClick}
      >
        {/* This div captures clicks for battle mechanics only */}
      </div>
      
      {/* All battle visual elements */}
      <ShipSystem blips={blips} />
      <ReticleInfo reticleInfo={reticleInfo} />
      <LaserSystem lasers={lasers} />
      <TorpedoSystem torpedoes={torpedoes} />
      <ExplosionSystem explosions={explosions} setExplosions={setExplosions} />
    </div>
  );
};

export default RadarBlips;
