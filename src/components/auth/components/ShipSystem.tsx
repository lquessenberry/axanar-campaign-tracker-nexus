
import { Blip } from '../types/battleTypes';
import FederationShipIcon from '../FederationShipIcon';
import KlingonShipIcon from '../KlingonShipIcon';
import ShieldEffect from './ShieldEffect';

interface ShipSystemProps {
  blips: Blip[];
}

const ShipSystem = ({ blips }: ShipSystemProps) => {
  // Federation ship registries for the 5 ships
  const federationRegistries = ['NCC-1650', 'NCC-1657', 'NCC-1653', 'NCC-1651', 'NCC-1668'];

  return (
    <>
      {/* Render ships */}
      {blips.map((blip, index) => (
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
          data-ship-type={blip.type}
          data-ship-index={blip.type === 'federation' ? index : index - 4}
        >
          {blip.type === 'federation' ? (
            <>
              {/* Federation ship shield effect */}
              {blip.shields !== undefined && (
                <ShieldEffect 
                  isActive={blip.shields > 0}
                  shieldStrength={blip.shields}
                  isHit={blip.shieldHit || false}
                />
              )}
              <FederationShipIcon size={32} className="text-axanar-teal" />
              {/* Federation ship label */}
              <div 
                className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/80 border border-axanar-teal/50 rounded px-2 py-1 text-xs text-axanar-teal font-mono whitespace-nowrap backdrop-blur-sm"
                style={{ fontSize: '10px' }}
              >
                {federationRegistries[index % federationRegistries.length]}
              </div>
            </>
          ) : (
            <>
              <KlingonShipIcon size={36} className="text-red-500" />
              {/* Klingon ship label */}
              <div 
                className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black/80 border border-red-500/50 rounded px-2 py-1 text-xs text-red-400 font-mono whitespace-nowrap backdrop-blur-sm"
                style={{ fontSize: '10px' }}
              >
                Unknown D7 Battlecruiser
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
};

export default ShipSystem;
