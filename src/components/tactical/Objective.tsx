import React from 'react';
import { Group, Circle, Star, Rect, Text, Ring } from 'react-konva';
import { TacticalObjective } from '@/types/tactical';

interface ObjectiveProps {
  objective: TacticalObjective;
  hexSize?: number;
  onClick?: () => void;
}

// CGA Hercules colors
const CGA_COLORS = {
  cyan: '#00ffff',
  magenta: '#ff00ff',
  white: '#ffffff',
  amber: '#ffaa00',
  black: '#000000',
};

export const Objective: React.FC<ObjectiveProps> = ({ objective, hexSize = 50, onClick }) => {
  // Isometric conversion
  const isoScale = 0.866;
  const hexHeight = hexSize * Math.sqrt(3);
  const horizDist = hexSize * 2 * 0.75;
  
  const gridX = objective.position_x * horizDist;
  const gridY = objective.position_y * hexHeight + (objective.position_x % 2 === 1 ? hexHeight / 2 : 0);
  
  const toIso = (x: number, y: number) => ({
    x: (x - y) * isoScale,
    y: (x + y) * isoScale * 0.5
  });
  
  const iso = toIso(gridX, gridY);
  const x = iso.x + 600;
  const y = iso.y + 200;

  // Color based on control
  const color = objective.controlled_by === 'federation' 
    ? CGA_COLORS.cyan 
    : objective.controlled_by === 'klingon' 
    ? CGA_COLORS.magenta 
    : CGA_COLORS.amber;

  const renderIcon = () => {
    switch (objective.type) {
      case 'capture_point':
        return (
          <>
            {/* Pulsing outer ring */}
            <Ring
              innerRadius={25}
              outerRadius={30}
              stroke={color}
              strokeWidth={2}
              opacity={0.6}
              shadowColor={color}
              shadowBlur={15}
            />
            {/* Inner circle */}
            <Circle
              radius={20}
              stroke={color}
              strokeWidth={3}
              shadowColor={color}
              shadowBlur={10}
            />
            {/* Center cross */}
            <Rect x={-2} y={-15} width={4} height={30} fill={color} />
            <Rect x={-15} y={-2} width={30} height={4} fill={color} />
          </>
        );
      
      case 'rally_point':
        return (
          <>
            {/* Flag pole */}
            <Rect x={-2} y={-20} width={4} height={40} fill={color} />
            {/* Flag */}
            <Rect
              x={2}
              y={-20}
              width={15}
              height={12}
              stroke={color}
              strokeWidth={2}
              shadowColor={color}
              shadowBlur={8}
            />
            {/* Base */}
            <Circle
              radius={8}
              y={20}
              stroke={color}
              strokeWidth={2}
              shadowColor={color}
              shadowBlur={6}
            />
          </>
        );
      
      case 'waypoint':
        return (
          <Star
            numPoints={4}
            innerRadius={10}
            outerRadius={25}
            rotation={45}
            stroke={color}
            strokeWidth={3}
            shadowColor={color}
            shadowBlur={12}
          />
        );
      
      case 'zone':
        return (
          <>
            {/* Zone boundary */}
            <Circle
              radius={objective.radius * 25}
              stroke={color}
              strokeWidth={2}
              opacity={0.4}
              dash={[5, 5]}
              shadowColor={color}
              shadowBlur={8}
            />
            {/* Center marker */}
            <Circle
              radius={8}
              stroke={color}
              strokeWidth={3}
              shadowColor={color}
              shadowBlur={10}
            />
          </>
        );
      
      case 'artifact':
        return (
          <Star
            numPoints={6}
            innerRadius={12}
            outerRadius={20}
            stroke={color}
            strokeWidth={2}
            shadowColor={color}
            shadowBlur={15}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <Group x={x} y={y} onClick={onClick}>
      {/* Glow base */}
      <Circle
        radius={35}
        fill={color}
        opacity={0.1}
        shadowColor={color}
        shadowBlur={25}
      />
      
      {renderIcon()}

      {/* Name label with CRT glow */}
      <Text
        text={objective.name}
        x={-50}
        y={-50}
        width={100}
        align="center"
        fill={CGA_COLORS.white}
        fontSize={10}
        fontStyle="bold"
        shadowColor={CGA_COLORS.cyan}
        shadowBlur={6}
      />

      {/* Victory points indicator */}
      {objective.victory_points > 0 && (
        <Text
          text={`+${objective.victory_points}`}
          x={-20}
          y={25}
          width={40}
          align="center"
          fill={CGA_COLORS.amber}
          fontSize={9}
          shadowColor={CGA_COLORS.amber}
          shadowBlur={8}
        />
      )}
    </Group>
  );
};