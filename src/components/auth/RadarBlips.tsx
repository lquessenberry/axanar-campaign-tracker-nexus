
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

  return (
    <div 
      className="absolute inset-0 z-0 cursor-crosshair"
      onClick={handleMouseClick}
      style={{ 
        pointerEvents: 'none',
        backgroundColor: 'transparent'
      }}
    >
      {/* Click capture layer - only captures clicks in empty space within main */}
      <div 
        className="absolute inset-0"
        style={{ 
          pointerEvents: 'auto',
          backgroundColor: 'transparent'
        }}
        onClickCapture={handleMouseClick}
      />
      
      <ShipSystem blips={blips} />
      <ReticleInfo reticleInfo={reticleInfo} />
      <LaserSystem lasers={lasers} />
      <ExplosionSystem explosions={explosions} setExplosions={setExplosions} />
    </div>
  );
};

export default RadarBlips;
