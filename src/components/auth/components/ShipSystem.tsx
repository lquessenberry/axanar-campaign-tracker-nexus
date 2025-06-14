
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
            <KlingonShipIcon size={36} className="text-red-500" />
          )}
        </div>
      ))}
    </>
  );
};

export default ShipSystem;
