import React from 'react';
import { Group, Circle, Rect, Text, Arrow, Image as KonvaImage } from 'react-konva';
import { TacticalShip } from '@/types/tactical';
import useImage from 'use-image';

interface ShipProps {
  ship: TacticalShip;
  hexSize?: number;
  onClick?: () => void;
}

export const Ship: React.FC<ShipProps> = ({ ship, hexSize = 50, onClick }) => {
  const hexHeight = hexSize * Math.sqrt(3);
  const horizDist = hexSize * 2 * 0.75;
  
  const x = ship.position_x * horizDist + hexSize;
  const y = ship.position_y * hexHeight + (ship.position_x % 2 === 1 ? hexHeight / 2 : 0) + hexHeight / 2;

  // Shield color based on shield strength
  const shieldPercent = ship.shields / ship.max_shields;
  const shieldColor = shieldPercent > 0.5 
    ? '#22c55e'  // green
    : shieldPercent > 0.2 
    ? '#eab308'  // yellow
    : '#ef4444'; // red

  // Team color
  const teamColor = ship.team === 'federation' 
    ? '#3b82f6'  // blue
    : ship.team === 'klingon' 
    ? '#dc2626'  // red
    : '#9ca3af'; // gray

  return (
    <Group x={x} y={y} onClick={onClick}>
      {/* Ship Icon (placeholder circle for now) */}
      <Circle
        radius={20}
        fill={teamColor}
        stroke="#ffffff"
        strokeWidth={2}
        opacity={ship.status === 'active' ? 1 : 0.5}
      />

      {/* Facing Arrow */}
      <Arrow
        points={[0, 0, 30, 0]}
        rotation={ship.facing * 60}
        stroke="#ffffff"
        strokeWidth={2}
        fill="#ffffff"
      />

      {/* Shield Bubble */}
      {ship.shields > 0 && (
        <Circle
          radius={35}
          stroke={shieldColor}
          strokeWidth={3}
          opacity={0.4}
        />
      )}

      {/* Hull Bar */}
      <Rect
        x={-40}
        y={-50}
        width={80}
        height={6}
        fill="#374151"
      />
      <Rect
        x={-40}
        y={-50}
        width={80 * (ship.hull / ship.max_hull)}
        height={6}
        fill="#22c55e"
      />

      {/* Shield Bar */}
      {ship.max_shields > 0 && (
        <>
          <Rect
            x={-40}
            y={-42}
            width={80}
            height={4}
            fill="#374151"
          />
          <Rect
            x={-40}
            y={-42}
            width={80 * (ship.shields / ship.max_shields)}
            height={4}
            fill={shieldColor}
          />
        </>
      )}

      {/* Name */}
      <Text
        text={ship.name}
        x={-40}
        y={-65}
        width={80}
        align="center"
        fill="#ffffff"
        fontSize={12}
        fontStyle="bold"
      />

      {/* Status indicator */}
      {ship.status === 'destroyed' && (
        <Text
          text="💥"
          x={-15}
          y={-10}
          fontSize={30}
        />
      )}
    </Group>
  );
};
