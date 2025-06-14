
import { Blip } from '../types/battleTypes';
import FederationShipIcon from '../FederationShipIcon';
import KlingonShipIcon from '../KlingonShipIcon';

interface ShipSystemProps {
  blips: Blip[];
}

const ShipSystem = ({ blips }: ShipSystemProps) => {
  return (
    <>
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
