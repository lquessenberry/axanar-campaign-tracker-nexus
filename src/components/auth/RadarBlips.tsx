
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
    <div className="absolute inset-0 pointer-events-none">
      {/* Only capture clicks within the main content area, not nav/footer */}
      <div 
        className="absolute top-0 left-0 right-0 bottom-0 pointer-events-auto cursor-crosshair"
        onClick={handleClick}
        style={{
          // Constrain to just the main content area
          top: '0',
          left: '0',
          right: '0', 
          bottom: '0'
        }}
      >
        {/* Battle elements only respond to clicks within this div */}
      </div>
      <ShipSystem blips={blips} />
      <ReticleInfo reticleInfo={reticleInfo} />
      <LaserSystem lasers={lasers} />
      <ExplosionSystem explosions={explosions} setExplosions={setExplosions} />
    </div>
  );
};

export default RadarBlips;
