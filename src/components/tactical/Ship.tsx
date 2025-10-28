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
  // Isometric conversion
  const isoScale = 0.866;
  const hexHeight = hexSize * Math.sqrt(3);
  const horizDist = hexSize * 2 * 0.75;
  
  const gridX = ship.position_x * horizDist;
  const gridY = ship.position_y * hexHeight + (ship.position_x % 2 === 1 ? hexHeight / 2 : 0);
  
  // Convert to isometric
  const toIso = (x: number, y: number) => ({
    x: (x - y) * isoScale,
    y: (x + y) * isoScale * 0.5
  });
  
  const iso = toIso(gridX, gridY);
  const x = iso.x + 600; // Center offset
  const y = iso.y + 200;

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
      {/* Shadow (cast on grid below) */}
      <Circle
        radius={22}
        y={15}
        fill="rgba(0, 0, 0, 0.4)"
        blur={8}
        opacity={0.6}
      />

      {/* Base glow */}
      <Circle
        radius={30}
        fill={teamColor}
        opacity={0.2}
        shadowColor={teamColor}
        shadowBlur={20}
        shadowOpacity={0.8}
      />

      {/* Ship Icon - with depth */}
      <Circle
        radius={20}
        y={-5}
        fill={teamColor}
        stroke="#ffffff"
        strokeWidth={2}
        opacity={ship.status === 'active' ? 1 : 0.5}
        shadowColor="rgba(0, 0, 0, 0.5)"
        shadowBlur={10}
        shadowOffsetY={3}
      />

      {/* Facing Arrow with glow */}
      <Arrow
        points={[0, -5, 30, -5]}
        rotation={ship.facing * 60}
        stroke="#ffffff"
        strokeWidth={2}
        fill="#ffffff"
        shadowColor="#ffffff"
        shadowBlur={5}
      />

      {/* Shield Bubble with animated glow */}
      {ship.shields > 0 && (
        <>
          <Circle
            radius={38}
            y={-5}
            stroke={shieldColor}
            strokeWidth={2}
            opacity={0.2}
            shadowColor={shieldColor}
            shadowBlur={15}
            shadowOpacity={0.6}
          />
          <Circle
            radius={35}
            y={-5}
            stroke={shieldColor}
            strokeWidth={3}
            opacity={0.5}
            shadowColor={shieldColor}
            shadowBlur={8}
          />
        </>
      )}

      {/* Hull Bar with 3D effect */}
      <Rect
        x={-40}
        y={-55}
        width={80}
        height={8}
        fill="#1f2937"
        cornerRadius={2}
        shadowColor="rgba(0, 0, 0, 0.5)"
        shadowBlur={3}
        shadowOffsetY={2}
      />
      <Rect
        x={-40}
        y={-55}
        width={80 * (ship.hull / ship.max_hull)}
        height={8}
        fill="#22c55e"
        cornerRadius={2}
        shadowColor="#22c55e"
        shadowBlur={5}
        shadowOpacity={0.6}
      />

      {/* Shield Bar with glow */}
      {ship.max_shields > 0 && (
        <>
          <Rect
            x={-40}
            y={-45}
            width={80}
            height={6}
            fill="#1f2937"
            cornerRadius={2}
            shadowColor="rgba(0, 0, 0, 0.5)"
            shadowBlur={2}
            shadowOffsetY={1}
          />
          <Rect
            x={-40}
            y={-45}
            width={80 * (ship.shields / ship.max_shields)}
            height={6}
            fill={shieldColor}
            cornerRadius={2}
            shadowColor={shieldColor}
            shadowBlur={6}
            shadowOpacity={0.8}
          />
        </>
      )}

      {/* Name with shadow */}
      <Text
        text={ship.name}
        x={-40}
        y={-72}
        width={80}
        align="center"
        fill="#ffffff"
        fontSize={12}
        fontStyle="bold"
        shadowColor="rgba(0, 0, 0, 0.8)"
        shadowBlur={4}
        shadowOffsetY={2}
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
