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

  // CGA Hercules colors
  const CGA_CYAN = '#00ffff';
  const CGA_MAGENTA = '#ff00ff';
  const CGA_WHITE = '#ffffff';
  const CGA_AMBER = '#ffaa00';

  // Shield color based on strength
  const shieldPercent = ship.shields / ship.max_shields;
  const shieldColor = shieldPercent > 0.5 
    ? CGA_CYAN
    : shieldPercent > 0.2 
    ? CGA_AMBER
    : CGA_MAGENTA;

  // Team color (Vectrex wire-frame style)
  const teamColor = ship.team === 'federation' 
    ? CGA_CYAN
    : ship.team === 'klingon' 
    ? CGA_MAGENTA
    : CGA_AMBER;

  return (
    <Group x={x} y={y} onClick={onClick}>
      {/* Wireframe ship body (diamond/square rotated) */}
      <Circle
        radius={18}
        y={-5}
        stroke={teamColor}
        strokeWidth={2}
        opacity={ship.status === 'active' ? 1 : 0.4}
        shadowColor={teamColor}
        shadowBlur={12}
        shadowOpacity={0.8}
      />

      {/* Inner detail lines */}
      <Circle
        radius={12}
        y={-5}
        stroke={teamColor}
        strokeWidth={1}
        opacity={0.6}
        shadowColor={teamColor}
        shadowBlur={6}
      />

      {/* Facing indicator (vector arrow) */}
      <Arrow
        points={[0, -5, 28, -5]}
        rotation={ship.facing * 60}
        stroke={CGA_WHITE}
        strokeWidth={2}
        pointerLength={8}
        pointerWidth={8}
        shadowColor={CGA_WHITE}
        shadowBlur={8}
      />

      {/* Shield bubble (CRT glow effect) */}
      {ship.shields > 0 && (
        <>
          <Circle
            radius={32}
            y={-5}
            stroke={shieldColor}
            strokeWidth={3}
            opacity={0.6}
            shadowColor={shieldColor}
            shadowBlur={18}
            shadowOpacity={0.9}
          />
          <Circle
            radius={28}
            y={-5}
            stroke={shieldColor}
            strokeWidth={1}
            opacity={0.3}
            dash={[4, 4]}
          />
        </>
      )}

      {/* Hull Bar (wireframe style) */}
      <Rect
        x={-40}
        y={-55}
        width={80}
        height={6}
        stroke={CGA_CYAN}
        strokeWidth={1}
      />
      <Rect
        x={-40}
        y={-55}
        width={80 * (ship.hull / ship.max_hull)}
        height={6}
        fill={CGA_CYAN}
        opacity={0.5}
        shadowColor={CGA_CYAN}
        shadowBlur={6}
      />

      {/* Shield Bar with CRT glow */}
      {ship.max_shields > 0 && (
        <>
          <Rect
            x={-40}
            y={-47}
            width={80}
            height={4}
            stroke={shieldColor}
            strokeWidth={1}
          />
          <Rect
            x={-40}
            y={-47}
            width={80 * (ship.shields / ship.max_shields)}
            height={4}
            fill={shieldColor}
            opacity={0.6}
            shadowColor={shieldColor}
            shadowBlur={8}
          />
        </>
      )}

      {/* Name with CRT phosphor glow */}
      <Text
        text={ship.name}
        x={-50}
        y={-70}
        width={100}
        align="center"
        fill={CGA_WHITE}
        fontSize={11}
        fontStyle="bold"
        shadowColor={teamColor}
        shadowBlur={6}
      />

      {/* AI indicator */}
      {!ship.captain_user_id && (
        <Text
          text="[AI]"
          x={-15}
          y={-85}
          width={30}
          align="center"
          fill={CGA_AMBER}
          fontSize={8}
          shadowColor={CGA_AMBER}
          shadowBlur={4}
        />
      )}

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
