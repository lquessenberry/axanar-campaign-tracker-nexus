
import React from 'react';
import { useBattleLogic } from './hooks/useBattleLogic';
import ShipSystem from './components/ShipSystem';
import LaserSystem from './components/LaserSystem';
import ExplosionSystem from './components/ExplosionSystem';
import ReticleInfo from './components/ReticleInfo';

const RadarBlips = () => {
  const {
    blips,
    lasers,
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
    <div 
      className="absolute inset-0 z-0 cursor-crosshair"
      onClick={handleClick}
      style={{ 
        pointerEvents: 'none'
      }}
    >
      <div 
        className="absolute inset-0"
        style={{ 
          pointerEvents: 'auto'
        }}
        onClick={handleClick}
      >
        {/* Battle elements only respond to clicks within this inner div */}
      </div>
      <ShipSystem blips={blips} />
      <ReticleInfo reticleInfo={reticleInfo} />
      <LaserSystem lasers={lasers} />
      <ExplosionSystem explosions={explosions} setExplosions={setExplosions} />
    </div>
  );
};

export default RadarBlips;
